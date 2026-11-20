import type {ComputedRef, InjectionKey, Ref} from 'vue'
import {inject} from 'vue'
import type {LifeApiClient} from './api'
import type {
  CommentDTO,
  StreamCommentDeletedEvent,
  StreamCommentReactionUpdatedEvent,
  UpdateProfilePayload,
  UserDTO,
} from './models'

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
  epochEmojiBase: ComputedRef<string | null>
  openAuthModal: () => void
  ensureAuthInfo: () => Promise<void>
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
