import sanitizeHtml from 'sanitize-html'
import {parseMarkdownToHtml} from './markdown'
import type {
  AltchaChallenge,
  AuthMeResponse,
  CommentDTO,
  CommentMediaDTO,
  CommentReactionToggleResponse,
  CommentsResponse,
  CreateCommentPayload,
  CustomEmojisResponse,
  InteractionsResponse,
  MagicLinkRequestPayload,
  PollVoteResponse,
  Post,
  PostViewResponse,
  ReactionTogglePayload,
  ReactionToggleResponse,
  StickersResponse,
  StreamAllowedReactionsUpdatedEvent,
  StreamCommentDeletedEvent,
  StreamCommentReactionUpdatedEvent,
  StreamPollUpdatedEvent,
  StreamPostDeletedEvent,
  StreamPostViewsUpdatedEvent,
  StreamReactionUpdatedEvent,
  UpdateProfilePayload,
  UserDTO,
} from './models'

export class LifeApiError extends Error {
  status: number
  detail?: string
  body?: any

  constructor(status: number, message: string, detail?: string, body?: any) {
    super(message)
    this.name = 'LifeApiError'
    this.status = status
    this.detail = detail
    this.body = body
  }
}

function normalizeBaseUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, '')
}

/**
 * REST client for `/life` v2 interactive endpoints.
 * Always sends cookies (`credentials: 'include'`).
 */
export class LifeApiClient {
  readonly baseUrl: string

  constructor(apiUrl: string) {
    this.baseUrl = normalizeBaseUrl(apiUrl)
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
    if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    })

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

    if (!res.ok) {
      const detail = typeof data === 'object' && data !== null
        ? (data.detail || data.message || data.error)
        : (typeof data === 'string' ? data : undefined)
      throw new LifeApiError(
        res.status,
        typeof detail === 'string' && detail ? detail : `Request failed (${res.status})`,
        typeof detail === 'string' ? detail : undefined,
        data
      )
    }

    return data as T
  }

  getPosts(afterId?: number, limit?: number): Promise<{ posts: Post[] }> {
    const params = new URLSearchParams()
    if (afterId !== undefined) params.set('after_id', String(afterId))
    if (limit !== undefined) params.set('limit', String(limit))
    const qs = params.toString()
    return this.request<{ posts: Post[] }>(`/posts${qs ? `?${qs}` : ''}`)
  }

  getPost(postId: number): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`)
  }

  getInteractions(ids: number[]): Promise<InteractionsResponse> {
    const unique = Array.from(new Set(ids.filter(id => Number.isFinite(id))))
    const qs = unique.length ? `?ids=${unique.join(',')}` : ''
    return this.request<InteractionsResponse>(`/interactions${qs}`)
  }

  toggleReaction(postId: number, payload: ReactionTogglePayload): Promise<ReactionToggleResponse> {
    return this.request<ReactionToggleResponse>(`/posts/${postId}/reactions/toggle`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  votePoll(pollId: string, optionIndices: number[]): Promise<PollVoteResponse> {
    return this.request<PollVoteResponse>(`/polls/${encodeURIComponent(pollId)}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_indices: optionIndices }),
    })
  }

  getComments(postId: number): Promise<CommentsResponse> {
    return this.request<CommentsResponse>(`/posts/${postId}/comments`)
  }

  createComment(postId: number, payload: CreateCommentPayload): Promise<CommentDTO> {
    return this.request<CommentDTO>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        body: payload.body ?? '',
        media: payload.media ?? null,
        parent_id: payload.parent_id ?? null,
        as_anonymous: !!payload.as_anonymous,
        altcha_payload: payload.altcha_payload ?? null,
      }),
    })
  }

  async uploadCommentMedia(file: File): Promise<CommentMediaDTO> {
    const form = new FormData()
    form.append('file', file)
    const res = await this.request<CommentMediaDTO | { media: CommentMediaDTO }>('/comments/media', {
      method: 'POST',
      body: form,
    })
    if (typeof res === 'object' && res !== null && 'media' in res && res.media) {
      return res.media
    }
    return res as CommentMediaDTO
  }

  recordViews(postIds: number[]): Promise<PostViewResponse> {
    const unique = Array.from(new Set(postIds.filter(id => Number.isFinite(id))))
    if (!unique.length) {
      return Promise.resolve({ views: {} })
    }
    return this.request<PostViewResponse>('/posts/view', {
      method: 'POST',
      body: JSON.stringify({ post_ids: unique.slice(0, 50) }),
    })
  }

  getCustomEmojis(): Promise<CustomEmojisResponse> {
    return this.request<CustomEmojisResponse>('/emojis/custom')
  }

  getStickers(): Promise<StickersResponse> {
    return this.request<StickersResponse>('/stickers')
  }

  deleteComment(commentId: number): Promise<{ ok?: boolean }> {
    return this.request<{ ok?: boolean }>(`/comments/${commentId}`, {
      method: 'DELETE',
    })
  }

  toggleCommentReaction(commentId: number, payload: ReactionTogglePayload): Promise<CommentReactionToggleResponse> {
    return this.request<CommentReactionToggleResponse>(`/comments/${commentId}/reactions/toggle`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  getAuthMe(): Promise<AuthMeResponse> {
    return this.request<AuthMeResponse>('/auth/me')
  }

  logout(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
    })
  }

  async updateMe(payload: UpdateProfilePayload): Promise<UserDTO> {
    const res = await this.request<UserDTO | { user: UserDTO }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    if (typeof res === 'object' && res !== null && 'user' in res && res.user) {
      return res.user
    }
    return res as UserDTO
  }

  getOAuthLoginUrl(provider: 'github' | 'google' | 'oidc' | string, next?: string): string {
    const params = new URLSearchParams()
    if (next) params.set('next', next)
    const qs = params.toString()
    return `${this.baseUrl}/auth/oauth/${encodeURIComponent(provider)}/login${qs ? `?${qs}` : ''}`
  }

  async telegramCallback(data: Record<string, any>): Promise<UserDTO | null> {
    const res = await this.request<UserDTO | { user: UserDTO | null } | null>('/auth/telegram/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (typeof res === 'object' && res !== null && 'user' in res) {
      return res.user ?? null
    }
    return (res as UserDTO | null) ?? null
  }

  requestMagicLink(payload: MagicLinkRequestPayload): Promise<{ ok?: boolean; message?: string }> {
    return this.request<{ ok?: boolean; message?: string }>('/auth/magic-link/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  getCaptchaChallenge(signal?: AbortSignal): Promise<AltchaChallenge> {
    return this.request<AltchaChallenge>('/captcha/challenge', { signal })
  }
}

export interface LifeStreamHandlers {
  onPostCreated?: (post: Post) => void
  onPostUpdated?: (post: Post) => void
  onPostDeleted?: (event: StreamPostDeletedEvent) => void
  onPostViewsUpdated?: (event: StreamPostViewsUpdatedEvent) => void
  onReactionUpdated?: (event: StreamReactionUpdatedEvent) => void
  onPollUpdated?: (event: StreamPollUpdatedEvent) => void
  onCommentCreated?: (comment: CommentDTO) => void
  onCommentDeleted?: (event: StreamCommentDeletedEvent) => void
  onCommentReactionUpdated?: (event: StreamCommentReactionUpdatedEvent) => void
  onAllowedReactionsUpdated?: (event: StreamAllowedReactionsUpdatedEvent) => void
  onReconnect?: () => void
  onError?: (err: Event) => void
}

/**
 * Visibility-aware SSE client for `/life` v2 live updates.
 * Automatically pauses when the tab is hidden, resumes on visibility,
 * tracks `Last-Event-ID`, and cleans up completely on `close()`.
 */
export class LifeStreamClient {
  private readonly baseUrl: string
  private readonly handlers: LifeStreamHandlers
  private es: EventSource | null = null
  private postIds: number[] = []
  private lastEventId: string | null = null
  private closed = false
  private paused = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private updateTimer: ReturnType<typeof setTimeout> | null = null
  private hasConnectedOnce = false
  private suppressNextReconnectCallback = false
  private reconnectAttempt = 0

  constructor(apiUrl: string, handlers: LifeStreamHandlers = {}, initialPostIds: number[] = []) {
    this.baseUrl = normalizeBaseUrl(apiUrl)
    this.handlers = handlers
    this.postIds = Array.from(new Set(initialPostIds))

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange)
    }
  }

  private onVisibilityChange = () => {
    if (this.closed) return
    if (typeof document === 'undefined') return
    if (document.hidden) {
      this.paused = true
      this.disconnectSource()
    } else if (this.paused) {
      this.paused = false
      // Let es.onopen emit onReconnect once the new connection is actually open
      this.suppressNextReconnectCallback = false
      this.connect()
    }
  }

  private buildStreamUrl(): string {
    const params = new URLSearchParams()
    if (this.postIds.length > 0) {
      params.set('posts', this.postIds.join(','))
    }
    if (this.lastEventId) {
      params.set('last_event_id', this.lastEventId)
    }
    const qs = params.toString()
    return `${this.baseUrl}/stream${qs ? `?${qs}` : ''}`
  }

  connect(): void {
    if (this.closed) return
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return
    if (typeof document !== 'undefined' && document.hidden) {
      this.paused = true
      return
    }
    if (this.es) return

    const url = this.buildStreamUrl()
    const es = new EventSource(url, { withCredentials: true })
    this.es = es

    es.onopen = () => {
      this.reconnectAttempt = 0
      if (this.hasConnectedOnce) {
        if (this.suppressNextReconnectCallback) {
          this.suppressNextReconnectCallback = false
        } else {
          this.handlers.onReconnect?.()
        }
      }
      this.hasConnectedOnce = true
    }

    const bindJson = <T>(eventName: string, cb?: (data: T) => void) => {
      es.addEventListener(eventName, (ev: Event) => {
        const msg = ev as MessageEvent
        if (msg.lastEventId) {
          this.lastEventId = msg.lastEventId
        }
        if (!cb) return
        try {
          const parsed = JSON.parse(msg.data) as T
          cb(parsed)
        } catch (err) {
          console.warn(`[tg-blog] Failed to parse SSE event ${eventName}:`, err)
        }
      })
    }

    bindJson<Post>('post.created', this.handlers.onPostCreated)
    bindJson<Post>('post.updated', this.handlers.onPostUpdated)
    bindJson<StreamPostDeletedEvent>('post.deleted', this.handlers.onPostDeleted)
    bindJson<StreamPostViewsUpdatedEvent>('post.views.updated', this.handlers.onPostViewsUpdated)
    bindJson<StreamReactionUpdatedEvent>('reaction.updated', this.handlers.onReactionUpdated)
    bindJson<StreamPollUpdatedEvent>('poll.updated', this.handlers.onPollUpdated)
    bindJson<CommentDTO>('comment.created', this.handlers.onCommentCreated)
    bindJson<StreamCommentDeletedEvent>('comment.deleted', this.handlers.onCommentDeleted)
    bindJson<StreamCommentReactionUpdatedEvent>('comment.reaction.updated', this.handlers.onCommentReactionUpdated)
    bindJson<StreamAllowedReactionsUpdatedEvent>('reactions.allowed_updated', this.handlers.onAllowedReactionsUpdated)

    es.onerror = (err) => {
      this.handlers.onError?.(err)
      // Browser EventSource handles automatic reconnect when readyState === CONNECTING.
      // If CLOSED, schedule a capped exponential backoff reconnect (3s -> 6s -> 12s -> 24s -> 30s).
      if (es.readyState === EventSource.CLOSED && !this.closed && !this.paused) {
        this.disconnectSource()
        const delayMs = Math.min(3000 * Math.pow(2, this.reconnectAttempt), 30_000)
        this.reconnectAttempt = Math.min(this.reconnectAttempt + 1, 10)
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null
          this.connect()
        }, delayMs)
      }
    }
  }

  updatePostIds(ids: number[]): void {
    const next = Array.from(new Set(ids.filter(id => Number.isFinite(id)))).sort((a, b) => a - b)
    if (
      next.length === this.postIds.length &&
      next.every((v, i) => v === this.postIds[i])
    ) {
      return
    }
    this.postIds = next
    if (this.closed || this.paused) return

    if (this.updateTimer) clearTimeout(this.updateTimer)
    this.updateTimer = setTimeout(() => {
      this.updateTimer = null
      if (this.closed || this.paused) return
      if (this.es) {
        this.suppressNextReconnectCallback = true
        this.disconnectSource()
        this.connect()
      }
    }, 350)
  }

  private disconnectSource(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.es) {
      this.es.close()
      this.es = null
    }
  }

  close(): void {
    this.closed = true
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }
    this.disconnectSource()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange)
    }
  }
}

const CUSTOM_EMOJI_ID_RE = /^\d+$/
const PRE_LANGUAGE_RE = /^[A-Za-z0-9_+-]+$/

const commentSanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'a', 'b', 'strong', 'i', 'em', 'u', 's', 'del',
    'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'span',
  ],
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    code: ['class'],
    pre: ['class', 'language'],
    span: ['class'],
    i: ['class', 'data-custom-emoji-id'],
  },
  allowedClasses: {
    span: ['spoiler'],
    i: ['custom-emoji'],
    code: ['language-*'],
    pre: ['language-*'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      },
    }),
    i: (tagName, attribs) => {
      const nextAttribs: Record<string, string> = {}
      const rawId = attribs['data-custom-emoji-id']?.trim()
      if (rawId && CUSTOM_EMOJI_ID_RE.test(rawId)) {
        nextAttribs['data-custom-emoji-id'] = rawId
        if (attribs.class) {
          nextAttribs.class = attribs.class
        }
      }
      return {
        tagName,
        attribs: nextAttribs,
      }
    },
    pre: (tagName, attribs) => {
      const nextAttribs: Record<string, string> = {}
      if (attribs.class) {
        nextAttribs.class = attribs.class
      }
      const rawLang = attribs.language?.trim()
      if (rawLang && PRE_LANGUAGE_RE.test(rawLang)) {
        nextAttribs.language = rawLang
      }
      return {
        tagName,
        attribs: nextAttribs,
      }
    },
  },
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>')
}

/**
 * Strictly sanitize comment HTML (defense-in-depth on top of server sanitization).
 */
export function sanitizeCommentHtml(bodyHtml?: string | null, bodyText?: string | null): string {
  if (bodyHtml && bodyHtml.trim()) {
    return sanitizeHtml(bodyHtml, commentSanitizeOptions)
  }
  if (bodyText) {
    return escapeHtml(bodyText)
  }
  return ''
}

const commentSnippetSanitizeOptions: sanitizeHtml.IOptions = {
  ...commentSanitizeOptions,
  allowedTags: ['b', 'strong', 'i', 'em', 'u', 's', 'del', 'code', 'span'],
  allowedAttributes: {
    span: ['class'],
    i: ['class', 'data-custom-emoji-id'],
  },
}

/**
 * Render a single-line sanitized inline HTML snippet for comment reply banners & quote bars.
 */
export function sanitizeCommentSnippetHtml(
  bodyHtml?: string | null,
  bodyText?: string | null,
  mediaPrefix?: string | null
): string {
  let source = ''
  if (bodyHtml && bodyHtml.trim()) {
    source = bodyHtml
  } else if (bodyText && bodyText.trim()) {
    source = parseMarkdownToHtml(bodyText)
  }
  const singleLine = source
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:p|div|blockquote|pre|li|h[1-6])>/gi, ' ')
    .replace(/<(?:p|div|blockquote|pre|li|h[1-6])\b[^>]*>/gi, ' ')
  const cleanTextHtml = singleLine
    ? sanitizeHtml(singleLine, commentSnippetSanitizeOptions).replace(/\s{2,}/g, ' ').trim()
    : ''
  const prefix = (mediaPrefix ?? '').trim()
  if (prefix && cleanTextHtml) {
    return `${escapeHtml(prefix)} ${cleanTextHtml}`
  }
  if (prefix) {
    return escapeHtml(prefix)
  }
  return cleanTextHtml
}
