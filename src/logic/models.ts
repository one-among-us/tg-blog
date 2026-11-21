export type MediaType = "audio_file" | "animation" | "video_file" | "sticker" | "voice_message"
  | "contact" | "poll" | "location" | "web_page"
  | "live_photo" | "dice" | "game" | "story" | "giveaway" | "giveaway_winners"
  | "invoice" | "paid_media" | "checklist"


export interface Dimension {
  width: number
  height: number
}

export interface _Media {
  spoiler?: boolean
  size?: number // Bytes
  thumb?: string
}

export interface Image extends Dimension, _Media {
  url: string
  original_url?: string
  original_size?: number
  original_name?: string
}

export interface PollOption {
  text: string
  voter_count: number
  data: string
}

export interface TGFile extends _Media {
  url: string
  mime_type: string
  media_type?: MediaType // If media_type is null, then it's not a media, just a regular file
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

  // For dice
  emoji?: string
  value?: number

  // For giveaway
  quantity?: number
  winner_count?: number
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

export interface TGLocation
{
  longitude: number
  latitude: number
}

export interface TGLocationFile extends TGLocation{
  title: string
  address: string
  foursquare_id: string
}

export interface ForwardFrom {
  name: string
  url?: string
}

export interface PostQuote {
  text: string
  position?: number
}

export interface PostReaction {
  emoji?: string
  custom_emoji_id?: string
  count: number
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
    text?: string
    thumb?: string
  }
  images?: Image[]
  files?: TGFile[]
  quote?: PostQuote
  reactions?: PostReaction[]
  show_caption_above_media?: boolean
  has_media_spoiler?: boolean
}
// TODO: Other files types (i.e. pdf)
// TODO: Video
// TODO: Author

// --- Interactive Mode (/life v2 API Contract) ---

export type AuthProvider = 'github' | 'google' | 'telegram' | 'oidc' | 'email' | 'anonymous' | string

export interface UserDTO {
  id: number
  display_name: string
  role: 'owner' | 'user' | string
  avatar_url?: string | null
  provider?: AuthProvider | null
  email_verified?: boolean
  notify_replies?: boolean
}

export interface MergedReactionPublic {
  reaction_key: string
  emoji?: string | null
  custom_emoji_id?: string | null
  tg_count: number
  web_count: number
  count: number
}

export interface MergedReaction extends MergedReactionPublic {
  reacted: boolean
}

export interface MergedPollOption {
  idx: number
  text: string
  tg_voter_count: number
  web_voter_count: number
  voter_count: number
}

export interface MergedPollPublic {
  id: string
  question: string
  is_closed: boolean
  is_anonymous: boolean
  type: 'REGULAR' | 'QUIZ'
  allow_multiple_answers: boolean
  total_voter_count: number
  correct_option_idx?: number | null
  explanation?: string | null
  options: MergedPollOption[]
}

export interface MergedPoll extends MergedPollPublic {
  my_votes: number[]
}

export interface PostInteractionState {
  reactions: MergedReaction[]
  poll?: MergedPoll | null
  comment_count: number
  views?: string | null
}

export interface AllowedReactionItem {
  reaction_key: string
  emoji?: string | null
  custom_emoji_id?: string | null
}

export interface InteractionsResponse {
  allow_anon_comments: boolean
  captcha_provider?: string | null
  me: UserDTO | null
  allowed_reactions?: AllowedReactionItem[]
  posts: Record<string, PostInteractionState>
}

export interface CommentAuthorDTO {
  display_name: string
  avatar_url?: string | null
  role: 'owner' | 'user' | 'telegram' | 'anonymous' | string
  provider?: AuthProvider | null
  username?: string | null
  verified: boolean
}

export interface CommentMediaDTO {
  media_type: 'photo' | 'sticker' | 'animation' | 'video' | 'document' | string
  url: string
  thumb?: string | null
  width?: number | null
  height?: number | null
  size?: number | null
  file_name?: string | null
  mime_type?: string | null
  emoji?: string | null
  is_animated?: boolean | null
  is_video?: boolean | null
  sticker_id?: string | null
}

export interface CustomEmojiAsset {
  id: string
  url: string
  format?: string | null
  alt?: string | null
}

export interface StickerItem {
  id: string
  url: string
  file?: string | null
  thumb?: string | null
  emoji?: string | null
  width?: number | null
  height?: number | null
  format?: 'webp' | 'tgs' | 'webm' | string | null
  is_animated?: boolean
  is_video?: boolean
}

export interface StickerPack {
  id: string
  name?: string
  title: string
  stickers: StickerItem[]
}

export interface CustomEmojisResponse {
  emojis: CustomEmojiAsset[]
}

export interface StickersResponse {
  packs: StickerPack[]
}

export interface PostViewResponse {
  views: Record<string, string>
}

export interface CommentDTO {
  id: number
  post_id: number
  parent_id: number | null
  source: 'web' | 'telegram' | string
  author: CommentAuthorDTO
  body_text: string
  body_html: string
  media?: CommentMediaDTO | null
  created_at: string
  edited_at?: string | null
  deleted: boolean
  is_mine: boolean
  can_delete: boolean
  moderation_status?: 'approved' | 'pending' | 'rejected' | string
  reactions?: MergedReaction[]
}

export interface ModerationWhitelistEntryDTO {
  id: number
  kind: string
  key: string
  label?: string | null
  created_at: string
}

export interface ModerationCommentDTO {
  id: number
  post_id: number
  parent_id: number | null
  source: string
  author: CommentAuthorDTO
  body_text: string
  body_html: string
  media?: CommentMediaDTO | null
  created_at: string
  moderation_status: string
  moderation_meta?: Record<string, any> | null
  sender_whitelisted: boolean
  can_whitelist: boolean
  whitelist_kind?: string | null
  whitelist_label?: string | null
}

export interface ModerationQueueResponse {
  pending_count: number
  comments: ModerationCommentDTO[]
  whitelist: ModerationWhitelistEntryDTO[]
}

export interface ModerationDecisionPayload {
  action: 'approve' | 'reject'
  whitelist_sender?: boolean
}

export interface ModerationDecisionResponse {
  ok: boolean
  comment_id: number
  post_id: number
  moderation_status: string
  whitelisted: boolean
}

export interface CommentsResponse {
  post_id: number
  comments: CommentDTO[]
  viewer_anon_tag?: string | null
}

export interface ReactionTogglePayload {
  emoji?: string
  custom_emoji_id?: string
}

export interface ReactionToggleResponse {
  post_id: number
  reactions: MergedReaction[]
}

export interface CommentReactionToggleResponse {
  post_id: number
  comment_id: number
  reactions: MergedReaction[]
}

export interface PollVoteResponse {
  post_id: number
  poll: MergedPoll
}

export interface CreateCommentPayload {
  body?: string
  media?: CommentMediaDTO | null
  parent_id?: number | null
  as_anonymous?: boolean
  altcha_payload?: string | null
}

export interface AuthMeResponse {
  user: UserDTO | null
  providers: string[]
  allow_anon_comments: boolean
  telegram_bot_username?: string | null
  telegram_client_id?: string | null
  oidc_provider_name?: string | null
}

export interface UpdateProfilePayload {
  display_name?: string
  notify_replies?: boolean
}

export interface MagicLinkRequestPayload {
  email: string
  display_name?: string
  altcha_payload: string
}

export interface AltchaChallenge {
  algorithm: string
  challenge: string
  maxnumber?: number
  salt: string
  signature: string
}

export interface AltchaSolution {
  algorithm: string
  challenge: string
  number: number
  salt: string
  signature: string
  took: number
}

export interface StreamReactionUpdatedEvent {
  post_id: number
  reactions: MergedReactionPublic[]
}

export interface StreamPollUpdatedEvent {
  post_id: number
  poll: MergedPollPublic
}

export interface StreamCommentDeletedEvent {
  post_id: number
  comment_id: number
}

export interface StreamCommentReactionUpdatedEvent {
  post_id: number
  comment_id: number
  reactions: MergedReactionPublic[]
}

export interface StreamPostDeletedEvent {
  post_id: number
}

export interface StreamAllowedReactionsUpdatedEvent {
  allowed_reactions: AllowedReactionItem[]
}

export interface StreamPostViewsUpdatedEvent {
  views: Record<string, string>
}

export type PostDeletedEvent = StreamPostDeletedEvent
