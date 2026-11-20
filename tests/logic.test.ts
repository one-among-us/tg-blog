import {describe, expect, test} from 'bun:test'
import {createHash} from 'node:crypto'
import {gzipSync} from 'node:zlib'
import {
  isSafeMediaUrl,
  normalizeTelegramBotUsername,
  resolvePostsUrl,
  resolveRelativeUrl,
  sanitizeAvatarUrl,
} from '../src/logic/url'
import {solveAltchaChallenge} from '../src/logic/altcha'
import {
  applyCommentDeleteInList,
  applyOptimisticCommentReactionToggle,
  applyOptimisticReactionToggle,
  buildChatMessages,
  formatCommentShortDate,
  formatPostDate,
  mergeCommentReactionsInList,
  mergePostsWithLive,
  mergePublicPoll,
  mergePublicReactions,
  removeDeletedPost,
  shouldIncrementCommentCount,
  sortedNumberArraysEqual,
  upsertCommentInList,
} from '../src/logic/state'
import {
  DEFAULT_APPLE_EMOJI_BASE_URL,
  getAppleEmojiCandidates,
  replaceTextEmojisWithApple,
} from '../src/logic/appleEmoji'
import {
  clearTgsCacheForTests,
  decompressGzipBytesBounded,
  fetchTgsAnimationData,
  MAX_TGS_COMPRESSED_BYTES,
  MAX_TGS_DECOMPRESSED_BYTES,
} from '../src/logic/tgs'
import {defaultMessages} from '../src/logic/messages'
import {
  buildAvailableReactions,
  canonicalReactionKey,
  CURATED_REACTIONS,
  extractCustomEmojiAssets,
  inferEpochEmojiBase,
  TELEGRAM_CHANNEL_REACTIONS,
} from '../src/logic/reactions'
import {LifeApiClient, LifeStreamClient, sanitizeCommentHtml} from '../src/logic/api'
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

  test('resolveRelativeUrl & isSafeMediaUrl reject unsafe schemes and protocol-relative URLs', () => {
    expect(resolveRelativeUrl('javascript:alert(1)', '/api/life/exports/posts.json')).toBe('')
    expect(resolveRelativeUrl('vbscript:msgbox(1)', '/api/life/exports/posts.json')).toBe('')
    expect(resolveRelativeUrl('data:text/html,<script>', '/api/life/exports/posts.json')).toBe('')
    expect(resolveRelativeUrl('//evil.example/a.png', '/api/life/exports/posts.json')).toBe('')
    expect(isSafeMediaUrl('https://cdn.example.com/a.webp')).toBe(true)
    expect(isSafeMediaUrl('/api/life/media/a.webp')).toBe(true)
    expect(isSafeMediaUrl('//evil.example/a.webp')).toBe(false)
    expect(isSafeMediaUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeMediaUrl('data:image/svg+xml,<svg/>')).toBe(false)
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

  test('upsertCommentInList preserves is_mine, can_delete, and existing reactions across SSE replay', () => {
    const existingReaction: MergedReaction = {
      reaction_key: 'e:❤️',
      emoji: '❤️',
      custom_emoji_id: null,
      tg_count: 1,
      web_count: 0,
      count: 1,
      reacted: true,
    }
    const localCreated = makeComment({
      id: 42,
      is_mine: true,
      can_delete: true,
      reactions: [existingReaction],
    })
    const sseBroadcast = makeComment({
      id: 42,
      is_mine: false,
      can_delete: false,
      body_html: '<p>hi updated</p>',
      reactions: [],
    })
    const updated = upsertCommentInList([localCreated], sseBroadcast)
    expect(updated.length).toBe(1)
    expect(updated[0].is_mine).toBe(true)
    expect(updated[0].can_delete).toBe(true)
    expect(updated[0].body_html).toBe('<p>hi updated</p>')
    expect(updated[0].reactions).toEqual([existingReaction])
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

describe('reactions.ts — custom emoji discovery & available reactions merging', () => {
  test('extractCustomEmojiAssets only reads <i class="custom-emoji"> tags, decodes &amp;, and inferEpochEmojiBase detects epoch dir', () => {
    const posts: Post[] = [
      {
        id: 1,
        date: '2026-11-19T08:00:00Z',
        text: [
          '<p>Hi <i class="custom-emoji" emoji-src="../media/epochs/2/emoji/5368324170671202286.webm?v=1&amp;x=2"></i>',
          ' and ignore fake <span emoji-src="../media/emoji/123456.webp"></span>',
          ' and ignore invalid <i class="custom-emoji" emoji-src="../media/emoji/../evil.webp"></i></p>',
        ].join(''),
        images: [{url: '../media/epochs/2/media/photo.webp', width: 800, height: 600}],
        reactions: [
          {custom_emoji_id: '5368324170671202286', count: 2},
          {custom_emoji_id: '9999999999999999999', count: 1},
        ],
      },
    ]
    const assets = extractCustomEmojiAssets(posts, '/api/life/exports/posts.json')
    expect(assets['5368324170671202286']).toBe('/api/life/media/epochs/2/emoji/5368324170671202286.webm?v=1&x=2')
    // Non-custom-emoji tags & unverified reaction-only IDs are NOT added to global map
    expect(assets['123456']).toBeUndefined()
    expect(assets['9999999999999999999']).toBeUndefined()

    const epochBase = inferEpochEmojiBase(posts, '/api/life/exports/posts.json')
    expect(epochBase).toBe('/api/life/media/epochs/2/emoji/')
  })

  test('buildAvailableReactions prepends post reactions, deduplicates variation selectors (❤ vs ❤️), validates IDs, and uses epoch base', () => {
    const postReactions: MergedReaction[] = [
      {reaction_key: 'c:111', emoji: null, custom_emoji_id: '111', tg_count: 3, web_count: 0, count: 3, reacted: false},
      {reaction_key: 'c:999', emoji: null, custom_emoji_id: '999', tg_count: 1, web_count: 0, count: 1, reacted: false},
      {reaction_key: 'c:../bad', emoji: null, custom_emoji_id: '../bad', tg_count: 1, web_count: 0, count: 1, reacted: false},
      // Telegram bare heart \u2764 without \uFE0F variation selector
      {reaction_key: 'e:\u2764', emoji: '\u2764', custom_emoji_id: null, tg_count: 5, web_count: 0, count: 5, reacted: true},
    ]
    const channelAssets = {
      '111': '/api/life/media/epochs/2/emoji/111.webp',
      '222': '/api/life/media/epochs/2/emoji/222.webm',
    }
    const choices = buildAvailableReactions(
      postReactions,
      channelAssets,
      '/api/life/exports/posts.json',
      '/api/life/media/epochs/2/emoji/'
    )
    const canonicalKeys = choices.map(c => c.canonical_key)

    // No duplicates (including ❤ vs ❤️!)
    expect(new Set(canonicalKeys).size).toBe(canonicalKeys.length)
    expect(choices.filter(c => c.canonical_key === 'e:\u2764').length).toBe(1)
    // Invalid custom_emoji_id rejected
    expect(canonicalKeys).not.toContain('c:../bad')
    // Post existing reactions come first, and unverified custom_emoji_id uses inferred epoch base
    expect(choices[0].custom_emoji_src).toBe('/api/life/media/epochs/2/emoji/111.webp')
    expect(choices[1].custom_emoji_src).toBe('/api/life/media/epochs/2/emoji/999')
    // Channel custom emoji from another post is included
    expect(canonicalKeys).toContain('c:222')
    // All curated & Telegram channel reactions are present (canonically)
    for (const em of CURATED_REACTIONS) expect(canonicalKeys).toContain(canonicalReactionKey({emoji: em}))
    for (const em of TELEGRAM_CHANNEL_REACTIONS) expect(canonicalKeys).toContain(canonicalReactionKey({emoji: em}))
  })

  test('applyOptimisticReactionToggle & mergePublicReactions match ❤ and ❤️ via variation-selector normalization', () => {
    const existing: MergedReaction[] = [
      {reaction_key: 'e:\u2764', emoji: '\u2764', custom_emoji_id: null, tg_count: 4, web_count: 0, count: 4, reacted: false},
    ]
    // Toggle using ❤️ (\u2764\uFE0F) matches existing ❤ (\u2764) in place without duplicating
    const toggled = applyOptimisticReactionToggle(existing, {emoji: '\u2764\uFE0F'})
    expect(toggled.length).toBe(1)
    expect(toggled[0].reacted).toBe(true)
    expect(toggled[0].count).toBe(5)

    // Public SSE broadcast preserves reacted state across variation selectors
    const merged = mergePublicReactions(toggled, [
      {reaction_key: 'e:\u2764\uFE0F', emoji: '\u2764\uFE0F', custom_emoji_id: null, tg_count: 4, web_count: 2, count: 6},
    ])
    expect(merged[0].reacted).toBe(true)
    expect(merged[0].count).toBe(6)
  })
})

describe('state.ts — buildChatMessages chronological grouping & own detection', () => {
  const mk = (overrides: Partial<CommentDTO>): CommentDTO => ({
    id: 1,
    post_id: 10,
    parent_id: null,
    source: 'web',
    author: {display_name: 'Alice', role: 'user', verified: true},
    body_text: 'msg',
    body_html: '<p>msg</p>',
    created_at: '2026-11-19T10:00:00Z',
    deleted: false,
    is_mine: false,
    can_delete: false,
    ...overrides,
  })

  test('sorts chronologically, groups consecutive same-sender messages within 5min, and resolves own + parentComment', () => {
    const c1 = mk({id: 1, created_at: '2026-11-19T10:00:00Z', body_text: 'first'})
    const c2 = mk({id: 2, created_at: '2026-11-19T10:02:00Z', body_text: 'second'})
    const c3 = mk({id: 3, created_at: '2026-11-19T10:10:00Z', body_text: 'after gap'})
    const c4 = mk({
      id: 4,
      parent_id: 1,
      created_at: '2026-11-19T10:11:00Z',
      author: {display_name: 'Anonymous #a1b2', role: 'anonymous', verified: false},
      body_text: 'my anon reply',
    })

    // Pass unsorted input to verify chronological sorting
    const bubbles = buildChatMessages([c4, c2, c3, c1], new Set([4]))
    expect(bubbles.map(b => b.comment.id)).toEqual([1, 2, 3, 4])

    // c1 & c2 grouped together
    expect(bubbles[0]).toMatchObject({isOwn: false, firstInGroup: true, lastInGroup: false})
    expect(bubbles[1]).toMatchObject({isOwn: false, firstInGroup: false, lastInGroup: true})
    // c3 is >5min after c2 -> new standalone group
    expect(bubbles[2]).toMatchObject({isOwn: false, firstInGroup: true, lastInGroup: true})
    // c4 matched via localStorage ownIds & resolves parentComment=c1
    expect(bubbles[3]).toMatchObject({isOwn: true, firstInGroup: true, lastInGroup: true})
    expect(bubbles[3].parentComment?.id).toBe(1)
  })

  test('splits consecutive sender groups when verified/provider/avatar differ despite same display_name', () => {
    const a1 = mk({
      id: 10,
      created_at: '2026-11-19T10:00:00Z',
      author: {display_name: 'Alice', role: 'user', verified: true, provider: 'github', avatar_url: 'https://a.test/1.png'},
    })
    const a2 = mk({
      id: 11,
      created_at: '2026-11-19T10:01:00Z',
      author: {display_name: 'Alice', role: 'user', verified: true, provider: 'google', avatar_url: 'https://a.test/2.png'},
    })
    const bubbles = buildChatMessages([a1, a2])
    expect(bubbles[0]).toMatchObject({firstInGroup: true, lastInGroup: true})
    expect(bubbles[1]).toMatchObject({firstInGroup: true, lastInGroup: true})
  })

  test('formatCommentShortDate shows MM-DD in current year and YYYY-MM-DD in earlier years', () => {
    expect(formatCommentShortDate('2026-11-19T08:00:00Z', 2026)).toBe('11-19')
    expect(formatCommentShortDate('2025-12-31T08:00:00Z', 2026)).toBe('2025-12-31')
  })
})

describe('appleEmoji.ts & OIDC auth helpers', () => {
  test('getAppleEmojiCandidates maps Telegram non-qualified emojis, adds -fe0f fallback, and disables on empty baseUrl', () => {
    const base = DEFAULT_APPLE_EMOJI_BASE_URL
    expect(getAppleEmojiCandidates('\u2764', base)[0]).toBe(`${base}2764-fe0f.png`)
    expect(getAppleEmojiCandidates('\ud83d\udd4a', base)[0]).toBe(`${base}1f54a-fe0f.png`)
    expect(getAppleEmojiCandidates('✨', base)[0]).toBe(`${base}2728.png`)
    expect(getAppleEmojiCandidates('❤️‍🔥', base)[0]).toBe(`${base}2764-fe0f-200d-1f525.png`)

    // Standard emoji without explicit override produces primary + -fe0f fallback
    const thumbs = getAppleEmojiCandidates('👍', base)
    expect(thumbs[0]).toBe(`${base}1f44d.png`)
    expect(thumbs).toContain(`${base}1f44d-fe0f.png`)

    // Disabled when baseUrl is empty or unsafe
    expect(getAppleEmojiCandidates('❤️', '')).toEqual([])
    expect(getAppleEmojiCandidates('❤️', 'javascript:alert(1)')).toEqual([])
    expect(getAppleEmojiCandidates('❤️', '//evil.example/emoji/')).toEqual([])
  })

  test('replaceTextEmojisWithApple skips code/pre/.custom-emoji and preserves HTML-like text as plain text nodes', () => {
    class MockClassList {
      private set: Set<string>
      constructor(classes: string[] = []) {
        this.set = new Set(classes)
      }
      contains(c: string) {
        return this.set.has(c)
      }
    }

    class MockNode {
      parentNode: MockNode | null = null
      parentElement: MockElement | null = null
      childNodes: MockNode[] = []
      nodeValue: string | null = null
      appendChild(child: MockNode) {
        if (child instanceof MockFragment) {
          for (const c of child.childNodes) this.appendChild(c)
          child.childNodes = []
          return child
        }
        child.parentNode = this
        child.parentElement = this instanceof MockElement ? this : null
        this.childNodes.push(child)
        return child
      }
      replaceChild(newChild: MockNode, oldChild: MockNode) {
        const idx = this.childNodes.indexOf(oldChild)
        if (idx < 0) return oldChild
        if (newChild instanceof MockFragment) {
          const inserted = newChild.childNodes.slice()
          for (const c of inserted) {
            c.parentNode = this
            c.parentElement = this instanceof MockElement ? this : null
          }
          this.childNodes.splice(idx, 1, ...inserted)
          newChild.childNodes = []
        } else {
          newChild.parentNode = this
          newChild.parentElement = this instanceof MockElement ? this : null
          this.childNodes.splice(idx, 1, newChild)
        }
        return oldChild
      }
    }

    class MockFragment extends MockNode {}

    class MockText extends MockNode {
      constructor(text: string) {
        super()
        this.nodeValue = text
      }
    }

    class MockElement extends MockNode {
      tagName: string
      classList: MockClassList
      className = ''
      src = ''
      alt = ''
      draggable = true
      loading = ''
      onerror: (() => void) | null = null
      constructor(tagName: string, classes: string[] = []) {
        super()
        this.tagName = tagName.toUpperCase()
        this.classList = new MockClassList(classes)
      }
    }

    const collectTextNodes = (node: MockNode, out: MockText[] = []): MockText[] => {
      for (const child of node.childNodes) {
        if (child instanceof MockText) out.push(child)
        else collectTextNodes(child, out)
      }
      return out
    }

    const origDoc = (globalThis as any).document
    const origNF = (globalThis as any).NodeFilter
    ;(globalThis as any).NodeFilter = {SHOW_TEXT: 4}
    ;(globalThis as any).document = {
      createTreeWalker(root: MockNode) {
        const list = collectTextNodes(root)
        let i = -1
        return {
          nextNode() {
            i++
            return i < list.length ? list[i] : null
          },
        }
      },
      createDocumentFragment: () => new MockFragment(),
      createTextNode: (t: string) => new MockText(t),
      createElement: (tag: string) => new MockElement(tag),
    }

    try {
      const root = new MockElement('div')
      const p = new MockElement('p')
      p.appendChild(new MockText('<b>hi</b> ❤️ <script>x</script>'))
      const code = new MockElement('code')
      code.appendChild(new MockText('const x = "🔥"'))
      const pre = new MockElement('pre')
      pre.appendChild(new MockText('🎉'))
      const custom = new MockElement('i', ['custom-emoji'])
      custom.appendChild(new MockText('👍'))
      root.appendChild(p)
      root.appendChild(code)
      root.appendChild(pre)
      root.appendChild(custom)

      replaceTextEmojisWithApple(root as unknown as HTMLElement, DEFAULT_APPLE_EMOJI_BASE_URL)

      // <p> text split into [Text('<b>hi</b> '), Img(alt='❤️'), Text(' <script>x</script>')]
      expect(p.childNodes.length).toBe(3)
      expect(p.childNodes[0]).toBeInstanceOf(MockText)
      expect(p.childNodes[0].nodeValue).toBe('<b>hi</b> ')
      expect(p.childNodes[1]).toBeInstanceOf(MockElement)
      expect((p.childNodes[1] as MockElement).tagName).toBe('IMG')
      expect((p.childNodes[1] as MockElement).alt).toBe('❤️')
      expect((p.childNodes[1] as MockElement).src).toContain('2764-fe0f.png')
      expect(p.childNodes[2]).toBeInstanceOf(MockText)
      expect(p.childNodes[2].nodeValue).toBe(' <script>x</script>')

      // <code>, <pre>, and .custom-emoji remain completely untouched
      expect(code.childNodes.length).toBe(1)
      expect(code.childNodes[0].nodeValue).toBe('const x = "🔥"')
      expect(pre.childNodes.length).toBe(1)
      expect(pre.childNodes[0].nodeValue).toBe('🎉')
      expect(custom.childNodes.length).toBe(1)
      expect(custom.childNodes[0].nodeValue).toBe('👍')
    } finally {
      if (origDoc === undefined) delete (globalThis as any).document
      else (globalThis as any).document = origDoc
      if (origNF === undefined) delete (globalThis as any).NodeFilter
      else (globalThis as any).NodeFilter = origNF
    }
  })

  test('tgs.ts decompresses gzipped Lottie, deduplicates concurrent fetches, and enforces size caps', async () => {
    clearTgsCacheForTests()

    // Rejects unsafe URL schemes immediately
    await expect(fetchTgsAnimationData('javascript:alert(1)')).rejects.toThrow(/unsafe/i)
    await expect(fetchTgsAnimationData('//evil.example/a.tgs')).rejects.toThrow(/unsafe/i)

    // Bounded decompression rejects gzip bomb expanding past 2 MiB
    const hugeJson = '{"v":"5.0","pad":"' + 'a'.repeat(MAX_TGS_DECOMPRESSED_BYTES + 4096) + '"}'
    const gzipBomb = new Uint8Array(gzipSync(Buffer.from(hugeJson, 'utf8')))
    expect(gzipBomb.byteLength).toBeLessThan(MAX_TGS_COMPRESSED_BYTES)
    await expect(decompressGzipBytesBounded(gzipBomb, MAX_TGS_DECOMPRESSED_BYTES)).rejects.toThrow(/limit/i)

    // Valid gzipped Lottie + concurrent fetch deduplication
    const sampleLottie = {v: '5.5.2', fr: 60, ip: 0, op: 60, w: 512, h: 512, layers: []}
    const validGzip = new Uint8Array(gzipSync(Buffer.from(JSON.stringify(sampleLottie), 'utf8')))

    const origFetch = globalThis.fetch
    let fetchCalls = 0
    globalThis.fetch = (async (input: any) => {
      fetchCalls++
      const url = String(input)
      if (url.includes('too-big.tgs')) {
        return new Response(new Uint8Array(MAX_TGS_COMPRESSED_BYTES + 10))
      }
      if (url.includes('bomb.tgs')) {
        return new Response(gzipBomb)
      }
      await new Promise(r => setTimeout(r, 15))
      return new Response(validGzip)
    }) as unknown as typeof fetch

    try {
      const [a, b] = await Promise.all([
        fetchTgsAnimationData('/api/life/media/emoji/123.tgs'),
        fetchTgsAnimationData('/api/life/media/emoji/123.tgs'),
      ])
      expect(fetchCalls).toBe(1)
      expect(a).toEqual(sampleLottie)
      expect(b).toEqual(sampleLottie)

      // Compressed > 512 KiB rejected
      await expect(fetchTgsAnimationData('/api/life/media/emoji/too-big.tgs')).rejects.toThrow(/limit/i)
      // Decompressed > 2 MiB rejected
      await expect(fetchTgsAnimationData('/api/life/media/emoji/bomb.tgs')).rejects.toThrow(/limit/i)
    } finally {
      globalThis.fetch = origFetch
      clearTgsCacheForTests()
    }
  })

  test('LifeApiClient builds OIDC login URL and defaultMessages formats OIDC label', () => {
    const api = new LifeApiClient('/api/life')
    expect(api.getOAuthLoginUrl('oidc', '/life?shared=5')).toBe(
      '/api/life/auth/oauth/oidc/login?next=%2Flife%3Fshared%3D5'
    )
    expect(defaultMessages.authContinueWithOidc('Authentik')).toBe('Continue with Authentik')
    expect(defaultMessages.authContinueWithOidc('SSO')).toBe('Continue with SSO')
  })
})

describe('comment reactions — state helpers, API client, and SSE dispatch', () => {
  const makeComment = (overrides: Partial<CommentDTO> = {}): CommentDTO => ({
    id: 101,
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

  test('applyOptimisticCommentReactionToggle toggles reactions on target comment without mutating others', () => {
    const c1 = makeComment({
      id: 101,
      reactions: [
        {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 1, web_count: 0, count: 1, reacted: false},
      ],
    })
    const c2 = makeComment({id: 102})

    const step1 = applyOptimisticCommentReactionToggle([c1, c2], 101, {emoji: '❤️'})
    expect(step1[0].reactions).toEqual([
      {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 1, web_count: 1, count: 2, reacted: true},
    ])
    expect(step1[1]).toBe(c2)

    const step2 = applyOptimisticCommentReactionToggle(step1, 101, {emoji: '🔥'})
    expect(step2[0].reactions?.length).toBe(2)
    expect(step2[0].reactions?.[1]).toMatchObject({reaction_key: 'e:🔥', count: 1, reacted: true})

    // Missing commentId returns original list reference
    expect(applyOptimisticCommentReactionToggle(step2, 999, {emoji: '🔥'})).toBe(step2)
  })

  test('mergeCommentReactionsInList preserves local reacted flags for public SSE payloads and uses authoritative flags for HTTP responses', () => {
    const list = [
      makeComment({
        id: 101,
        reactions: [
          {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 1, web_count: 1, count: 2, reacted: true},
        ],
      }),
    ]

    // Public SSE payload omits `reacted`
    const afterSse = mergeCommentReactionsInList(list, 101, [
      {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 1, web_count: 2, count: 3},
      {reaction_key: 'e:👍', emoji: '👍', custom_emoji_id: null, tg_count: 0, web_count: 1, count: 1},
    ])
    expect(afterSse[0].reactions?.[0].reacted).toBe(true)
    expect(afterSse[0].reactions?.[0].count).toBe(3)
    expect(afterSse[0].reactions?.[1].reacted).toBe(false)

    // Authoritative HTTP response includes `reacted`
    const afterHttp = mergeCommentReactionsInList(afterSse, 101, [
      {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 1, web_count: 1, count: 2, reacted: false},
    ])
    expect(afterHttp[0].reactions?.[0].reacted).toBe(false)
    expect(afterHttp[0].reactions?.[0].count).toBe(2)
  })

  test('LifeApiClient.toggleCommentReaction posts to /comments/{id}/reactions/toggle with credentials', async () => {
    const origFetch = globalThis.fetch
    let capturedUrl = ''
    let capturedInit: RequestInit | undefined
    const mockRes = {
      post_id: 10,
      comment_id: 101,
      reactions: [
        {reaction_key: 'e:🔥', emoji: '🔥', custom_emoji_id: null, tg_count: 0, web_count: 1, count: 1, reacted: true},
      ],
    }

    globalThis.fetch = (async (input: any, init?: RequestInit) => {
      capturedUrl = String(input)
      capturedInit = init
      return new Response(JSON.stringify(mockRes), {
        status: 200,
        headers: {'content-type': 'application/json'},
      })
    }) as unknown as typeof fetch

    try {
      const api = new LifeApiClient('/api/life')
      const res = await api.toggleCommentReaction(101, {emoji: '🔥'})
      expect(capturedUrl).toBe('/api/life/comments/101/reactions/toggle')
      expect(capturedInit?.method).toBe('POST')
      expect(capturedInit?.credentials).toBe('include')
      expect(JSON.parse(String(capturedInit?.body))).toEqual({emoji: '🔥'})
      expect(res).toEqual(mockRes)
    } finally {
      globalThis.fetch = origFetch
    }
  })

  test('LifeStreamClient dispatches comment.reaction.updated SSE events', () => {
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
      const received: any[] = []
      const client = new LifeStreamClient('/api/life', {
        onCommentReactionUpdated: (ev) => received.push(ev),
      })
      client.connect()

      const handler = listeners.get('comment.reaction.updated')
      expect(handler).toBeDefined()
      const payload = {
        post_id: 10,
        comment_id: 101,
        reactions: [
          {reaction_key: 'e:❤️', emoji: '❤️', custom_emoji_id: null, tg_count: 1, web_count: 2, count: 3},
        ],
      }
      handler!({data: JSON.stringify(payload), lastEventId: 'evt-42'} as unknown as Event)
      expect(received).toEqual([payload])
      client.close()
    } finally {
      if (origWin === undefined) delete (globalThis as any).window
      else (globalThis as any).window = origWin
      if (origES === undefined) delete (globalThis as any).EventSource
      else (globalThis as any).EventSource = origES
    }
  })
})
