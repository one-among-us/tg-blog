export type MediaType = "audio_file" | "animation" | "video_file" | "sticker" | "voice_message"
  | "contact" | "poll" | "location"


export interface Dimension {
  width: number
  height: number
}

export interface Image extends Dimension {
  url: string
}

export interface PollOption {
  text: string
  voter_count: number
  data: string
}

export interface TGFile {
  url: string
  mime_type: string
  media_type?: MediaType // If media_type is null, then it's not a media, just a regular file
  size: number // Bytes
  thumb?: string
  original_name?: string

  duration?: number
  width?: number
  height?: number
  sticker_emoji?: string
  title?: string
  performer?: string

  // For contact
  phone_number?: string
  first_name?: string
  last_name?: string
}

export interface TGPollFile {
  // For polls
  id?: string
  question?: string
  options?: PollOption[]
  total_voter_count?: number
  is_closed?: number
  is_anonymous?: number
  type?: "REGULAR" | "QUIZ"
  allow_multiple_answers?: boolean
}

export interface Location {
  longitude: number
  latitude: number
}

export interface TGLocationFile extends Location{
  title: string
  address: string
  foursquare_id: string
}

export interface ForwardFrom {
  name: string
  url?: string
}

export interface Post {
  id: number
  date: string

  text?: string
  forwarded_from?: string | ForwardFrom
  type?: 'service' // If type is not service, it's a regular message
  views?: string // Service messages have no view count
  author?: string
  reply?: {
    id: number
    text: string
    thumb?: string
  }
  images?: Image[]
  files?: TGFile[]
}
// TODO: Other files types (i.e. pdf)
// TODO: Video
// TODO: Author
