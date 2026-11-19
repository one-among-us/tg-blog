import {describe, expect, test} from 'bun:test'
import {createHash} from 'node:crypto'
import {
  normalizeTelegramBotUsername,
  resolvePostsUrl,
  resolveRelativeUrl,
  sanitizeAvatarUrl,
} from '../src/logic/url'
import {solveAltchaChallenge} from '../src/logic/altcha'
import {
  applyCommentDeleteInList,
  applyOptimisticReactionToggle,
  formatPostDate,
  mergePostsWithLive,
  mergePublicPoll,
  mergePublicReactions,
  removeDeletedPost,
  shouldIncrementCommentCount,
  sortedNumberArraysEqual,
  upsertCommentInList,
} from '../src/logic/state'
import {LifeStreamClient, sanitizeCommentHtml} from '../src/logic/api'
import type {CommentDTO, MergedPoll, MergedReaction, Post} from '../src/logic/models'
import moment from 'moment'

describe('url.ts — SSR & client hydration consistency', () => {
  test('root-relative base produces identical output on SSR and client', () => {
    const ssrPosts = resolvePostsUrl('/api/life/exports/posts.json')
    const ssrImg = resolveRelativeUrl('../media/epochs/1/photo.webp', '/api/life/exports/posts.json')
    const ssrNested = resolveRelativeUrl('emoji/12345.webp', '/api/life/exports/posts.json')

    expect(ssrPosts).toBe('/api/life/exports/posts.json')
    expect(ssrImg).toBe('/api/life/media/epochs/1/photo.webp')
    expect(ssrNested).toBe('/api/life/exports/emoji/12345.webp')

    // Simulate client document.location.href
    const origDoc = (globalThis as any).document
    ;(globalThis as any).document = {location: {href: 'https://example.com/life?lang=en'}}
    try {
      expect(resolvePostsUrl('/api/life/exports/posts.json')).toBe(ssrPosts)
      expect(resolveRelativeUrl('../media/epochs/1/photo.webp', '/api/life/exports/posts.json')).toBe(ssrImg)
      expect(resolveRelativeUrl('emoji/12345.webp', '/api/life/exports/posts.json')).toBe(ssrNested)

      // Non-root-relative base on client resolves against document.location.href
      expect(resolvePostsUrl('data/posts.json')).toBe('https://example.com/data/posts.json')
      expect(resolveRelativeUrl('img.webp', 'data/posts.json')).toBe('https://example.com/data/img.webp')
    } finally {
      if (origDoc === undefined) delete (globalThis as any).document
      else (globalThis as any).document = origDoc
    }
  })

  test('sanitizeAvatarUrl allows only safe http(s) and single-slash paths', () => {
    expect(sanitizeAvatarUrl('https://avatars.githubusercontent.com/u/1')).toBe('https://avatars.githubusercontent.com/u/1')
    expect(sanitizeAvatarUrl('http://localhost:8000/a.png')).toBe('http://localhost:8000/a.png')
    expect(sanitizeAvatarUrl('/api/life/media/avatar.png')).toBe('/api/life/media/avatar.png')
    expect(sanitizeAvatarUrl('//evil.com/tracker.png')).toBeNull()
    expect(sanitizeAvatarUrl('javascript:alert(1)')).toBeNull()
    expect(sanitizeAvatarUrl('data:image/svg+xml,<svg/>')).toBeNull()
    expect(sanitizeAvatarUrl('')).toBeNull()
    expect(sanitizeAvatarUrl(null)).toBeNull()
  })

  test('normalizeTelegramBotUsername strips @ and validates characters', () => {
    expect(normalizeTelegramBotUsername('@My_Life_Bot')).toBe('My_Life_Bot')
    expect(normalizeTelegramBotUsername('life_bot123')).toBe('life_bot123')
    expect(normalizeTelegramBotUsername('bad bot')).toBeNull()
    expect(normalizeTelegramBotUsername('bad"xss')).toBeNull()
    expect(normalizeTelegramBotUsername('')).toBeNull()
  })
})

describe('altcha.ts — browser PoW solver', () => {
  test('solves valid SHA-256 challenge and returns base64 JSON payload', async () => {
    const salt = 'unit-test-salt?'
    const targetNumber = 1234
    const hash = createHash('sha256').update(`${salt}${targetNumber}`).digest('hex')

    const {payload, solution} = await solveAltchaChallenge({
      algorithm: 'SHA-256',
      challenge: hash,
      maxnumber: 5000,
      salt,
      signature: 'sig-xyz',
    })

    expect(solution.number).toBe(targetNumber)
    expect(solution.challenge).toBe(hash)
    expect(solution.signature).toBe('sig-xyz')

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    expect(decoded.number).toBe(targetNumber)
    expect(decoded.salt).toBe(salt)
  })

  test('aborts immediately when AbortSignal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      solveAltchaChallenge(
        {algorithm: 'SHA-256', challenge: '0'.repeat(64), maxnumber: 1000, salt: 's', signature: 'x'},
        controller.signal
      )
    ).rejects.toThrow()
  })

  test('rejects when maxnumber is exceeded without a solution', async () => {
    await expect(
      solveAltchaChallenge({
        algorithm: 'SHA-256',
        challenge: 'f'.repeat(64),
        maxnumber: 10,
        salt: 'nosolve',
        signature: 'x',
      })
    ).rejects.toThrow(/maxnumber/)
  })
})

describe('api.ts — sanitizeCommentHtml XSS defense', () => {
  test('strips script tags, event handlers, javascript:, and protocol-relative URLs', () => {
    const dirty = [
      '<p>Hello <script>alert(1)</script>',
      '<img src="x" onerror="alert(2)">',
      '<iframe src="https://evil.example"></iframe>',
      '<a href="javascript:alert(3)">js-link</a>',
      '<a href="//evil.example/phish">proto-rel</a>',
      '<a href="https://example.com/ok">safe-link</a></p>',
    ].join('')

    const clean = sanitizeCommentHtml(dirty, '')
    expect(clean).not.toContain('<script')
    expect(clean).not.toContain('<iframe')
    expect(clean).not.toContain('onerror')
    expect(clean).not.toContain('javascript:')
    expect(clean).not.toContain('//evil.example')
    expect(clean).toContain('href="https://example.com/ok"')
    expect(clean).toContain('target="_blank"')
    expect(clean).toContain('rel="noopener noreferrer nofollow"')
  })

  test('escapes plain body_text fallback cleanly', () => {
    const clean = sanitizeCommentHtml('', '<b>1 < 2 & 3 > 1</b>\nline2')
    expect(clean).toBe('&lt;b&gt;1 &lt; 2 &amp; 3 &gt; 1&lt;/b&gt;<br>line2')
  })
})

describe('state.ts — reactions, polls, and comments merging', () => {
  test('applyOptimisticReactionToggle adds, toggles, and cleans up zero web-only reactions', () => {
    const initial: MergedReaction[] = [
      {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 3, web_count: 0, count: 3, reacted: false},
    ]

    // Toggle existing TG reaction ON
    const step1 = applyOptimisticReactionToggle(initial, {emoji: '❤️'})
    expect(step1[0].reacted).toBe(true)
    expect(step1[0].web_count).toBe(1)
    expect(step1[0].count).toBe(4)

    // Toggle back OFF -> keeps because tg_count = 3
    const step2 = applyOptimisticReactionToggle(step1, {emoji: '❤️'})
    expect(step2[0].reacted).toBe(false)
    expect(step2[0].web_count).toBe(0)
    expect(step2[0].count).toBe(3)

    // Add brand-new web reaction
    const step3 = applyOptimisticReactionToggle(step2, {emoji: '🔥'})
    expect(step3.length).toBe(2)
    expect(step3[1]).toMatchObject({reaction_key: 'e:🔥', count: 1, web_count: 1, tg_count: 0, reacted: true})

    // Remove brand-new web reaction -> spliced out completely
    const step4 = applyOptimisticReactionToggle(step3, {emoji: '🔥'})
    expect(step4.length).toBe(1)
  })

  test('mergePublicReactions preserves local reacted flags', () => {
    const existing: MergedReaction[] = [
      {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 2, web_count: 1, count: 3, reacted: true},
    ]
    const merged = mergePublicReactions(existing, [
      {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 2, web_count: 5, count: 7},
      {reaction_key: 'e:🎉', emoji: '🎉', custom_emoji_id: null, tg_count: 0, web_count: 1, count: 1},
    ])
    expect(merged[0].reacted).toBe(true)
    expect(merged[0].count).toBe(7)
    expect(merged[1].reacted).toBe(false)
  })

  test('mergePublicPoll preserves local my_votes, correct_option_idx, and explanation', () => {
    const existing: MergedPoll = {
      id: 'p1',
      question: 'Q?',
      is_closed: false,
      is_anonymous: true,
      type: 'QUIZ',
      allow_multiple_answers: false,
      total_voter_count: 5,
      my_votes: [1],
      correct_option_idx: 1,
      explanation: 'Because!',
      options: [{idx: 0, text: 'A', tg_voter_count: 2, web_voter_count: 0, voter_count: 2}],
    }
    const merged = mergePublicPoll(existing, {
      id: 'p1',
      question: 'Q?',
      is_closed: false,
      is_anonymous: true,
      type: 'QUIZ',
      allow_multiple_answers: false,
      total_voter_count: 6,
      correct_option_idx: null,
      explanation: null,
      options: [{idx: 0, text: 'A', tg_voter_count: 2, web_voter_count: 1, voter_count: 3}],
    })
    expect(merged.total_voter_count).toBe(6)
    expect(merged.my_votes).toEqual([1])
    expect(merged.correct_option_idx).toBe(1)
    expect(merged.explanation).toBe('Because!')
  })

  const makeComment = (overrides: Partial<CommentDTO> = {}): CommentDTO => ({
    id: 1,
    post_id: 10,
    parent_id: null,
    source: 'web',
    author: {display_name: 'Alice', role: 'user', verified: true},
    body_text: 'hi',
    body_html: '<p>hi</p>',
    created_at: '2026-11-19T10:00:00Z',
    deleted: false,
    is_mine: false,
    can_delete: false,
    ...overrides,
  })

  test('upsertCommentInList preserves is_mine and can_delete across SSE broadcast', () => {
    const localCreated = makeComment({id: 42, is_mine: true, can_delete: true})
    const sseBroadcast = makeComment({id: 42, is_mine: false, can_delete: false, body_html: '<p>hi updated</p>'})
    const updated = upsertCommentInList([localCreated], sseBroadcast)
    expect(updated.length).toBe(1)
    expect(updated[0].is_mine).toBe(true)
    expect(updated[0].can_delete).toBe(true)
    expect(updated[0].body_html).toBe('<p>hi updated</p>')
  })

  test('applyCommentDeleteInList tombstones parents with live children and prunes childless tombstones', () => {
    const root = makeComment({id: 1, parent_id: null})
    const child = makeComment({id: 2, parent_id: 1})

    // Deleting root while child is alive turns root into tombstone
    const afterRootDelete = applyCommentDeleteInList([root, child], 1)
    expect(afterRootDelete.length).toBe(2)
    expect(afterRootDelete[0].deleted).toBe(true)
    expect(afterRootDelete[0].can_delete).toBe(false)

    // Deleting child now leaves tombstone root childless -> BOTH are pruned!
    const afterChildDelete = applyCommentDeleteInList(afterRootDelete, 2)
    expect(afterChildDelete.length).toBe(0)
  })

  test('shouldIncrementCommentCount prevents double-counting seen IDs and pre-hydration replays', () => {
    const seen = new Set<number>([10])
    const hydratedAt = Date.parse('2026-11-19T10:00:00Z')

    // Already seen ID -> false
    expect(shouldIncrementCommentCount(seen, hydratedAt, {id: 10, created_at: '2026-11-19T10:01:00Z'})).toBe(false)
    // Pre-hydration replay -> false
    expect(shouldIncrementCommentCount(seen, hydratedAt, {id: 11, created_at: '2026-11-19T09:59:59Z'})).toBe(false)
    // Brand-new comment after hydration -> true
    expect(shouldIncrementCommentCount(seen, hydratedAt, {id: 12, created_at: '2026-11-19T10:00:05Z'})).toBe(true)
  })

  test('sortedNumberArraysEqual compares arrays order-insensitively', () => {
    expect(sortedNumberArraysEqual([2, 0], [0, 2])).toBe(true)
    expect(sortedNumberArraysEqual([0], [0, 1])).toBe(false)
    expect(sortedNumberArraysEqual([], [])).toBe(true)
  })

  test('formatPostDate formats deterministically in UTC before mount and local after mount', () => {
    const iso = '2026-11-19T08:15:00Z'
    const fmt = 'YYYY-MM-DD H:mm'
    expect(formatPostDate(iso, fmt, false)).toBe('2026-11-19 8:15')
    expect(formatPostDate(iso, fmt, true)).toBe(moment(iso).format(fmt))
  })

  test('mergePostsWithLive retains SSE post.created posts and respects deletedPostIds on postsData upgrade', () => {
    const incoming: Post[] = [
      {id: 1, date: '2026-11-19T01:00:00Z', text: 'old-1'},
      {id: 2, date: '2026-11-19T02:00:00Z', text: 'service', type: 'service'},
      {id: 3, date: '2026-11-19T03:00:00Z', text: 'old-3'},
      {id: 4, date: '2026-11-19T04:00:00Z', text: 'deleted-via-sse'},
      {id: 5, date: '2026-11-19T05:00:00Z', text: 'canonical-5'},
    ]
    const sseLive: Post[] = [
      {id: 5, date: '2026-11-19T05:00:00Z', text: 'live-dup-5'},
      {id: 6, date: '2026-11-19T06:00:00Z', text: 'live-only-6'},
    ]
    const deletedIds = new Set<number>([4])

    const merged = mergePostsWithLive(incoming, sseLive, deletedIds)
    expect(merged.map(p => p.id)).toEqual([6, 5, 3, 1])
    // Canonical snapshot wins for id=5 while live-only id=6 is preserved at top
    expect(merged[0].text).toBe('live-only-6')
    expect(merged[1].text).toBe('canonical-5')
  })

  test('removeDeletedPost removes matching post without mutating original array', () => {
    const list: Post[] = [
      {id: 3, date: '2026-11-19T03:00:00Z', text: 'c'},
      {id: 2, date: '2026-11-19T02:00:00Z', text: 'b'},
      {id: 1, date: '2026-11-19T01:00:00Z', text: 'a'},
    ]
    const after = removeDeletedPost(list, 2)
    expect(after.map(p => p.id)).toEqual([3, 1])
    expect(list.map(p => p.id)).toEqual([3, 2, 1])
    // Missing ID returns same reference
    expect(removeDeletedPost(list, 999)).toBe(list)
  })
})

describe('LifeStreamClient — post.deleted event handling', () => {
  test('dispatches post.deleted SSE payloads to onPostDeleted handler', () => {
    const listeners = new Map<string, (ev: Event) => void>()
    class MockEventSource {
      static CLOSED = 2
      readyState = 1
      onopen: (() => void) | null = null
      onerror: ((ev: Event) => void) | null = null
      addEventListener(type: string, cb: (ev: Event) => void) {
        listeners.set(type, cb)
      }
      close() {
        this.readyState = 2
      }
    }

    const origWin = (globalThis as any).window
    const origES = (globalThis as any).EventSource
    ;(globalThis as any).window = {}
    ;(globalThis as any).EventSource = MockEventSource

    try {
      const deleted: number[] = []
      const client = new LifeStreamClient('/api/life', {
        onPostDeleted: (ev) => deleted.push(ev.post_id),
      })
      client.connect()

      const handler = listeners.get('post.deleted')
      expect(handler).toBeDefined()
      handler!({data: JSON.stringify({post_id: 77}), lastEventId: 'evt-9'} as unknown as Event)
      expect(deleted).toEqual([77])
      client.close()
    } finally {
      if (origWin === undefined) delete (globalThis as any).window
      else (globalThis as any).window = origWin
      if (origES === undefined) delete (globalThis as any).EventSource
      else (globalThis as any).EventSource = origES
    }
  })
})
