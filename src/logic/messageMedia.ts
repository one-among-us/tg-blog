import type {CommentMediaDTO, Image, MediaType, TGFile} from '@/logic/models'
import {isSafeMediaUrl} from '@/logic/url'

export interface NormalizedMessageMedia {
  images: Image[]
  files: TGFile[]
  stickerSolo: boolean
}

export type MediaUrlTransformer = (raw?: string | null) => string

function resolveMediaUrl(raw?: string | null, transformUrl?: MediaUrlTransformer): string {
  if (!raw) return ''
  if (transformUrl) return transformUrl(raw)
  const trimmed = raw.trim()
  return isSafeMediaUrl(trimmed) ? trimmed : ''
}

function normalizeDim(val: unknown, fallback = 1000): number {
  return typeof val === 'number' && Number.isFinite(val) && val > 0 ? val : fallback
}

function toCommentImage(item: CommentMediaDTO, transformUrl?: MediaUrlTransformer): Image | null {
  const safeUrl = resolveMediaUrl(item.url, transformUrl)
  const safeThumb = resolveMediaUrl(item.thumb, transformUrl)
  const url = safeUrl || safeThumb
  if (!url) return null
  return {
    url,
    thumb: safeThumb || undefined,
    width: normalizeDim(item.width, 1000),
    height: normalizeDim(item.height, 1000),
    spoiler: !!item.spoiler,
    size: item.size ?? undefined,
    original_name: item.file_name ?? undefined,
  }
}

export interface ExtendedTGFile extends TGFile {
  is_animated?: boolean
  is_video?: boolean
  latitude?: number
  longitude?: number
  address?: string
  id?: string
  question?: string
  options?: {text: string; voter_count: number; data: string}[]
  total_voter_count?: number
  is_closed?: number
  is_anonymous?: number
  type?: 'REGULAR' | 'QUIZ'
  allow_multiple_answers?: boolean
}

function toCommentFile(item: CommentMediaDTO, transformUrl?: MediaUrlTransformer): ExtendedTGFile | null {
  const mt = (item.media_type || '').trim()
  const safeUrl = resolveMediaUrl(item.url, transformUrl)
  const safeThumb = resolveMediaUrl(item.thumb, transformUrl)

  if (mt === 'location' || mt === 'venue') {
    if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return null
    return {
      url: safeUrl,
      mime_type: item.mime_type || '',
      media_type: 'location' as MediaType,
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.title ?? (mt === 'venue' ? 'Venue' : undefined),
      address: item.address ?? undefined,
    }
  }

  if (mt === 'contact') {
    if (!item.phone_number && !item.first_name && !item.last_name) return null
    return {
      url: safeUrl,
      mime_type: item.mime_type || '',
      media_type: 'contact' as MediaType,
      phone_number: item.phone_number ?? undefined,
      first_name: item.first_name ?? undefined,
      last_name: item.last_name ?? undefined,
    }
  }

  if (mt === 'poll') {
    if (!item.question) return null
    return {
      url: safeUrl,
      mime_type: item.mime_type || '',
      media_type: 'poll' as MediaType,
      id: item.id ?? undefined,
      question: item.question,
      options: (item.options ?? []).map((opt, idx) => ({
        text: opt.text,
        voter_count: opt.voter_count ?? 0,
        data: String(idx),
      })),
      total_voter_count: item.total_voter_count ?? 0,
      is_closed: item.is_closed ? 1 : 0,
      is_anonymous: item.is_anonymous ? 1 : 0,
      type: item.type === 'QUIZ' ? 'QUIZ' : 'REGULAR',
      allow_multiple_answers: !!item.allow_multiple_answers,
    }
  }

  if (mt === 'dice') {
    if (!safeUrl && !item.emoji) return null
    return {
      url: safeUrl,
      mime_type: item.mime_type || '',
      media_type: 'dice' as MediaType,
      emoji: item.emoji ?? '🎲',
      value: item.value ?? undefined,
    }
  }

  if (mt === 'sticker') {
    const url = safeUrl || safeThumb
    if (!url) return null
    const mime =
      item.mime_type ||
      (item.is_animated ? 'application/x-tgsticker' : item.is_video ? 'video/webm' : 'image/webp')
    return {
      url,
      thumb: safeThumb || undefined,
      mime_type: mime,
      media_type: 'sticker',
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      size: item.size ?? undefined,
      original_name: item.file_name ?? undefined,
      sticker_emoji: item.emoji ?? undefined,
      is_animated: !!item.is_animated,
      is_video: !!item.is_video,
    }
  }

  if (!safeUrl) return null

  let mappedType: MediaType | undefined
  if (mt === 'animation') mappedType = 'animation'
  else if (mt === 'video' || mt === 'video_file') mappedType = 'video_file'
  else if (mt === 'audio' || mt === 'audio_file') mappedType = 'audio_file'
  else if (mt === 'voice' || mt === 'voice_message') mappedType = 'voice_message'
  else if (mt === 'giveaway' || mt === 'giveaway_winners' || mt === 'story') mappedType = mt as MediaType
  else mappedType = undefined

  return {
    url: safeUrl,
    thumb: safeThumb || undefined,
    mime_type: item.mime_type || '',
    media_type: mappedType,
    width: item.width ?? undefined,
    height: item.height ?? undefined,
    size: item.size ?? undefined,
    duration: item.duration ?? undefined,
    title: item.title ?? undefined,
    performer: item.performer ?? undefined,
    original_name: item.file_name ?? undefined,
    spoiler: !!item.spoiler,
  }
}

export function normalizeCommentMedia(
  media?: CommentMediaDTO | null,
  transformUrl?: MediaUrlTransformer
): NormalizedMessageMedia {
  if (!media) {
    return {images: [], files: [], stickerSolo: false}
  }

  if (media.media_type === 'album') {
    const images: Image[] = []
    for (const item of media.images ?? []) {
      const img = toCommentImage(item, transformUrl)
      if (img) images.push(img)
    }
    const files: TGFile[] = []
    for (const item of media.files ?? []) {
      const f = toCommentFile(item, transformUrl)
      if (f) files.push(f)
    }
    const stickerSolo = images.length === 0 && files.length === 1 && files[0].media_type === 'sticker'
    return {images, files, stickerSolo}
  }

  if (media.media_type === 'photo') {
    const img = toCommentImage(media, transformUrl)
    return {images: img ? [img] : [], files: [], stickerSolo: false}
  }

  const f = toCommentFile(media, transformUrl)
  return {
    images: [],
    files: f ? [f] : [],
    stickerSolo: f?.media_type === 'sticker',
  }
}

export function commentMediaLabel(media?: CommentMediaDTO | null): string {
  if (!media) return ''
  if (media.media_type === 'album') {
    const imgCount = media.images?.length ?? 0
    const fileCount = media.files?.length ?? 0
    if (imgCount > 0 && fileCount === 0) return imgCount > 1 ? `[${imgCount} Photos]` : '[Photo]'
    if (fileCount === 1 && imgCount === 0 && media.files?.[0]) {
      return commentMediaLabel(media.files[0])
    }
    const total = imgCount + fileCount
    return total > 1 ? `[Album · ${total}]` : '[Media]'
  }
  switch (media.media_type) {
    case 'photo':
      return '[Photo]'
    case 'sticker':
      return media.emoji ? `${media.emoji} Sticker` : '[Sticker]'
    case 'animation':
      return '[GIF]'
    case 'video':
    case 'video_file':
      return '[Video]'
    case 'audio':
    case 'audio_file':
      return media.title ? `[Audio: ${media.title}]` : '[Audio]'
    case 'voice':
    case 'voice_message':
      return '[Voice message]'
    case 'location':
    case 'venue':
      return media.title ? `[Location: ${media.title}]` : '[Location]'
    case 'contact': {
      const name = [media.first_name, media.last_name].filter(Boolean).join(' ')
      return name ? `[Contact: ${name}]` : '[Contact]'
    }
    case 'poll':
      return media.question ? `[Poll: ${media.question}]` : '[Poll]'
    case 'dice':
      return media.emoji ? `[${media.emoji}${media.value != null ? ` ${media.value}` : ''}]` : '[Dice]'
    case 'document':
    case 'file':
      return media.file_name ? `[File: ${media.file_name}]` : '[File]'
    default:
      return media.file_name ? `[${media.file_name}]` : '[Media]'
  }
}

export function commentMediaThumbUrl(
  media?: CommentMediaDTO | null,
  transformUrl?: MediaUrlTransformer
): string | null {
  if (!media) return null
  if (media.media_type === 'album') {
    const firstImg = media.images?.[0]
    if (firstImg) return commentMediaThumbUrl(firstImg, transformUrl)
    const firstFile = media.files?.[0]
    if (firstFile) return commentMediaThumbUrl(firstFile, transformUrl)
    return null
  }
  const cleanUrl = media.url?.toLowerCase().split('?')[0].split('#')[0] ?? ''
  const candidate =
    media.thumb ||
    (media.media_type === 'photo' ? media.url : null) ||
    (media.media_type === 'sticker' &&
    !media.is_animated &&
    !media.is_video &&
    !cleanUrl.endsWith('.tgs') &&
    !cleanUrl.endsWith('.webm')
      ? media.url
      : null)
  const resolved = resolveMediaUrl(candidate, transformUrl)
  return resolved || null
}

export function commentMediaThumbBadge(media?: CommentMediaDTO | null): string {
  if (!media) return ''
  if (media.media_type === 'album') {
    if ((media.images?.length ?? 0) > 0) return '🖼️'
    if (media.files?.[0]) return commentMediaThumbBadge(media.files[0])
    return '📎'
  }
  switch (media.media_type) {
    case 'sticker':
      return media.emoji || '🎭'
    case 'animation':
      return '🎞️'
    case 'video':
    case 'video_file':
      return '🎬'
    case 'photo':
      return '🖼️'
    case 'audio':
    case 'audio_file':
      return '🎵'
    case 'voice':
    case 'voice_message':
      return '🎤'
    case 'location':
    case 'venue':
      return '📍'
    case 'contact':
      return '👤'
    case 'poll':
      return '📊'
    case 'dice':
      return media.emoji || '🎲'
    default:
      return '📎'
  }
}
