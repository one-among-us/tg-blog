import type {ComputedRef, InjectionKey, Ref} from 'vue'
import {inject} from 'vue'
import type {LifeApiClient} from './api'
import type {
  AllowedReactionItem,
  CommentDTO,
  CustomEmojiAsset,
  StickerPack,
  StreamCommentDeletedEvent,
  StreamCommentReactionUpdatedEvent,
  UpdateProfilePayload,
  UserDTO,
} from './models'
import type {ViewedImage} from '@/views/ImageViewer.vue'

export interface CommentStreamListener {
  onCreated: (comment: CommentDTO) => void
  onDeleted: (event: StreamCommentDeletedEvent) => void
  onReactionUpdated?: (event: StreamCommentReactionUpdatedEvent) => void
  onAuthChanged: () => void
}

export interface TgBlogInteractiveContext {
  api: ComputedRef<LifeApiClient | null>
  me: Ref<UserDTO | null>
  providers: Ref<string[]>
  telegramBotUsername: Ref<string | null>
  allowAnonComments: Ref<boolean>
  authLoaded: Ref<boolean>
  channelCustomEmojis: ComputedRef<Record<string, string>>
  customEmojiCatalog: Ref<CustomEmojiAsset[]>
  customEmojiCatalogLoading: Ref<boolean>
  customEmojiCatalogReady: Ref<boolean>
  allCustomEmojis: ComputedRef<Record<string, string>>
  stickerPacks: Ref<StickerPack[]>
  stickersLoading: Ref<boolean>
  epochEmojiBase: ComputedRef<string | null>
  allowedReactions: Ref<AllowedReactionItem[] | null>
  anonAvatars?: ComputedRef<string[]>
  openAuthModal: () => void
  ensureAuthInfo: () => Promise<void>
  ensureCustomEmojis: (force?: boolean) => Promise<CustomEmojiAsset[]>
  ensureStickers: (force?: boolean) => Promise<StickerPack[]>
  openMediaViewer?: (imgs: ViewedImage[], index?: number) => void
  refreshAuthAndInteractions: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>
  subscribeComments: (postId: number, listener: CommentStreamListener) => () => void
  markCommentsSeen: (postId: number, commentIds: number[]) => void
  notifyLocalCommentCreated: (comment: CommentDTO) => void
  notifyLocalCommentDeleted: (postId: number, commentId: number) => void
}

export const tgbInteractiveKey: InjectionKey<TgBlogInteractiveContext | null> = Symbol('tgb-interactive')

export function useTgbInteractive(): TgBlogInteractiveContext | null {
  return inject(tgbInteractiveKey, null)
}
