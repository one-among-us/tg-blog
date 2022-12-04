export interface Image {
  url: string
  width: number
  height: number
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
  video?: {
    thumb: string
    duration: string
    src: string
  }
  images?: Image[]
}
// TODO: Other files types (i.e. pdf)
// TODO: Video
// TODO: Author
