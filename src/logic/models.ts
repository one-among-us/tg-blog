export interface Image {
  href: string
  url: string
  width: number
  height: number
}

export interface Post {
  id: string
  date: string

  text?: string

  type?: string // If type doesn't exist, it's a regular message
  views?: string // Service messages have no view count
  reply?: {
    url: string
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
