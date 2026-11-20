/**
 * SSR-safe URL resolution & validation helpers.
 */

const SSR_DUMMY_ORIGIN = 'http://tg-blog.invalid'
const UNSAFE_SCHEME_RE = /^(?:javascript|vbscript|data):/i

export function isSafeMediaUrl(url?: string | null): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('//')) return false
  if (UNSAFE_SCHEME_RE.test(trimmed)) return false
  if (trimmed.startsWith('/')) return true
  if (/^(?:https?|blob):/i.test(trimmed)) return true
  // Reject any other explicit unknown scheme (e.g. file:, ftp:, about:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return false
  return true
}

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
  const trimmed = url.trim()
  if (!trimmed) return ''
  // Reject unsafe schemes (javascript:, vbscript:, data:) and protocol-relative // URLs
  if (UNSAFE_SCHEME_RE.test(trimmed) || trimmed.startsWith('//')) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
    return trimmed
  }
  // Reject any other non-http(s) explicit scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return ''
  }
  try {
    // Handle root-relative bases identically on BOTH SSR and client so rendered URLs match during hydration
    if (base && base.startsWith('/') && !base.startsWith('//')) {
      const absBase = new URL(base, SSR_DUMMY_ORIGIN).href
      const resolved = new URL(trimmed, absBase)
      if (resolved.origin === SSR_DUMMY_ORIGIN) {
        return resolved.pathname + resolved.search + resolved.hash
      }
      return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.toString() : ''
    }
    if (base && /^https?:\/\//i.test(base)) {
      const resolved = new URL(trimmed, base)
      return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.toString() : ''
    }
    if (typeof document !== 'undefined' && document.location?.href) {
      const absBase = new URL(base || document.location.href, document.location.href).href
      const resolved = new URL(trimmed, absBase)
      return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.toString() : ''
    }
    const normalizedBase = base ? (base.startsWith('/') ? base : '/' + base) : '/'
    const absBase = new URL(normalizedBase, SSR_DUMMY_ORIGIN).href
    const resolved = new URL(trimmed, absBase)
    if (resolved.origin === SSR_DUMMY_ORIGIN) {
      return resolved.pathname + resolved.search + resolved.hash
    }
    return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.toString() : ''
  } catch {
    return ''
  }
}

/**
 * Resolve an asset URL returned by the Life API (e.g. `/api/life/media/...` or `/api/life/exports/emoji/...`)
 * without rewriting root-relative `/api/...` paths against `postsUrl` (which may live on a different origin/path).
 * Root-relative paths are only bound to `apiUrl`'s origin when `apiUrl` is an explicit `http(s)://` URL.
 */
export function resolveApiAssetUrl(
  raw?: string | null,
  apiUrl?: string | null,
  fallbackPostsUrl?: string | null
): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (!trimmed || !isSafeMediaUrl(trimmed)) return ''
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
    return trimmed
  }
  if (trimmed.startsWith('/')) {
    if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
      try {
        return new URL(trimmed, apiUrl).href
      } catch {
        return ''
      }
    }
    return trimmed
  }
  if (fallbackPostsUrl) {
    return resolveRelativeUrl(trimmed, fallbackPostsUrl)
  }
  if (apiUrl) {
    return resolveRelativeUrl(trimmed, apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`)
  }
  return trimmed
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
