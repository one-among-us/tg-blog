import {describe, expect, test} from 'bun:test'
import {createHash} from 'node:crypto'
import {gzipSync} from 'node:zlib'
import {
  isSafeMediaUrl,
  normalizeTelegramBotUsername,
  resolveApiAssetUrl,
  resolvePostsUrl,
  resolveRelativeUrl,
  sanitizeAvatarUrl,
} from '../src/logic/url'
import {solveAltchaChallenge} from '../src/logic/altcha'
import {calculateAlbumLayout} from '../src/logic/webz/calculateAlbumLayout'
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
import {defaultMessages, zhCnMessages} from '../src/logic/messages'
import {ANON_RING_PALETTE, normalizeAnonDisplayName, pickAnonIdentity} from '../src/logic/anonAvatar'
import {
  matchLiveMarkdownRule,
  parseMarkdownToHtml,
  sanitize,
  serializeEditorDomToMarkdown,
} from '../src/logic/markdown'
import {buildCustomEmojiCandidates} from '../src/logic/customEmojiDom'
import {
  buildAvailableReactions,
  canonicalReactionKey,
  CURATED_REACTIONS,
  extractCustomEmojiAssets,
  inferEpochEmojiBase,
  TELEGRAM_CHANNEL_REACTIONS,
} from '../src/logic/reactions'
import {LifeApiClient, LifeStreamClient, sanitizeCommentHtml, sanitizeCommentSnippetHtml} from '../src/logic/api'
import {
  clampCenterPlacement,
  clampFloatingPlacement,
  createFloatingPositionController,
  isEventInsideElement,
} from '../src/logic/floatingPosition'
import {
  EditorHistoryManager,
  getEditorSelectionOffsets,
  MAX_HISTORY,
  resolveEditorDomPosition,
  restoreEditorSelectionOffsets,
  snapshotEditorHtml,
} from '../src/logic/editorHistory'
import {initSpoilers} from '../src/logic/spoilers'
import type {CommentDTO, CommentMediaDTO, MergedPoll, MergedReaction, Post} from '../src/logic/models'
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

  test('buildAvailableReactions strictly follows backend allowedReactions order when provided', () => {
    const postReactions: MergedReaction[] = [
      {reaction_key: 'e:💩', emoji: '💩', custom_emoji_id: null, tg_count: 9, web_count: 0, count: 9, reacted: false},
    ]
    const choices = buildAvailableReactions(
      postReactions,
      {'111': '/api/life/media/epochs/2/emoji/111.webp'},
      '/api/life/exports/posts.json',
      '/api/life/media/epochs/2/emoji/',
      [
        {reaction_key: 'e:🔥', emoji: '🔥', custom_emoji_id: null},
        {reaction_key: 'c:111', emoji: null, custom_emoji_id: '111'},
        {reaction_key: 'e:❤', emoji: '❤️', custom_emoji_id: null},
        // Duplicate ❤ without FE0F should be deduplicated
        {reaction_key: 'e:❤', emoji: '\u2764', custom_emoji_id: null},
      ]
    )
    expect(choices.map(c => c.canonical_key)).toEqual(['e:🔥', 'c:111', 'e:\u2764'])
    expect(choices[1].custom_emoji_src).toBe('/api/life/media/epochs/2/emoji/111.webp')
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

describe('v3 features — markdown, sanitizeCommentHtml, media APIs, SSE views, and messages', () => {
  test('parseMarkdownToHtml converts Telegram Markdown safely and escapes XSS', () => {
    expect(parseMarkdownToHtml('**bold** __italic__ <u>under</u> ~~strike~~ ||secret|| `code`')).toBe(
      '<b>bold</b> <em>italic</em> <u>under</u> <del>strike</del> <span class="spoiler"><span>secret</span></span> <code>code</code>'
    )

    // Nested formatting & links with underscores in URL
    expect(parseMarkdownToHtml('[**bold link**](https://example.com/a__b__c)')).toBe(
      '<a href="https://example.com/a__b__c" target="_blank" rel="noopener noreferrer nofollow"><b>bold link</b></a>'
    )

    // Rejects unsafe javascript: links and escapes script tags
    const unsafe = parseMarkdownToHtml('[bad](javascript:alert(1)) <script>alert(1)</script>')
    expect(unsafe).not.toContain('<a ')
    expect(unsafe).not.toContain('<script>')
    expect(unsafe).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')

    // Fenced code blocks & multi-line blockquotes
    const mdBlock = '```ts\nconst x = "**not bold**";\n```\n> quote **one**\n> quote two'
    expect(parseMarkdownToHtml(mdBlock)).toBe(
      '<pre><code class="language-ts">const x = "**not bold**";</code></pre><blockquote>quote <b>one</b><br>quote two</blockquote>'
    )

    // Custom emoji in both default <i> and editor <img> mode
    const emojiMd = 'Hi <tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>'
    expect(parseMarkdownToHtml(emojiMd)).toBe(
      'Hi <i class="custom-emoji" data-custom-emoji-id="5368324170671202286">👍</i>'
    )
    expect(parseMarkdownToHtml(emojiMd, {
      customEmojiTag: 'img',
      customEmojiUrls: {'5368324170671202286': '/api/life/exports/emoji/5368324170671202286.webp'},
    })).toBe(
      'Hi <img class="custom-emoji" data-custom-emoji-id="5368324170671202286" alt="👍" src="/api/life/exports/emoji/5368324170671202286.webp">'
    )
  })

  test('serializeEditorDomToMarkdown converts live formatted DOM nodes back to Telegram Markdown', () => {
    class MockClassList {
      private set = new Set<string>()
      constructor(classes: string[] = []) {
        classes.forEach(c => this.set.add(c))
      }
      contains(c: string) { return this.set.has(c) }
    }
    class MockText {
      nodeType = 3
      nodeValue: string
      constructor(val: string) { this.nodeValue = val }
    }
    class MockEl {
      nodeType = 1
      tagName: string
      classList: MockClassList
      className: string
      attrs: Record<string, string>
      style: Record<string, string> = {}
      childNodes: Array<MockEl | MockText> = []
      constructor(tag: string, attrs: Record<string, string> = {}, children: Array<MockEl | MockText | string> = []) {
        this.tagName = tag.toUpperCase()
        this.attrs = attrs
        this.className = attrs.class || ''
        this.classList = new MockClassList((attrs.class || '').split(/\s+/).filter(Boolean))
        for (const ch of children) {
          this.childNodes.push(typeof ch === 'string' ? new MockText(ch) : ch)
        }
      }
      get children() { return this.childNodes.filter((n): n is MockEl => n.nodeType === 1) }
      getAttribute(k: string) { return this.attrs[k] ?? null }
      hasAttribute(k: string) { return k in this.attrs }
      querySelector(sel: string) {
        return this.children.find(c => c.tagName.toLowerCase() === sel.toLowerCase()) ?? null
      }
      get textContent(): string {
        return this.childNodes.map(c => c.nodeType === 3 ? c.nodeValue : (c as MockEl).textContent).join('')
      }
    }

    const root = new MockEl('div', {}, [
      new MockEl('b', {}, ['bold']),
      ' ',
      new MockEl('em', {}, ['italic']),
      ' ',
      new MockEl('u', {}, ['under']),
      ' ',
      new MockEl('del', {}, ['strike']),
      ' ',
      new MockEl('span', {class: 'spoiler'}, ['secret']),
      ' ',
      new MockEl('code', {}, ['inline()']),
      ' ',
      new MockEl('a', {href: 'https://example.com'}, ['link']),
      ' ',
      new MockEl('img', {'data-custom-emoji-id': '123456', alt: '✦'}),
      new MockEl('blockquote', {}, ['quoted line', new MockEl('br'), 'second']),
      new MockEl('pre', {}, [new MockEl('code', {class: 'language-js'}, ['const a = 1'])]),
    ])

    const md = serializeEditorDomToMarkdown(root as unknown as HTMLElement)
    expect(md).toBe(
      '**bold** __italic__ <u>under</u> ~~strike~~ ||secret|| `inline()` [link](https://example.com) <tg-emoji emoji-id="123456">✦</tg-emoji>\n' +
      '> quoted line\n> second\n' +
      '```js\nconst a = 1\n```'
    )
  })

  test('matchLiveMarkdownRule matches completed inline Telegram Markdown delimiters cleanly', () => {
    expect(matchLiveMarkdownRule('hello **world**')).toMatchObject({
      format: 'bold',
      content: 'world',
      raw: '**world**',
    })
    expect(matchLiveMarkdownRule('__ital__')).toMatchObject({format: 'italic', content: 'ital'})
    expect(matchLiveMarkdownRule('~~del~~')).toMatchObject({format: 'strike', content: 'del'})
    expect(matchLiveMarkdownRule('||hide||')).toMatchObject({format: 'spoiler', content: 'hide'})
    expect(matchLiveMarkdownRule('`fn()`')).toMatchObject({format: 'code', content: 'fn()'})
    expect(matchLiveMarkdownRule('***partial**')).toBeNull()
    expect(matchLiveMarkdownRule('**   **')).toBeNull()
  })

  test('sanitizeCommentHtml preserves spoiler, custom-emoji numeric IDs, and formatting while blocking XSS', () => {
    const html =
      '<p><b>b</b> <em>e</em> <u>u</u> <del>d</del> <span class="spoiler">secret</span> ' +
      '<i class="custom-emoji" data-custom-emoji-id="5368324170671202286" onclick="alert(1)">✦</i> ' +
      '<i class="custom-emoji" data-custom-emoji-id="../evil">bad</i> ' +
      '<span class="evil-class">ok</span> ' +
      '<a href="https://example.com" onclick="evil()">safe</a></p>'
    const clean = sanitizeCommentHtml(html)
    expect(clean).toContain('<b>b</b>')
    expect(clean).toContain('<em>e</em>')
    expect(clean).toContain('<u>u</u>')
    expect(clean).toContain('<del>d</del>')
    expect(clean).toContain('<span class="spoiler">secret</span>')
    expect(clean).toContain('<i data-custom-emoji-id="5368324170671202286" class="custom-emoji">✦</i>')
    expect(clean).not.toContain('../evil')
    expect(clean).not.toContain('onclick')
    expect(clean).not.toContain('evil-class')
    expect(clean).toContain('target="_blank"')
    expect(clean).toContain('rel="noopener noreferrer nofollow"')
  })

  test('LifeApiClient v3 endpoints (recordViews, uploadCommentMedia, getCustomEmojis, getStickers, createComment with media)', async () => {
    const origFetch = globalThis.fetch
    const calls: Array<{url: string; method: string; body: any; credentials?: RequestCredentials}> = []
    const sampleMedia: CommentMediaDTO = {
      media_type: 'photo',
      url: '/api/life/media/comments/1.webp',
      thumb: '/api/life/media/comments/1_thumb.webp',
      width: 800,
      height: 600,
    }

    globalThis.fetch = (async (input: any, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      calls.push({url, method, body: init?.body, credentials: init?.credentials})

      if (url.endsWith('/posts/view')) {
        return new Response(JSON.stringify({views: {'1': '42', '2': '1.2K'}}), {
          status: 200,
          headers: {'content-type': 'application/json'},
        })
      }
      if (url.endsWith('/comments/media')) {
        return new Response(JSON.stringify(sampleMedia), {
          status: 200,
          headers: {'content-type': 'application/json'},
        })
      }
      if (url.endsWith('/emojis/custom')) {
        return new Response(JSON.stringify({emojis: [{id: '123', url: '/api/life/exports/emoji/123.webp', format: 'webp'}]}), {
          status: 200,
          headers: {'content-type': 'application/json'},
        })
      }
      if (url.endsWith('/stickers')) {
        return new Response(JSON.stringify({packs: [{id: 'starter', title: 'Starter', stickers: []}]}), {
          status: 200,
          headers: {'content-type': 'application/json'},
        })
      }
      return new Response(JSON.stringify({
        id: 500,
        post_id: 10,
        parent_id: null,
        source: 'web',
        author: {display_name: 'Anon', role: 'anonymous', verified: false},
        body_text: '',
        body_html: '',
        media: sampleMedia,
        created_at: '2026-11-20T04:00:00Z',
        deleted: false,
        is_mine: true,
        can_delete: true,
      }), {
        status: 200,
        headers: {'content-type': 'application/json'},
      })
    }) as unknown as typeof fetch

    try {
      const api = new LifeApiClient('/api/life')

      const viewsRes = await api.recordViews([1, 2, 1])
      expect(viewsRes.views).toEqual({'1': '42', '2': '1.2K'})
      expect(calls[0].url).toBe('/api/life/posts/view')
      expect(JSON.parse(calls[0].body)).toEqual({post_ids: [1, 2]})

      const file = new File([new Uint8Array([1, 2, 3])], 'pic.png', {type: 'image/png'})
      const uploaded = await api.uploadCommentMedia(file)
      expect(uploaded).toEqual(sampleMedia)
      expect(calls[1].url).toBe('/api/life/comments/media')
      expect(calls[1].body).toBeInstanceOf(FormData)

      const ce = await api.getCustomEmojis()
      expect(ce.emojis).toHaveLength(1)
      expect(calls[2].url).toBe('/api/life/emojis/custom')

      const stickers = await api.getStickers()
      expect(stickers.packs[0].id).toBe('starter')
      expect(calls[3].url).toBe('/api/life/stickers')

      const created = await api.createComment(10, {body: '', media: sampleMedia})
      expect(created.media).toEqual(sampleMedia)
      expect(JSON.parse(calls[4].body)).toMatchObject({body: '', media: sampleMedia})
    } finally {
      globalThis.fetch = origFetch
    }
  })

  test('LifeStreamClient dispatches post.views.updated SSE events', () => {
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
        onPostViewsUpdated: (ev) => received.push(ev),
      })
      client.connect()

      const handler = listeners.get('post.views.updated')
      expect(handler).toBeDefined()
      const payload = {views: {'10': '99', '11': '1.5K'}}
      handler!({data: JSON.stringify(payload), lastEventId: 'evt-99'} as unknown as Event)
      expect(received).toEqual([payload])
      client.close()
    } finally {
      if (origWin === undefined) delete (globalThis as any).window
      else (globalThis as any).window = origWin
      if (origES === undefined) delete (globalThis as any).EventSource
      else (globalThis as any).EventSource = origES
    }
  })

  test('applyCommentDeleteInList clears media on tombstoned parent comments', () => {
    const parent: CommentDTO = {
      id: 1,
      post_id: 10,
      parent_id: null,
      source: 'web',
      author: {display_name: 'A', role: 'user', verified: true},
      body_text: 'photo',
      body_html: '<p>photo</p>',
      media: {media_type: 'photo', url: '/a.webp'},
      created_at: '2026-11-20T00:00:00Z',
      deleted: false,
      is_mine: true,
      can_delete: true,
    }
    const child: CommentDTO = {
      ...parent,
      id: 2,
      parent_id: 1,
      media: null,
    }
    const after = applyCommentDeleteInList([parent, child], 1)
    expect(after).toHaveLength(2)
    expect(after[0].deleted).toBe(true)
    expect(after[0].media).toBeNull()
  })

  test('defaultMessages and zhCnMessages expose all v3 media/composer/formatter labels', () => {
    expect(defaultMessages.mediaPhoto).toBe('[Photo]')
    expect(defaultMessages.mediaSticker).toBe('[Sticker]')
    expect(defaultMessages.mediaVideo).toBe('[Video]')
    expect(defaultMessages.mediaDocument).toBe('[File]')
    expect(zhCnMessages.mediaPhoto).toBe('[图片]')
    expect(zhCnMessages.mediaSticker).toBe('[贴纸]')
    expect(zhCnMessages.mediaVideo).toBe('[视频]')
    expect(zhCnMessages.mediaDocument).toBe('[文件]')
    expect(Object.keys(zhCnMessages).sort()).toEqual(Object.keys(defaultMessages).sort())
  })

  test('resolveApiAssetUrl preserves root-relative /api/... paths across cross-origin postsUrl and binds to http(s) apiUrl', () => {
    // Root-relative API asset stays root-relative when apiUrl is root-relative or omitted, even if postsUrl is on another origin
    expect(resolveApiAssetUrl('/api/life/media/stickers/starter/a.webp', '/api/life', 'https://cdn.example/posts.json')).toBe(
      '/api/life/media/stickers/starter/a.webp'
    )
    expect(resolveApiAssetUrl('/api/life/exports/emoji/123.webp', null, 'https://cdn.example/posts.json')).toBe(
      '/api/life/exports/emoji/123.webp'
    )
    // Explicit http(s) apiUrl binds root-relative paths to apiUrl origin
    expect(resolveApiAssetUrl('/api/life/media/stickers/starter/a.webp', 'https://api.example/api/life', 'https://cdn.example/posts.json')).toBe(
      'https://api.example/api/life/media/stickers/starter/a.webp'
    )
    // Relative non-leading-slash paths resolve against fallbackPostsUrl
    expect(resolveApiAssetUrl('../media/comments/1.webp', '/api/life', '/api/life/exports/posts.json')).toBe(
      '/api/life/media/comments/1.webp'
    )
    expect(resolveApiAssetUrl('javascript:alert(1)', '/api/life')).toBe('')
  })

  test('sanitizeCommentHtml validates <pre language="..."> and markdown sanitize() blocks protocol-relative URLs and enforces rel', () => {
    const cleanComment = sanitizeCommentHtml(
      '<pre language="TypeScript+1"><code>x</code></pre><pre language="../bad"><code>y</code></pre>'
    )
    expect(cleanComment).toContain('<pre language="TypeScript+1">')
    expect(cleanComment).not.toContain('../bad')

    const cleanPost = sanitize(
      '<a href="https://example.com" target="_blank">ok</a><a href="//evil.example/a">bad</a>'
    )
    expect(cleanPost).toContain('rel="noopener noreferrer nofollow"')
    expect(cleanPost).not.toContain('//evil.example')
  })

  test('serializeEditorDomToMarkdown wraps multi-line inline formatting per non-empty line', () => {
    class MockClassList {
      private set = new Set<string>()
      contains(c: string) { return this.set.has(c) }
    }
    class MockText {
      nodeType = 3
      nodeValue: string
      constructor(val: string) { this.nodeValue = val }
    }
    class MockEl {
      nodeType = 1
      tagName: string
      classList = new MockClassList()
      className = ''
      style: Record<string, string> = {}
      childNodes: Array<MockEl | MockText> = []
      constructor(tag: string, children: Array<MockEl | MockText | string> = []) {
        this.tagName = tag.toUpperCase()
        for (const ch of children) {
          this.childNodes.push(typeof ch === 'string' ? new MockText(ch) : ch)
        }
      }
      get children() { return this.childNodes.filter((n): n is MockEl => n.nodeType === 1) }
      getAttribute() { return null }
      hasAttribute() { return false }
      get textContent(): string {
        return this.childNodes.map(c => c.nodeType === 3 ? c.nodeValue : (c as MockEl).textContent).join('')
      }
    }

    const root = new MockEl('div', [
      new MockEl('b', ['line 1', new MockEl('br'), 'line 2']),
      new MockEl('br'),
      new MockEl('u', ['u1', new MockEl('br'), new MockEl('br'), 'u2']),
    ])
    expect(serializeEditorDomToMarkdown(root as unknown as HTMLElement)).toBe(
      '**line 1**\n**line 2**\n<u>u1</u>\n\n<u>u2</u>'
    )
  })

  test('buildCustomEmojiCandidates expands extensionless URLs and preserves extensioned or rejects unsafe URLs', () => {
    expect(buildCustomEmojiCandidates('/api/life/exports/emoji/123')).toEqual([
      '/api/life/exports/emoji/123.webp',
      '/api/life/exports/emoji/123.webm',
      '/api/life/exports/emoji/123.apng',
      '/api/life/exports/emoji/123.tgs',
      '/api/life/exports/emoji/123.png',
      '/api/life/exports/emoji/123.gif',
    ])
    expect(buildCustomEmojiCandidates('/api/life/exports/emoji/123', true)).toEqual([])
    expect(buildCustomEmojiCandidates('/api/life/exports/emoji/123.tgs', true)).toEqual([
      '/api/life/exports/emoji/123.tgs',
    ])
    expect(buildCustomEmojiCandidates('/api/life/exports/emoji/123.tgs')).toEqual([
      '/api/life/exports/emoji/123.tgs',
    ])
    expect(buildCustomEmojiCandidates('javascript:alert(1)')).toEqual([])
  })
})

describe('floatingPosition.ts — scroll & resize tracking for floating menus', () => {
  function setupMockWindow(initial: { innerWidth: number; innerHeight: number; scrollX: number; scrollY: number }) {
    const origWindow = (globalThis as any).window
    const listeners = new Map<string, Set<{ fn: (e: any) => void; capture: boolean }>>()
    const mockWin: any = {
      innerWidth: initial.innerWidth,
      innerHeight: initial.innerHeight,
      scrollX: initial.scrollX,
      scrollY: initial.scrollY,
      addEventListener(type: string, fn: (e: any) => void, opts?: boolean | { capture?: boolean }) {
        const capture = typeof opts === 'boolean' ? opts : Boolean(opts?.capture)
        if (!listeners.has(type)) listeners.set(type, new Set())
        listeners.get(type)!.add({ fn, capture })
      },
      removeEventListener(type: string, fn: (e: any) => void, opts?: boolean | { capture?: boolean }) {
        const capture = typeof opts === 'boolean' ? opts : Boolean(opts?.capture)
        const set = listeners.get(type)
        if (!set) return
        for (const item of Array.from(set)) {
          if (item.fn === fn && item.capture === capture) {
            set.delete(item)
          }
        }
      },
      dispatch(type: string, event: any = {}) {
        const set = listeners.get(type)
        if (!set) return
        for (const item of Array.from(set)) {
          item.fn(event)
        }
      },
      listenerCount(type: string) {
        return listeners.get(type)?.size ?? 0
      },
    }
    ;(globalThis as any).window = mockWin
    return {
      mockWin,
      restore() {
        if (origWindow === undefined) delete (globalThis as any).window
        else (globalThis as any).window = origWindow
      },
    }
  }

  test('clampFloatingPlacement and clampCenterPlacement handle above/below flip and clamping', () => {
    expect(
      clampFloatingPlacement({
        desiredLeft: 900,
        aboveTop: 500 - 340 - 8,
        belowTop: 530 + 8,
        width: 340,
        height: 340,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
    ).toEqual({ left: 650, top: 152 })

    // Insufficient room above -> flips below
    expect(
      clampFloatingPlacement({
        desiredLeft: 100,
        aboveTop: -100,
        belowTop: 60,
        width: 300,
        height: 200,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
    ).toEqual({ left: 100, top: 60 })

    expect(clampCenterPlacement(340, 340, 1000, 800)).toEqual({ left: 330, top: 230 })
  })

  test('tracks anchorEl rect deltas on external scroll, ignores internal scroll, and leaves top unclamped', () => {
    const env = setupMockWindow({ innerWidth: 1000, innerHeight: 800, scrollX: 0, scrollY: 0 })
    try {
      const innerGrid = { nodeType: 1 } as unknown as HTMLElement
      const outsideEl = { nodeType: 1 } as unknown as HTMLElement
      const floatingEl = {
        nodeType: 1,
        contains(target: any) {
          return target === floatingEl || target === innerGrid
        },
      } as unknown as HTMLElement

      let anchorRect = { left: 200, top: 400, bottom: 430, width: 32 }
      const anchorEl = {
        isConnected: true,
        getBoundingClientRect: () => ({ ...anchorRect }),
      } as unknown as HTMLElement

      const positions: Array<{ left: number; top: number }> = []
      const controller = createFloatingPositionController({
        getFloatingEl: () => floatingEl,
        getAnchorEl: () => anchorEl,
        positionMode: 'fixed',
        computeBasePosition: () =>
          clampFloatingPlacement({
            desiredLeft: anchorRect.left,
            aboveTop: anchorRect.top - 200 - 8,
            belowTop: anchorRect.bottom + 8,
            width: 300,
            height: 200,
            viewportWidth: env.mockWin.innerWidth,
            viewportHeight: env.mockWin.innerHeight,
          }),
        onPositionChange: pos => positions.push(pos),
      })

      controller.updateBase()
      controller.attach()
      expect(positions[positions.length - 1]).toEqual({ left: 200, top: 192 })
      expect(env.mockWin.listenerCount('scroll')).toBe(1)
      expect(env.mockWin.listenerCount('resize')).toBe(1)

      // Internal scroll (e.g. .EmojiPicker-main) is ignored even if anchor coordinates moved
      anchorRect = { left: 200, top: 300, bottom: 330, width: 32 }
      const countBeforeInternal = positions.length
      env.mockWin.dispatch('scroll', { target: innerGrid })
      env.mockWin.dispatch('scroll', { target: floatingEl })
      expect(positions.length).toBe(countBeforeInternal)
      expect(isEventInsideElement({ target: innerGrid } as unknown as Event, floatingEl)).toBe(true)
      expect(isEventInsideElement({ target: outsideEl } as unknown as Event, floatingEl)).toBe(false)

      // External scroll shifts 1:1 with anchorEl without clamping top back into viewport
      anchorRect = { left: 180, top: 50, bottom: 80, width: 32 } // dx = -20, dy = -350
      env.mockWin.dispatch('scroll', { target: outsideEl })
      expect(positions[positions.length - 1]).toEqual({ left: 180, top: -158 })

      // Detach cleans up both scroll and resize listeners
      controller.detach()
      expect(env.mockWin.listenerCount('scroll')).toBe(0)
      expect(env.mockWin.listenerCount('resize')).toBe(0)
      const countAfterDetach = positions.length
      anchorRect = { left: 100, top: 10, bottom: 40, width: 32 }
      env.mockWin.dispatch('scroll', { target: outsideEl })
      env.mockWin.dispatch('resize')
      expect(positions.length).toBe(countAfterDetach)
    } finally {
      env.restore()
    }
  })

  test('falls back to window.scrollX/scrollY when anchorEl is absent or disconnected, and re-clamps on resize', () => {
    const env = setupMockWindow({ innerWidth: 1000, innerHeight: 800, scrollX: 10, scrollY: 100 })
    try {
      let anchorConnected = false
      const disconnectedAnchor = {
        isConnected: false,
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
      } as unknown as HTMLElement

      const baseAnchor = { x: 850, y: 300 }
      let latest = { left: 0, top: 0 }
      const controller = createFloatingPositionController({
        getFloatingEl: () => null,
        getAnchorEl: () => (anchorConnected ? disconnectedAnchor : null),
        positionMode: 'fixed',
        computeBasePosition: delta =>
          clampFloatingPlacement({
            desiredLeft: baseAnchor.x + delta.dx - 170,
            aboveTop: baseAnchor.y + delta.dy - 46 - 10,
            belowTop: baseAnchor.y + delta.dy + 14,
            width: 340,
            height: 46,
            viewportWidth: env.mockWin.innerWidth,
            viewportHeight: env.mockWin.innerHeight,
          }),
        onPositionChange: pos => {
          latest = pos
        },
      })

      controller.updateBase()
      controller.attach()
      // 850 - 170 = 680 > 1000 - 340 - 10 = 650 -> clamped to 650; top = 300 - 46 - 10 = 244
      expect(latest).toEqual({ left: 650, top: 244 })

      // Window scroll down by +120px, right by +30px
      anchorConnected = true // still disconnected (isConnected: false) -> uses window scroll fallback
      env.mockWin.scrollX = 40
      env.mockWin.scrollY = 220
      env.mockWin.dispatch('scroll', { target: {} })
      expect(latest).toEqual({ left: 620, top: 124 })

      // Viewport shrinks on resize -> re-clamps against new viewport while preserving scrolled offset
      env.mockWin.innerWidth = 500
      env.mockWin.dispatch('resize')
      // maxLeft = 500 - 340 - 10 = 150; scrolled anchor y = 300 - 120 = 180 -> 180 - 46 - 10 = 124
      expect(latest).toEqual({ left: 150, top: 124 })

      controller.detach()
    } finally {
      env.restore()
    }
  })

  test('absolute mode (default) stores document coordinates, ignores window scroll, tracks inner container scroll, and updates on resize', () => {
    const env = setupMockWindow({ innerWidth: 1000, innerHeight: 800, scrollX: 20, scrollY: 300 })
    try {
      const floatingEl = {
        nodeType: 1,
        contains: (t: any) => t === floatingEl,
      } as unknown as HTMLElement

      // Anchor sits at viewport (200, 400) while window is scrolled to (20, 300) -> doc (220, 700)
      let anchorRect = { left: 200, top: 400, bottom: 430, width: 32 }
      const anchorEl = {
        isConnected: true,
        getBoundingClientRect: () => ({ ...anchorRect }),
      } as unknown as HTMLElement

      const emitted: Array<{ left: number; top: number }> = []
      const controller = createFloatingPositionController({
        getFloatingEl: () => floatingEl,
        getAnchorEl: () => anchorEl,
        computeBasePosition: () =>
          clampFloatingPlacement({
            desiredLeft: anchorRect.left,
            aboveTop: anchorRect.top - 200 - 8,
            belowTop: anchorRect.bottom + 8,
            width: 300,
            height: 200,
            viewportWidth: env.mockWin.innerWidth,
            viewportHeight: env.mockWin.innerHeight,
          }),
        onPositionChange: pos => emitted.push(pos),
      })

      controller.updateBase()
      controller.attach()
      // Viewport base (200, 192) + scroll (20, 300) = document (220, 492)
      expect(emitted).toEqual([{ left: 220, top: 492 }])

      // Pure window scroll: scrollY increases by +150, anchor viewport top drops by -150 -> doc coords unchanged!
      env.mockWin.scrollY = 450
      anchorRect = { left: 200, top: 250, bottom: 280, width: 32 }
      env.mockWin.dispatch('scroll', { target: { nodeType: 9 } })
      // Zero JS emissions on window scroll!
      expect(emitted).toHaveLength(1)

      // Inner scrollable container shifts anchorEl relative to document by (-15, -40)
      anchorRect = { left: 185, top: 210, bottom: 240, width: 32 }
      env.mockWin.dispatch('scroll', { target: { nodeType: 1 } })
      expect(emitted).toEqual([
        { left: 220, top: 492 },
        { left: 205, top: 452 },
      ])

      // Resize recalculates viewport clamped placement + current window scroll
      env.mockWin.innerWidth = 400 // maxLeft = 400 - 300 - 10 = 90 < 185 -> clamped viewport left = 90
      // anchor top = 210 -> aboveTop = 210 - 208 = 2 < 10 -> flips below: 240 + 8 = 248
      env.mockWin.dispatch('resize')
      expect(emitted[emitted.length - 1]).toEqual({
        left: 90 + 20,
        top: 248 + 450,
      })

      controller.detach()
    } finally {
      env.restore()
    }
  })
})

describe('editorHistory.ts — undo/redo stack and logical selection offsets', () => {
  class MockClassList {
    private set: Set<string>
    constructor(names: string[] = []) {
      this.set = new Set(names)
    }
    contains(c: string) {
      return this.set.has(c)
    }
    add(c: string) {
      this.set.add(c)
    }
    remove(c: string) {
      this.set.delete(c)
    }
  }

  class MockText {
    nodeType = 3
    nodeValue: string
    parentNode: MockEl | null = null
    constructor(val: string) {
      this.nodeValue = val
    }
  }

  class MockEl {
    nodeType = 1
    tagName: string
    classList: MockClassList
    attrs = new Map<string, string>()
    childNodes: Array<MockEl | MockText> = []
    parentNode: MockEl | null = null
    constructor(tag: string, children: Array<MockEl | MockText | string> = [], classes: string[] = [], attrs: Record<string, string> = {}) {
      this.tagName = tag.toUpperCase()
      this.classList = new MockClassList(classes)
      for (const [k, v] of Object.entries(attrs)) {
        this.attrs.set(k, v)
      }
      for (const ch of children) {
        const node = typeof ch === 'string' ? new MockText(ch) : ch
        node.parentNode = this
        this.childNodes.push(node)
      }
    }
    hasAttribute(name: string) {
      return this.attrs.has(name)
    }
    getAttribute(name: string) {
      return this.attrs.get(name) ?? null
    }
    set textContent(val: string) {
      this.childNodes = val ? [new MockText(val)] : []
    }
    get textContent(): string {
      return this.childNodes.map(c => (c.nodeType === 3 ? c.nodeValue : (c as MockEl).textContent)).join('')
    }
    cloneNode(deep = false): MockEl {
      const copy = new MockEl(
        this.tagName,
        deep ? this.childNodes.map(c => (c.nodeType === 3 ? new MockText(c.nodeValue) : (c as MockEl).cloneNode(true))) : [],
        [],
        Object.fromEntries(this.attrs.entries())
      )
      for (const c of ['tgb-editor-ce', 'spoiler', 'init']) {
        if (this.classList.contains(c)) copy.classList.add(c)
      }
      return copy
    }
    querySelector(selector: string): MockEl | null {
      return this.querySelectorAll(selector)[0] ?? null
    }
    querySelectorAll(selector: string): MockEl[] {
      const out: MockEl[] = []
      const walk = (el: MockEl) => {
        for (const ch of el.childNodes) {
          if (ch.nodeType === 1) {
            const childEl = ch as MockEl
            if (selector === '.tgb-editor-ce[data-custom-emoji-id]') {
              if (childEl.classList.contains('tgb-editor-ce') && childEl.hasAttribute('data-custom-emoji-id')) {
                out.push(childEl)
              }
            }
            walk(childEl)
          }
        }
      }
      walk(this)
      return out
    }
    get innerHTML(): string {
      return this.childNodes
        .map(c => {
          if (c.nodeType === 3) return c.nodeValue
          const el = c as MockEl
          const tag = el.tagName.toLowerCase()
          if (tag === 'br') return '<br>'
          const attrs = Array.from(el.attrs.entries())
            .map(([k, v]) => ` ${k}="${v}"`)
            .join('')
          const cls = ['tgb-editor-ce', 'spoiler', 'init'].filter(name => el.classList.contains(name)).join(' ')
          const clsAttr = cls ? ` class="${cls}"` : ''
          return `<${tag}${clsAttr}${attrs}>${el.innerHTML}</${tag}>`
        })
        .join('')
    }
  }

  function createMockDoc() {
    return {
      createRange() {
        const range: any = {
          startContainer: null,
          startOffset: 0,
          endContainer: null,
          endOffset: 0,
          setStart(node: any, offset: number) {
            this.startContainer = node
            this.startOffset = offset
          },
          setEnd(node: any, offset: number) {
            this.endContainer = node
            this.endOffset = offset
          },
        }
        return range
      },
    } as unknown as Document
  }

  test('selection offsets round-trip across plain text, Unicode emoji, custom emoji chips, <br>, and formatting tags', () => {
    const mockDoc = createMockDoc()
    const chip = new MockEl(
      'span',
      [new MockEl('img')],
      ['tgb-editor-ce'],
      { contenteditable: 'false', 'data-custom-emoji-id': '5368324170671202286', 'data-emoji-alt': '✦' }
    )
    const boldText = new MockText('hi')
    const boldEl = new MockEl('b', [boldText])
    const emojiText = new MockText('😀!')
    const afterChipText = new MockText('ok')
    const quoteText = new MockText('q')
    const quoteEl = new MockEl('blockquote', [quoteText])
    const root = new MockEl('div', [boldEl, new MockText(' '), emojiText, chip, afterChipText, new MockEl('br'), quoteEl])

    // 1. Selecting inside <b>hi</b> -> offsets (0, 2) restore inside <b>
    const boldOffsets = getEditorSelectionOffsets(root as unknown as Node, {
      startContainer: boldText as unknown as Node,
      startOffset: 0,
      endContainer: boldText as unknown as Node,
      endOffset: 2,
    })
    expect(boldOffsets).toEqual({ start: 0, end: 2 })
    const restoredBold = restoreEditorSelectionOffsets(root as unknown as Node, boldOffsets.start, boldOffsets.end, mockDoc) as any
    expect(restoredBold.startContainer).toBe(boldText)
    expect(restoredBold.startOffset).toBe(0)
    expect(restoredBold.endContainer).toBe(boldText)
    expect(restoredBold.endOffset).toBe(2)

    // 2. Selecting " 😀" starting right after <b> -> prefers forward start (" ", 0), not (boldText, 2)
    const afterBoldOffsets = getEditorSelectionOffsets(root as unknown as Node, {
      startContainer: root.childNodes[1] as unknown as Node,
      startOffset: 0,
      endContainer: emojiText as unknown as Node,
      endOffset: 2, // end of 😀 (UTF-16 length 2)
    })
    expect(afterBoldOffsets).toEqual({ start: 2, end: 5 })
    const restoredAfterBold = restoreEditorSelectionOffsets(root as unknown as Node, afterBoldOffsets.start, afterBoldOffsets.end, mockDoc) as any
    expect(restoredAfterBold.startContainer).toBe(root.childNodes[1])
    expect(restoredAfterBold.startOffset).toBe(0)
    expect(restoredAfterBold.endContainer).toBe(emojiText)
    expect(restoredAfterBold.endOffset).toBe(2)

    // 3. Custom emoji chip is atomic length 1: selecting just the chip gives (6, 7)
    // "hi" (2) + " " (1) + "😀!" (3) = 6 before chip, 7 after chip
    const chipOffsets = getEditorSelectionOffsets(root as unknown as Node, {
      startContainer: root as unknown as Node,
      startOffset: 3,
      endContainer: root as unknown as Node,
      endOffset: 4,
    })
    expect(chipOffsets).toEqual({ start: 6, end: 7 })
    const restoredChip = restoreEditorSelectionOffsets(root as unknown as Node, 6, 7, mockDoc) as any
    expect(restoredChip.startContainer).toBe(root)
    expect(restoredChip.startOffset).toBe(3)
    expect(restoredChip.endContainer).toBe(root)
    expect(restoredChip.endOffset).toBe(4)

    // Caret right after chip (offset 7)
    const afterChipPos = resolveEditorDomPosition(root as unknown as Node, 7)
    expect(afterChipPos.node).toBe(root)
    expect(afterChipPos.offset).toBe(4)

    // 4. Inside blockquote vs after blockquote
    // 7 + "ok" (2) + <br> (1) = 10 -> inside quote at "q" end is 11, outside quote (root, 7) is 12
    const inQuoteOffsets = getEditorSelectionOffsets(root as unknown as Node, {
      startContainer: quoteText as unknown as Node,
      startOffset: 1,
      endContainer: quoteText as unknown as Node,
      endOffset: 1,
    })
    expect(inQuoteOffsets).toEqual({ start: 11, end: 11 })
    const inQuotePos = resolveEditorDomPosition(root as unknown as Node, 11)
    expect(inQuotePos.node).toBe(quoteText)
    expect(inQuotePos.offset).toBe(1)

    const outQuoteOffsets = getEditorSelectionOffsets(root as unknown as Node, {
      startContainer: root as unknown as Node,
      startOffset: 7,
      endContainer: root as unknown as Node,
      endOffset: 7,
    })
    expect(outQuoteOffsets).toEqual({ start: 12, end: 12 })
    const outQuotePos = resolveEditorDomPosition(root as unknown as Node, 12)
    expect(outQuotePos.node).toBe(root)
    expect(outQuotePos.offset).toBe(7)
  })

  test('snapshotEditorHtml strips mounted chip internals down to data-emoji-alt', () => {
    const chip = new MockEl(
      'span',
      [new MockEl('span', [new MockEl('svg')], ['tgb-tgs-host'])],
      ['tgb-editor-ce', 'init'],
      { contenteditable: 'false', 'data-custom-emoji-id': '123', 'data-emoji-alt': '✦' }
    )
    const root = new MockEl('div', ['hi', chip])
    expect(snapshotEditorHtml(root as unknown as HTMLElement)).toBe(
      'hi<span class="tgb-editor-ce" contenteditable="false" data-custom-emoji-id="123" data-emoji-alt="✦">✦</span>'
    )
  })

  test('EditorHistoryManager handles push, undo, redo for emoji, custom chips, formatting, coalescing, redo invalidation, and max cap', () => {
    const mgr = new EditorHistoryManager()
    mgr.reset({ html: '', selStart: 0, selEnd: 0 })
    expect(mgr.canUndo()).toBe(false)
    expect(mgr.canRedo()).toBe(false)

    // Coalesced typing burst within 800ms
    expect(mgr.push({ html: 'h', selStart: 1, selEnd: 1 }, { coalesceKey: 'insert', now: 1000 })).toBe(true)
    expect(mgr.push({ html: 'hi', selStart: 2, selEnd: 2 }, { coalesceKey: 'insert', now: 1150 })).toBe(true)
    expect(mgr.size()).toBe(2)

    // Duplicate exact entry ignored
    expect(mgr.push({ html: 'hi', selStart: 2, selEnd: 2 })).toBe(false)

    // Same html with updated cursor updates current entry without pushing a duplicate step
    expect(mgr.push({ html: 'hi', selStart: 0, selEnd: 2 })).toBe(false)
    expect(mgr.current()).toEqual({ html: 'hi', selStart: 0, selEnd: 2 })
    expect(mgr.size()).toBe(2)

    // Formatting tag toggle (discrete)
    mgr.push({ html: '<b>hi</b>', selStart: 0, selEnd: 2 })
    // Unicode emoji insertion (discrete)
    mgr.push({ html: '<b>hi</b>😀', selStart: 4, selEnd: 4 })
    // Custom emoji chip insertion (discrete)
    const chipHtml = '<b>hi</b>😀<span class="tgb-editor-ce" contenteditable="false" data-custom-emoji-id="42" data-emoji-alt="✦">✦</span>'
    mgr.push({ html: chipHtml, selStart: 5, selEnd: 5 })
    expect(mgr.size()).toBe(5)

    // Undo step by step
    expect(mgr.undo()).toEqual({ html: '<b>hi</b>😀', selStart: 4, selEnd: 4 })
    expect(mgr.undo()).toEqual({ html: '<b>hi</b>', selStart: 0, selEnd: 2 })
    expect(mgr.undo()).toEqual({ html: 'hi', selStart: 0, selEnd: 2 })
    expect(mgr.canUndo()).toBe(true)
    expect(mgr.canRedo()).toBe(true)

    // Redo forward
    expect(mgr.redo()).toEqual({ html: '<b>hi</b>', selStart: 0, selEnd: 2 })
    expect(mgr.redo()).toEqual({ html: '<b>hi</b>😀', selStart: 4, selEnd: 4 })

    // New edit invalidates redo tail
    expect(mgr.canRedo()).toBe(true)
    mgr.push({ html: '<del>hi</del>', selStart: 0, selEnd: 2 })
    expect(mgr.canRedo()).toBe(false)
    expect(mgr.redo()).toBeNull()

    // Bounded capacity check (MAX_HISTORY = 100)
    expect(MAX_HISTORY).toBe(100)
    const capped = new EditorHistoryManager(MAX_HISTORY)
    capped.reset({ html: '0', selStart: 1, selEnd: 1 })
    for (let i = 1; i <= 150; i++) {
      capped.push({ html: String(i), selStart: 1, selEnd: 1 })
    }
    expect(capped.size()).toBe(MAX_HISTORY)
    expect(capped.current()?.html).toBe('150')
    let steps = 0
    while (capped.undo()) steps++
    expect(steps).toBe(MAX_HISTORY - 1)
    expect(capped.current()?.html).toBe('51')
  })
})

describe('spoilers.ts — inner wrapper normalization for strikethrough stacking', () => {
  test('initSpoilers wraps bare text and direct inline children in <span class="tgb-spoiler-inner"> while leaving single-span spoilers untouched', () => {
    const origDoc = (globalThis as any).document

    class MockClassList {
      private set = new Set<string>()
      constructor(names: string[] = []) {
        for (const n of names) this.set.add(n)
      }
      contains(c: string) {
        return this.set.has(c)
      }
      add(c: string) {
        this.set.add(c)
      }
      toggle(c: string) {
        if (this.set.has(c)) this.set.delete(c)
        else this.set.add(c)
      }
    }

    class MockNode {
      nodeType: number
      nodeValue: string | null = null
      parentElement: MockElement | null = null
      parentNode: MockElement | null = null
      constructor(nodeType: number) {
        this.nodeType = nodeType
      }
    }

    class MockText extends MockNode {
      constructor(text: string) {
        super(3)
        this.nodeValue = text
      }
    }

    class MockElement extends MockNode {
      tagName: string
      classList: MockClassList
      className = ''
      childNodes: MockNode[] = []
      listeners = new Map<string, Array<(e?: any) => void>>()

      constructor(tag: string, classes: string[] = [], children: MockNode[] = []) {
        super(1)
        this.tagName = tag.toUpperCase()
        this.classList = new MockClassList(classes)
        this.className = classes.join(' ')
        for (const ch of children) {
          this.appendChild(ch)
        }
      }

      get firstChild(): MockNode | null {
        return this.childNodes[0] ?? null
      }

      appendChild(node: MockNode): MockNode {
        if (node.parentNode) {
          const idx = node.parentNode.childNodes.indexOf(node)
          if (idx >= 0) node.parentNode.childNodes.splice(idx, 1)
        }
        node.parentNode = this
        node.parentElement = this
        this.childNodes.push(node)
        return node
      }

      addEventListener(type: string, fn: (e?: any) => void) {
        if (!this.listeners.has(type)) this.listeners.set(type, [])
        this.listeners.get(type)!.push(fn)
      }

      closest() {
        return null
      }

      querySelectorAll() {
        return []
      }
    }

    // 1. Bare text inside .spoiler (like <s><span class="spoiler">secret</span></s>)
    const bareSpoiler = new MockElement('span', ['spoiler'], [new MockText('secret')])
    // 2. Multiple / non-span inline children inside .spoiler
    const delChild = new MockElement('del', [], [new MockText('struck')])
    const multiSpoiler = new MockElement('span', ['spoiler'], [delChild, new MockText(' more')])
    // 3. Already wrapped in a single <span>
    const existingInner = new MockElement('span', [], [new MockText('already wrapped')])
    const wrappedSpoiler = new MockElement('span', ['spoiler'], [existingInner])

    ;(globalThis as any).document = {
      querySelectorAll(selector: string) {
        if (selector === '.spoiler') {
          return [bareSpoiler, multiSpoiler, wrappedSpoiler]
        }
        return []
      },
      createElement(tag: string) {
        return new MockElement(tag)
      },
    }

    try {
      initSpoilers()

      // bareSpoiler wrapped in <span class="tgb-spoiler-inner">
      expect(bareSpoiler.classList.contains('spoiler-init')).toBe(true)
      expect(bareSpoiler.childNodes).toHaveLength(1)
      const bareInner = bareSpoiler.firstChild as MockElement
      expect(bareInner.tagName).toBe('SPAN')
      expect(bareInner.className).toBe('tgb-spoiler-inner')
      expect((bareInner.firstChild as MockText).nodeValue).toBe('secret')

      // multiSpoiler wrapped all children inside <span class="tgb-spoiler-inner">
      expect(multiSpoiler.childNodes).toHaveLength(1)
      const multiInner = multiSpoiler.firstChild as MockElement
      expect(multiInner.tagName).toBe('SPAN')
      expect(multiInner.className).toBe('tgb-spoiler-inner')
      expect(multiInner.childNodes).toHaveLength(2)
      expect(multiInner.childNodes[0]).toBe(delChild)

      // wrappedSpoiler left untouched (same existingInner node, not double-wrapped)
      expect(wrappedSpoiler.childNodes).toHaveLength(1)
      expect(wrappedSpoiler.firstChild).toBe(existingInner)
      expect(existingInner.className).toBe('')
    } finally {
      if (origDoc === undefined) delete (globalThis as any).document
      else (globalThis as any).document = origDoc
    }
  })

  test('sanitizeCommentSnippetHtml renders inline HTML and custom emojis without raw tag truncation', () => {
    const htmlSnippet = sanitizeCommentSnippetHtml(
      '<p><s>喵喵 <i class="custom-emoji" data-custom-emoji-id="4981340762533790955">✦</i></s><script>alert(1)</script></p><p>第二行</p>',
      '~~喵喵 <tg-emoji emoji-id="4981340762533790955">✦</tg-emoji>~~'
    )
    expect(htmlSnippet).toBe(
      '<s>喵喵 <i data-custom-emoji-id="4981340762533790955" class="custom-emoji">✦</i></s> 第二行'
    )

    const mdFallback = sanitizeCommentSnippetHtml(
      null,
      '~~喵喵~~ <tg-emoji emoji-id="4981340762533790955">✦</tg-emoji><script>alert(1)</script>',
      '[图片]'
    )
    expect(mdFallback).toBe(
      '[图片] <del>喵喵</del> <i data-custom-emoji-id="4981340762533790955" class="custom-emoji">✦</i>&lt;script&gt;alert(1)&lt;/script&gt;'
    )
  })

  test('normalizeAnonDisplayName and pickAnonIdentity deterministically assign anon avatars and colored rings', () => {
    expect(normalizeAnonDisplayName(null)).toBe('Anon')
    expect(normalizeAnonDisplayName('')).toBe('Anon')
    expect(normalizeAnonDisplayName('Anonymous')).toBe('Anon')
    expect(normalizeAnonDisplayName('Anonymous #64b6')).toBe('Anon #64b6')
    expect(normalizeAnonDisplayName('Anon #a528')).toBe('Anon #a528')

    const avatars = Array.from({length: 9}, (_, i) => `/anons/anon-${i + 1}.webp`)
    const id1 = pickAnonIdentity('Anonymous #64b6', avatars)
    const id2 = pickAnonIdentity('Anon #64b6', avatars)
    // Legacy and normalized forms map to the exact same avatar & ring color across messages
    expect(id1).toEqual(id2)
    expect(avatars).toContain(id1.avatarUrl!)
    expect(ANON_RING_PALETTE).toContain(id1.ringColor as any)

    // Without avatars provided, still assigns a deterministic colored ring
    const noAvatar = pickAnonIdentity('Anon #64b6', [])
    expect(noAvatar.avatarUrl).toBeNull()
    expect(noAvatar.ringColor).toBe(id1.ringColor)

    // Distinct anon users get good spread across avatars and ring colors
    const distinctCombos = new Set<string>()
    for (let i = 0; i < 40; i++) {
      const hex = i.toString(16).padStart(4, '0')
      const res = pickAnonIdentity(`Anon #${hex}`, avatars)
      distinctCombos.add(`${res.avatarUrl}|${res.ringColor}`)
    }
    expect(distinctCombos.size).toBeGreaterThan(20)
  })
})

describe('calculateAlbumLayout full-width bleed mode', () => {
  test('expands portrait 3-photo and 4-photo (e.g. #9642) albums to full maxWidth when fillWidth=true', () => {
    const portrait4 = Array.from({length: 4}, (_, i) => ({
      url: `/${i}.webp`,
      width: 1536,
      height: 2048,
    }))
    const shrink = calculateAlbumLayout(portrait4, 450, 450, false)
    expect(shrink.containerStyle.width).toBeLessThan(450)

    const filled4 = calculateAlbumLayout(portrait4, 450, 450, true)
    expect(filled4.containerStyle.width).toBe(450)
    expect(filled4.layout[0].dimensions.x).toBe(0)
    expect(filled4.layout[1].dimensions.x + filled4.layout[1].dimensions.width).toBe(450)
    expect(filled4.layout[3].dimensions.x + filled4.layout[3].dimensions.width).toBe(450)

    const portrait3 = Array.from({length: 3}, (_, i) => ({
      url: `/p${i}.webp`,
      width: 1080,
      height: 1920,
    }))
    const filled3 = calculateAlbumLayout(portrait3, 450, 450, true)
    expect(filled3.containerStyle.width).toBe(450)
    expect(filled3.layout[1].dimensions.x + filled3.layout[1].dimensions.width).toBe(450)
  })
})
