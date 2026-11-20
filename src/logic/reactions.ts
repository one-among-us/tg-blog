import type {MergedReaction, Post} from './models'
import {resolveRelativeUrl} from './url'

export const CURATED_REACTIONS: readonly string[] = [
  '❤️', '👍', '🔥', '🥰', '👏', '😂', '😮', '😢', '🎉', '✨',
]

export const TELEGRAM_CHANNEL_REACTIONS: readonly string[] = [
  '👍', '👎', '❤️', '🔥', '🥰', '👏', '😁', '🤔', '🤯', '😱', '🤬', '😢', '🎉', '🤩',
  '🤮', '💩', '🙏', '👌', '🕊', '🤡', '🥱', '🥴', '😍', '🐳', '❤️‍🔥', '🌚', '🌭', '💯',
  '🤣', '⚡', '🍌', '🏆', '💔', '🤨', '😐', '🍓', '🍾', '💋', '😈', '😴', '😭', '🤓',
  '👻', '👨‍💻', '👀', '🎃', '🙈', '😇', '😨', '🤝', '✍️', '🤗', '🫡', '🎅', '🎄', '☃️',
  '💅', '🤪', '🗿', '🆒', '💘', '🙉', '🦄', '😘', '💊', '🙊', '😎', '👾', '🤷',
]

export interface ReactionChoice {
  reaction_key: string
  canonical_key: string
  emoji?: string | null
  custom_emoji_id?: string | null
  custom_emoji_src?: string | null
}

const CUSTOM_EMOJI_ID_RE = /^\d+$/
const CUSTOM_EMOJI_TAG_RE = /<i\b[^>]*\bcustom-emoji\b[^>]*>/gi
const EMOJI_SRC_ATTR_RE = /\bemoji-src\s*=\s*(?:"([^"]+)"|'([^']+)')/i
const EPOCH_BASE_RE = /^(.*\/epochs\/\d+)\/(?:media|emoji)\//

/**
 * Strip Unicode text/emoji variation selectors (`\uFE0E` / `\uFE0F`) so Telegram's
 * `"❤"` (`\u2764`) and `"❤️"` (`\u2764\uFE0F`) compare equal.
 */
export function normalizeEmoji(emoji: string): string {
  return emoji.replace(/[\ufe0e\ufe0f]/g, '')
}

/**
 * Compute a variation-selector-normalized canonical reaction key for deduplication & matching.
 */
export function canonicalReactionKey(item: {
  reaction_key?: string | null
  emoji?: string | null
  custom_emoji_id?: string | null
}): string {
  if (item.custom_emoji_id) {
    return `c:${item.custom_emoji_id}`
  }
  if (item.emoji) {
    return `e:${normalizeEmoji(item.emoji)}`
  }
  if (item.reaction_key) {
    if (item.reaction_key.startsWith('e:')) {
      return `e:${normalizeEmoji(item.reaction_key.slice(2))}`
    }
    return item.reaction_key
  }
  return ''
}

export function isValidCustomEmojiId(id?: string | null): id is string {
  return !!id && CUSTOM_EMOJI_ID_RE.test(id)
}

function extractEmojiIdFromSrc(rawSrc: string): string | null {
  const clean = rawSrc.split('?')[0].split('#')[0]
  const fileName = clean.split('/').pop() || ''
  const dotIdx = fileName.lastIndexOf('.')
  const base = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName
  return CUSTOM_EMOJI_ID_RE.test(base) ? base : null
}

/**
 * Scan loaded posts for verified `<i ... class="... custom-emoji ..." emoji-src="...">` tags
 * and map `custom_emoji_id -> resolved asset URL`. Only verified HTML `emoji-src` assets
 * are added to the global channel map (no unverified extensionless guesses).
 */
export function extractCustomEmojiAssets(posts: Post[], postsUrl: string): Record<string, string> {
  const map: Record<string, string> = {}

  for (const post of posts) {
    if (!post.text) continue
    CUSTOM_EMOJI_TAG_RE.lastIndex = 0
    let tagMatch: RegExpExecArray | null
    while ((tagMatch = CUSTOM_EMOJI_TAG_RE.exec(post.text)) !== null) {
      const attrMatch = EMOJI_SRC_ATTR_RE.exec(tagMatch[0])
      if (!attrMatch) continue
      const rawSrc = (attrMatch[1] ?? attrMatch[2] ?? '').replace(/&amp;/g, '&').trim()
      if (!rawSrc) continue
      const id = extractEmojiIdFromSrc(rawSrc)
      if (!id) continue
      const resolved = resolveRelativeUrl(rawSrc, postsUrl)
      if (resolved) {
        map[id] = resolved
      }
    }
  }

  return map
}

/**
 * Infer epoch emoji directory (e.g. `/api/life/media/epochs/2/emoji/`) from post media/emoji URLs
 * matching `/^(.*\/epochs\/\d+)\/(?:media|emoji)\//`.
 */
export function inferEpochEmojiBase(posts: Post[], postsUrl: string): string | null {
  const check = (raw?: string | null): string | null => {
    if (!raw) return null
    const resolved = resolveRelativeUrl(raw, postsUrl)
    if (!resolved) return null
    const m = EPOCH_BASE_RE.exec(resolved)
    return m ? `${m[1]}/emoji/` : null
  }

  for (const post of posts) {
    if (post.images) {
      for (const img of post.images) {
        const hit = check(img.url) || check(img.thumb)
        if (hit) return hit
      }
    }
    if (post.files) {
      for (const f of post.files) {
        const hit = check(f.url) || check(f.thumb)
        if (hit) return hit
      }
    }
    if (post.text) {
      CUSTOM_EMOJI_TAG_RE.lastIndex = 0
      let tagMatch: RegExpExecArray | null
      while ((tagMatch = CUSTOM_EMOJI_TAG_RE.exec(post.text)) !== null) {
        const attrMatch = EMOJI_SRC_ATTR_RE.exec(tagMatch[0])
        if (!attrMatch) continue
        const rawSrc = (attrMatch[1] ?? attrMatch[2] ?? '').replace(/&amp;/g, '&').trim()
        const hit = check(rawSrc)
        if (hit) return hit
      }
    }
  }

  return null
}

/**
 * Resolve a custom emoji asset URL, checking verified HTML assets first, then an inferred epoch
 * emoji base directory, and finally falling back to `emoji/{id}` relative to `postsUrl`.
 */
export function resolveCustomEmojiBaseSrc(
  id: string,
  channelCustomEmojis: Record<string, string>,
  postsUrl: string,
  epochEmojiBase?: string | null
): string {
  if (!isValidCustomEmojiId(id)) return ''
  if (channelCustomEmojis[id]) return channelCustomEmojis[id]
  if (epochEmojiBase) return `${epochEmojiBase}${id}`
  return resolveRelativeUrl(`emoji/${id}`, postsUrl)
}

/**
 * Build the ordered, deduplicated reaction choices for a post:
 * 1. All existing reactions on this post (standard emoji + valid custom_emoji_id)
 * 2. Curated warm reactions
 * 3. Verified channel custom emojis seen across loaded posts on the page
 * 4. Full Telegram standard channel reactions (~65 emojis)
 *
 * Deduplicates variation selectors (`❤` vs `❤️`) via `canonicalReactionKey`.
 */
export function buildAvailableReactions(
  postReactions: MergedReaction[],
  channelCustomEmojis: Record<string, string>,
  postsUrl: string,
  epochEmojiBase?: string | null
): ReactionChoice[] {
  const seen = new Set<string>()
  const out: ReactionChoice[] = []

  const add = (choice: ReactionChoice) => {
    if (!choice.canonical_key || seen.has(choice.canonical_key)) return
    seen.add(choice.canonical_key)
    out.push(choice)
  }

  // 1. Existing reactions on this post first
  for (const r of postReactions) {
    if (r.custom_emoji_id) {
      if (!isValidCustomEmojiId(r.custom_emoji_id)) continue
      const key = r.reaction_key || `c:${r.custom_emoji_id}`
      add({
        reaction_key: key,
        canonical_key: canonicalReactionKey({custom_emoji_id: r.custom_emoji_id}),
        emoji: null,
        custom_emoji_id: r.custom_emoji_id,
        custom_emoji_src: resolveCustomEmojiBaseSrc(
          r.custom_emoji_id,
          channelCustomEmojis,
          postsUrl,
          epochEmojiBase
        ),
      })
    } else if (r.emoji) {
      add({
        reaction_key: r.reaction_key || `e:${r.emoji}`,
        canonical_key: canonicalReactionKey({emoji: r.emoji}),
        emoji: r.emoji,
        custom_emoji_id: null,
        custom_emoji_src: null,
      })
    }
  }

  // 2. Curated reactions
  for (const emoji of CURATED_REACTIONS) {
    add({
      reaction_key: `e:${emoji}`,
      canonical_key: canonicalReactionKey({emoji}),
      emoji,
      custom_emoji_id: null,
      custom_emoji_src: null,
    })
  }

  // 3. Verified channel custom emojis seen across loaded posts
  for (const [id, src] of Object.entries(channelCustomEmojis)) {
    if (!isValidCustomEmojiId(id)) continue
    add({
      reaction_key: `c:${id}`,
      canonical_key: canonicalReactionKey({custom_emoji_id: id}),
      emoji: null,
      custom_emoji_id: id,
      custom_emoji_src: src,
    })
  }

  // 4. Full Telegram standard channel reactions
  for (const emoji of TELEGRAM_CHANNEL_REACTIONS) {
    add({
      reaction_key: `e:${emoji}`,
      canonical_key: canonicalReactionKey({emoji}),
      emoji,
      custom_emoji_id: null,
      custom_emoji_src: null,
    })
  }

  return out
}
