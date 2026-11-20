import moment from 'moment'
import {canonicalReactionKey} from './reactions'
import type {
  CommentDTO,
  MergedPoll,
  MergedPollPublic,
  MergedReaction,
  MergedReactionPublic,
  Post,
  ReactionTogglePayload,
} from './models'

/**
 * Apply an optimistic reaction toggle to a copy of the reactions array.
 * Uses variation-selector-normalized matching so `"❤"` and `"❤️"` toggle the same reaction.
 */
export function applyOptimisticReactionToggle(
  existing: MergedReaction[],
  payload: ReactionTogglePayload
): MergedReaction[] {
  const next = existing.map(r => ({...r}))
  const targetKey = payload.custom_emoji_id
    ? `c:${payload.custom_emoji_id}`
    : `e:${payload.emoji ?? ''}`
  const targetCanonical = canonicalReactionKey(payload)

  const idx = next.findIndex(r =>
    r.reaction_key === targetKey ||
    (targetCanonical !== '' && canonicalReactionKey(r) === targetCanonical)
  )

  if (idx >= 0) {
    const cur = next[idx]
    const nextReacted = !cur.reacted
    const delta = nextReacted ? 1 : -1
    const nextWeb = Math.max(0, cur.web_count + delta)
    const nextCount = Math.max(0, cur.count + delta)
    if (nextCount <= 0 && cur.tg_count <= 0) {
      next.splice(idx, 1)
    } else {
      next.splice(idx, 1, {
        ...cur,
        reacted: nextReacted,
        web_count: nextWeb,
        count: nextCount,
      })
    }
  } else {
    next.push({
      reaction_key: targetKey,
      emoji: payload.emoji ?? null,
      custom_emoji_id: payload.custom_emoji_id ?? null,
      tg_count: 0,
      web_count: 1,
      count: 1,
      reacted: true,
    })
  }

  return next
}

/**
 * Merge a public SSE `reaction.updated` payload while preserving per-user `reacted` state.
 */
export function mergePublicReactions(
  existing: MergedReaction[],
  incoming: MergedReactionPublic[]
): MergedReaction[] {
  const localReacted = new Map<string, boolean>()
  for (const r of existing) {
    localReacted.set(r.reaction_key, r.reacted)
    const canon = canonicalReactionKey(r)
    if (canon) localReacted.set(canon, r.reacted)
  }
  return incoming.map(r => ({
    ...r,
    reacted: localReacted.get(r.reaction_key) ?? localReacted.get(canonicalReactionKey(r)) ?? false,
  }))
}

/**
 * Merge a public SSE `poll.updated` payload while preserving local `my_votes`,
 * `correct_option_idx`, and `explanation`.
 */
export function mergePublicPoll(
  existing: MergedPoll | null | undefined,
  incoming: MergedPollPublic
): MergedPoll {
  return {
    ...incoming,
    my_votes: existing?.my_votes ? [...existing.my_votes] : [],
    correct_option_idx: incoming.correct_option_idx ?? existing?.correct_option_idx ?? null,
    explanation: incoming.explanation ?? existing?.explanation ?? null,
  }
}

/**
 * Upsert an incoming comment (e.g. from SSE `comment.created` or local POST response)
 * while preserving `is_mine` and `can_delete` flags that public SSE broadcasts omit.
 */
export function upsertCommentInList(
  list: CommentDTO[],
  incoming: CommentDTO
): CommentDTO[] {
  const next = [...list]
  const idx = next.findIndex(c => c.id === incoming.id)
  if (idx >= 0) {
    const prev = next[idx]
    next.splice(idx, 1, {
      ...incoming,
      reactions: incoming.reactions?.length ? incoming.reactions : (prev.reactions ?? incoming.reactions),
      is_mine: prev.is_mine || incoming.is_mine,
      can_delete: prev.can_delete || incoming.can_delete,
    })
  } else {
    next.push(incoming)
  }
  return next
}

/**
 * Apply an optimistic reaction toggle to a specific comment inside a comments list.
 */
export function applyOptimisticCommentReactionToggle(
  list: CommentDTO[],
  commentId: number,
  payload: ReactionTogglePayload
): CommentDTO[] {
  const idx = list.findIndex(c => c.id === commentId)
  if (idx < 0) return list
  const target = list[idx]
  const next = list.slice()
  next.splice(idx, 1, {
    ...target,
    reactions: applyOptimisticReactionToggle(target.reactions ?? [], payload),
  })
  return next
}

/**
 * Merge a comment's reactions list (from SSE `comment.reaction.updated` or HTTP toggle response)
 * while preserving local `reacted` state when incoming entries omit it.
 */
export function mergeCommentReactionsInList(
  list: CommentDTO[],
  commentId: number,
  reactions: Array<MergedReactionPublic | MergedReaction>
): CommentDTO[] {
  const idx = list.findIndex(c => c.id === commentId)
  if (idx < 0) return list
  const target = list[idx]
  const existing = target.reactions ?? []
  const merged: MergedReaction[] = reactions.every(r => 'reacted' in r && typeof r.reacted === 'boolean')
    ? (reactions as MergedReaction[]).map(r => ({...r}))
    : mergePublicReactions(existing, reactions)
  const next = list.slice()
  next.splice(idx, 1, {
    ...target,
    reactions: merged,
  })
  return next
}

/**
 * Soft-delete a comment in the local list: turn it into a tombstone if it has
 * non-deleted children, otherwise remove it and recursively prune any ancestor
 * tombstones that no longer have non-deleted children.
 */
export function applyCommentDeleteInList(
  list: CommentDTO[],
  commentId: number
): CommentDTO[] {
  const idx = list.findIndex(c => c.id === commentId)
  if (idx < 0) return list

  const next = list.map(c => ({...c}))
  next[idx] = {
    ...next[idx],
    deleted: true,
    body_text: '',
    body_html: '',
    can_delete: false,
  }

  // Iteratively prune any deleted tombstone that has no remaining children
  let changed = true
  while (changed) {
    changed = false
    const parentIdsWithChildren = new Set<number>()
    for (const c of next) {
      if (c.parent_id !== null) {
        parentIdsWithChildren.add(c.parent_id)
      }
    }
    for (let i = next.length - 1; i >= 0; i--) {
      const c = next[i]
      if (c.deleted && !parentIdsWithChildren.has(c.id)) {
        next.splice(i, 1)
        changed = true
      }
    }
  }

  return next
}

/**
 * Decide whether an SSE `comment.created` event should increment `comment_count`.
 * Prevents double-counting when:
 *  - the comment ID was already seen (local POST or initial GET /comments), OR
 *  - the comment is an SSE replay created before (or at) the post's last hydration snapshot.
 */
export function shouldIncrementCommentCount(
  seenCommentIds: Set<number>,
  postHydratedAtMs: number | undefined,
  comment: Pick<CommentDTO, 'id' | 'created_at'>
): boolean {
  if (seenCommentIds.has(comment.id)) return false
  if (postHydratedAtMs !== undefined) {
    const createdMs = Date.parse(comment.created_at)
    if (Number.isFinite(createdMs) && createdMs <= postHydratedAtMs) {
      return false
    }
  }
  return true
}

/**
 * Compare two numeric arrays regardless of order.
 */
export function sortedNumberArraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}

/**
 * Format a post ISO timestamp deterministically in UTC during SSR & initial client hydration
 * (`useLocalTimezone = false`), then in the visitor's local timezone after mount (`useLocalTimezone = true`).
 */
export function formatPostDate(isoDate: string, format: string, useLocalTimezone: boolean): string {
  return useLocalTimezone
    ? moment(isoDate).format(format)
    : moment.utc(isoDate).format(format)
}

/**
 * Format a compact comment header date: `MM-DD` for the current year, `YYYY-MM-DD` for earlier years.
 */
export function formatCommentShortDate(isoDate: string, referenceYear: number = new Date().getFullYear()): string {
  const m = moment(isoDate)
  if (!m.isValid()) return ''
  return m.year() === referenceYear ? m.format('MM-DD') : m.format('YYYY-MM-DD')
}

/**
 * Merge a freshly ingested canonical post list (ascending order, e.g. from `postsData` / `posts.json`)
 * into reverse-chronological order while retaining any SSE `post.created` posts not yet present
 * in the fetched snapshot and excluding any posts deleted via SSE `post.deleted`.
 */
export function mergePostsWithLive(
  incomingAscending: Post[],
  liveCreatedPosts: Post[],
  deletedPostIds: Set<number>
): Post[] {
  const result = incomingAscending
    .filter(p => p.type !== 'service' && !deletedPostIds.has(p.id))
    .slice()
    .reverse()

  const existingIds = new Set(result.map(p => p.id))

  // Sort live posts newest-first before inserting so relative order is deterministic
  const extraLive = liveCreatedPosts
    .filter(p => p.type !== 'service' && !deletedPostIds.has(p.id) && !existingIds.has(p.id))
    .slice()
    .sort((a, b) => b.id - a.id)

  for (const live of extraLive) {
    const insertIdx = result.findIndex(p => p.id < live.id)
    if (insertIdx < 0) result.push(live)
    else result.splice(insertIdx, 0, live)
    existingIds.add(live.id)
  }

  return result
}

/**
 * Remove a deleted post from the reverse-chronological rawPosts list.
 */
export function removeDeletedPost(list: Post[], postId: number): Post[] {
  const idx = list.findIndex(p => p.id === postId)
  if (idx < 0) return list
  const next = list.slice()
  next.splice(idx, 1)
  return next
}

export interface ChatBubbleItem {
  comment: CommentDTO
  isOwn: boolean
  firstInGroup: boolean
  lastInGroup: boolean
  parentComment: CommentDTO | null
}

const GROUP_WINDOW_MS = 5 * 60 * 1000

function commentSenderKey(c: CommentDTO, isOwn: boolean): string {
  const author = c.author
  return [
    isOwn ? 'own' : 'in',
    c.source,
    author?.role ?? '',
    author?.verified ? '1' : '0',
    author?.provider ?? '',
    author?.avatar_url ?? '',
    author?.username ?? '',
    author?.display_name ?? '',
  ].join('|')
}

/**
 * Build flat chronological Telegram-style chat bubbles with consecutive sender grouping
 * (within 5 minutes) and direct `parentComment` lookup for inline reply quotes.
 */
export function buildChatMessages(
  comments: CommentDTO[],
  ownCommentIds: Set<number> = new Set()
): ChatBubbleItem[] {
  if (!comments.length) return []

  const sorted = comments.slice().sort((a, b) => {
    const ta = Date.parse(a.created_at)
    const tb = Date.parse(b.created_at)
    if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) {
      return ta - tb
    }
    return a.id - b.id
  })

  const byId = new Map<number, CommentDTO>()
  for (const c of sorted) byId.set(c.id, c)

  const items: ChatBubbleItem[] = sorted.map(c => ({
    comment: c,
    isOwn: !c.deleted && (c.is_mine || ownCommentIds.has(c.id)),
    firstInGroup: true,
    lastInGroup: true,
    parentComment: c.parent_id !== null ? (byId.get(c.parent_id) ?? null) : null,
  }))

  for (let i = 0; i < items.length; i++) {
    const cur = items[i]
    if (cur.comment.deleted) continue

    const curKey = commentSenderKey(cur.comment, cur.isOwn)
    const curTime = Date.parse(cur.comment.created_at)

    if (i > 0) {
      const prev = items[i - 1]
      if (!prev.comment.deleted) {
        const prevKey = commentSenderKey(prev.comment, prev.isOwn)
        const prevTime = Date.parse(prev.comment.created_at)
        const withinWindow =
          !Number.isFinite(curTime) ||
          !Number.isFinite(prevTime) ||
          Math.abs(curTime - prevTime) <= GROUP_WINDOW_MS
        if (prevKey === curKey && withinWindow) {
          cur.firstInGroup = false
          prev.lastInGroup = false
        }
      }
    }
  }

  return items
}

const OWN_COMMENTS_STORAGE_KEY = 'tgb_own_comment_ids'
const MAX_STORED_OWN_IDS = 500

export function loadOwnCommentIds(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    if (typeof localStorage === 'undefined') return new Set()
    const raw = localStorage.getItem(OWN_COMMENTS_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)))
  } catch {
    return new Set()
  }
}

export function saveOwnCommentId(commentId: number): void {
  if (typeof window === 'undefined') return
  try {
    if (typeof localStorage === 'undefined') return
    const ids = Array.from(loadOwnCommentIds())
    if (!ids.includes(commentId)) {
      ids.push(commentId)
    }
    const trimmed = ids.length > MAX_STORED_OWN_IDS ? ids.slice(ids.length - MAX_STORED_OWN_IDS) : ids
    localStorage.setItem(OWN_COMMENTS_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // Ignore storage quota / private-mode / sandboxed iframe failures
  }
}
