export interface Image {
  url: string
  width: number
  height: number
}

export interface File {
  url: string
  mime_type: string
  media_type?: string // If media_type is null, then it's not a media, just a regular file
  size: number // Bytes
  thumb?: string

  duration?: number
  width?: number
  height?: number
  sticker_emoji?: string
  title?: string
  performer?: string
}

export interface Post {
  id: number
  date: string

  text?: string
  forwarded_from?: string
  type?: string // If type doesn't exist, it's a regular message
  views?: string // Service messages have no view count
  reply?: {
    id: number
    text: string
    thumb?: string
  }
  images?: Image[]
  file?: File[]
}
// TODO: Other files types (i.e. pdf)
// TODO: Video
// TODO: Author
