/**
 * SSR-safe URL resolution & validation helpers.
 */

const SSR_DUMMY_ORIGIN = 'http://tg-blog.invalid'

export function resolvePostsUrl(postsUrl: string): string {
  if (!postsUrl) return ''
  try {
    // Keep root-relative URLs identical across SSR and client to prevent hydration mismatches
    if (postsUrl.startsWith('/') && !postsUrl.startsWith('//')) {
      const normalized = new URL(postsUrl, SSR_DUMMY_ORIGIN)
      return normalized.pathname + normalized.search + normalized.hash
    }
    if (/^https?:\/\//i.test(postsUrl)) {
      return new URL(postsUrl).href
    }
    if (typeof document !== 'undefined' && document.location?.href) {
      return new URL(postsUrl, document.location.href).href
    }
    return postsUrl
  } catch {
    return postsUrl
  }
}

export function resolveRelativeUrl(url: string, base: string): string {
  if (!url) return url
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  try {
    // Handle root-relative bases identically on BOTH SSR and client so rendered URLs match during hydration
    if (base && base.startsWith('/') && !base.startsWith('//')) {
      const absBase = new URL(base, SSR_DUMMY_ORIGIN).href
      const resolved = new URL(url, absBase)
      if (resolved.origin === SSR_DUMMY_ORIGIN) {
        return resolved.pathname + resolved.search + resolved.hash
      }
      return resolved.toString()
    }
    if (base && /^https?:\/\//i.test(base)) {
      return new URL(url, base).toString()
    }
    if (typeof document !== 'undefined' && document.location?.href) {
      const absBase = new URL(base || document.location.href, document.location.href).href
      return new URL(url, absBase).toString()
    }
    const normalizedBase = base ? (base.startsWith('/') ? base : '/' + base) : '/'
    const absBase = new URL(normalizedBase, SSR_DUMMY_ORIGIN).href
    const resolved = new URL(url, absBase)
    if (resolved.origin === SSR_DUMMY_ORIGIN) {
      return resolved.pathname + resolved.search + resolved.hash
    }
    return resolved.toString()
  } catch {
    return url
  }
}

/**
 * Validate an avatar URL so only safe schemes (`https://`, `http://`, or single-slash root-relative `/...`) are rendered.
 * Rejects protocol-relative (`//...`), `javascript:`, `data:`, etc.
 */
export function sanitizeAvatarUrl(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.href
      }
    } catch {
      return null
    }
  }
  return null
}

/**
 * Normalize and validate a Telegram bot username (alphanumeric + underscore, optional leading `@`).
 */
export function normalizeTelegramBotUsername(raw?: string | null): string | null {
  if (!raw) return null
  const stripped = raw.trim().replace(/^@+/, '')
  if (!stripped || !/^[a-zA-Z0-9_]+$/.test(stripped)) {
    return null
  }
  return stripped
}
