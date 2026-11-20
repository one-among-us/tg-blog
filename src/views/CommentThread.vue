<template>
    <div v-if="ctx && activeApi" class="chat-zone" @click.stop>
        <!-- Loading / Error / Empty states -->
        <div v-if="loading" class="thread-status">{{ msg.loadingComments }}</div>
        <div v-else-if="loadError" class="thread-status error">
            <span>{{ msg.commentsLoadFailed }}</span>
            <button type="button" class="link-btn" @click="fetchComments">{{ msg.retry }}</button>
        </div>

        <!-- Flat chronological Telegram Web A chat bubbles -->
        <div v-else-if="chatMessages.length > 0" ref="chatListEl" class="chat-list">
            <div v-for="item in chatMessages"
                 :key="item.comment.id"
                 :id="`comment-${item.comment.id}`"
                 class="Message"
                 :class="{
                     own: item.isOwn,
                     'first-in-group': item.firstInGroup,
                     'last-in-group': item.lastInGroup,
                     'is-deleted': item.comment.deleted,
                     'is-highlighted': highlightedId === item.comment.id,
                     'selector-open': reactionTarget?.id === item.comment.id
                 }">
                <!-- Tombstone for soft-deleted comment with live replies -->
                <template v-if="item.comment.deleted">
                    <div class="tombstone-bubble">{{ msg.commentDeleted }}</div>
                </template>

                <template v-else>
                    <!-- Incoming 32px circular avatar pinned bottom-left on lastInGroup -->
                    <div v-if="!item.isOwn" class="avatar-slot">
                        <template v-if="item.lastInGroup">
                            <img v-if="safeAvatar(item.comment.author.avatar_url)"
                                 :src="safeAvatar(item.comment.author.avatar_url)!"
                                 referrerpolicy="no-referrer"
                                 class="bubble-avatar" alt="" loading="lazy" />
                            <span v-else class="bubble-avatar avatar-fallback"
                                  :class="avatarClass(item.comment)"
                                  :style="avatarFallbackStyle(item.comment)">
                                {{ avatarInitial(item.comment.author.display_name) }}
                            </span>
                        </template>
                    </div>

                    <!-- Bubble content + exact Telegram Web A SVG appendix -->
                    <div class="message-content-wrapper"
                         :class="{ 'is-swiping': swipeState?.id === item.comment.id && swipeState.locked === 'h' }"
                         :style="swipeWrapperStyle(item.comment.id)">
                        <div class="message-content has-solid-background"
                             :class="{ 'has-appendix': item.lastInGroup }"
                             @dblclick="canCompose && startReply(item.comment)"
                             @click.capture="onBubbleClickCapture"
                             @contextmenu="onBubbleContextMenu(item.comment, $event)"
                             @pointerdown="onBubblePointerDown(item.comment, $event)">
                            <!-- Header row on incoming firstInGroup: sender + badge -->
                            <div v-if="item.firstInGroup && !item.isOwn" class="message-title">
                                <span class="sender-title" :style="{ color: senderColor(item.comment) }">
                                    {{ item.comment.author.display_name }}
                                </span>
                                <span v-if="item.comment.author.role === 'owner'" class="badge badge-owner">
                                    {{ msg.badgeOwner }}
                                </span>
                                <span v-if="isTelegramSynced(item.comment)" class="badge badge-telegram"
                                      :title="msg.badgeTelegram">
                                    <svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                    </svg>
                                </span>
                                <span v-else-if="item.comment.author.verified" class="badge badge-verified"
                                      :title="providerLabel(item.comment.author.provider)">
                                    <svg v-if="item.comment.author.provider === 'github'" class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.05a9.38 9.38 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/>
                                    </svg>
                                    <svg v-else-if="item.comment.author.provider === 'google'" class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.7-5.4 3.7-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"/>
                                    </svg>
                                    <svg v-else-if="item.comment.author.provider === 'telegram'" class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                    </svg>
                                    <svg v-else class="badge-svg" viewBox="0 0 16 16" aria-hidden="true">
                                        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 8.5l3.2 3.2L13 4.8"/>
                                    </svg>
                                </span>
                                <span v-else class="badge badge-anon">
                                    {{ msg.badgeAnonymous }}
                                </span>
                            </div>

                            <!-- Inline Telegram Web A reply quote bar -->
                            <button v-if="item.parentComment"
                                    type="button"
                                    class="inline-reply-quote clickable"
                                    @click="jumpToComment(item.parentComment.id)">
                                <div class="quote-author">
                                    {{ item.parentComment.deleted ? msg.commentDeleted : item.parentComment.author.display_name }}
                                </div>
                                <div class="quote-snippet" v-if="!item.parentComment.deleted">
                                    {{ quoteSnippet(item.parentComment) }}
                                </div>
                            </button>

                            <!-- Message text (+ inline bottom-right timestamp when there are no reactions) -->
                            <div class="text-content">
                                <span class="comment-body" v-html="renderBody(item.comment)"></span>
                                <span v-if="(item.comment.reactions?.length ?? 0) === 0"
                                      class="message-timestamp in-text"
                                      :title="formatFullDate(item.comment.created_at)">
                                    <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                    <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                </span>
                            </div>

                            <!-- Comment reaction pills (+ bottom-right timestamp when reactions exist) -->
                            <div v-if="(item.comment.reactions?.length ?? 0) > 0"
                                 class="comment-reactions"
                                 @dblclick.stop>
                                <button v-for="r in item.comment.reactions"
                                        :key="r.reaction_key"
                                        type="button"
                                        class="comment-reaction-btn"
                                        :class="{ chosen: r.reacted }"
                                        @click.stop="onToggleCommentReaction(item.comment, r)">
                                    <CustomEmoji v-if="r.custom_emoji_id"
                                                 :id="r.custom_emoji_id"
                                                 :src="customEmojiSrc(r.custom_emoji_id)"
                                                 :posts-url="resolvedPostsUrl" />
                                    <AppleEmoji v-else-if="r.emoji" :emoji="r.emoji" class="reaction-emoji" />
                                    <span class="reaction-count" v-if="r.count">{{ r.count }}</span>
                                </button>
                                <span class="message-timestamp in-reactions"
                                      :title="formatFullDate(item.comment.created_at)">
                                    <span class="ts-date">{{ formatShortDate(item.comment.created_at) }}</span>
                                    <span class="ts-time">{{ formatShortTime(item.comment.created_at) }}</span>
                                </span>
                            </div>

                            <!-- Exact Telegram Web A MessageAppendix SVG tail -->
                            <svg v-if="item.lastInGroup" width="9" height="20" viewBox="0 0 9 20" class="svg-appendix" aria-hidden="true">
                                <path v-if="item.isOwn"
                                      d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 016 17z"
                                      class="corner" />
                                <path v-else
                                      d="M3 17h6V0c-.193 2.84-.876 5.767-2.05 8.782-.904 2.325-2.446 4.485-4.625 6.48A1 1 0 003 17z"
                                      class="corner" />
                            </svg>
                        </div>

                        <!-- Desktop hover quick actions beside the bubble (react removed: desktop uses right-click, mobile uses long-press) -->
                        <div class="bubble-actions" @dblclick.stop>
                            <button v-if="canCompose" type="button" class="bubble-act-btn reply-btn"
                                    :title="msg.reply" :aria-label="msg.reply"
                                    @click="startReply(item.comment)">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                                </svg>
                            </button>
                            <button v-if="item.comment.can_delete || me?.role === 'owner'" type="button"
                                    class="bubble-act-btn danger"
                                    :class="{ confirming: confirmDeleteId === item.comment.id }"
                                    :disabled="deletingId === item.comment.id"
                                    :title="confirmDeleteId === item.comment.id ? msg.confirmDelete : msg.deleteComment"
                                    @click="handleDeleteClick(item.comment)">
                                <span v-if="confirmDeleteId === item.comment.id" class="confirm-text">{{ msg.confirmDelete }}</span>
                                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Touch slide-to-reply indicator pinned along the right margin -->
                    <div v-if="canCompose"
                         class="swipe-reply-hint"
                         :class="{
                             visible: swipeState?.id === item.comment.id && swipeState.locked === 'h' && swipeState.offset < -6,
                             ready: swipeState?.id === item.comment.id && swipeState.locked === 'h' && -swipeState.offset >= SWIPE_REPLY_THRESHOLD
                         }"
                         :style="swipeHintStyle(item.comment.id)"
                         aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                        </svg>
                    </div>
                </template>
            </div>
        </div>
        <div v-else class="thread-status empty">{{ msg.noComments }}</div>

        <!-- Composer (one-among-us/web embedded send button + compact auth strip) -->
        <div class="composer">
            <div v-if="me" class="user-bar">
                <div class="user-pill">
                    <img v-if="safeAvatar(me.avatar_url)" :src="safeAvatar(me.avatar_url)!"
                         referrerpolicy="no-referrer" class="avatar sm" alt="" />
                    <span v-else class="avatar sm avatar-fallback">{{ avatarInitial(me.display_name) }}</span>
                    <span class="user-name">{{ me.display_name }}</span>
                </div>
                <div class="user-controls">
                    <button v-if="me.email_verified" type="button" class="chip-btn"
                            :class="{ active: me.notify_replies }"
                            :disabled="togglingNotify"
                            @click="toggleNotify"
                            :title="me.notify_replies ? msg.notifyRepliesOn : msg.notifyRepliesOff">
                        {{ me.notify_replies ? msg.notifyRepliesOn : msg.notifyRepliesOff }}
                    </button>
                    <label v-if="allowAnon" class="anon-toggle">
                        <input type="checkbox" v-model="asAnonymous" />
                        <span>{{ msg.commentAsAnonymous }}</span>
                    </label>
                    <button type="button" class="chip-btn subtle" @click="handleLogout">
                        {{ msg.signOut }}
                    </button>
                </div>
            </div>

            <div v-else class="guest-bar" :class="{ 'has-composer': canCompose }">
                <div class="guest-auth-row">
                    <span class="guest-avatar" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </span>
                    <button type="button" class="signin-btn" @click="ctx.openAuthModal()">
                        {{ msg.signIn }}
                    </button>
                </div>
                <span v-if="allowAnon" class="guest-hint">{{ msg.commentingAnonymously }}</span>
                <span v-else class="guest-hint">{{ msg.signInToComment }}</span>
            </div>

            <div v-if="canCompose" class="composer-box">
                <div v-if="replyTarget" class="reply-banner">
                    <div class="reply-banner-content">
                        <span class="reply-banner-title">{{ msg.replyingTo(replyTarget.author.display_name) }}</span>
                        <span class="reply-banner-snippet">{{ quoteSnippet(replyTarget) }}</span>
                    </div>
                    <button type="button" class="cancel-reply-btn" @click="replyTarget = null" :aria-label="msg.cancelReply">
                        ✕
                    </button>
                </div>

                <!-- Ported directly from one-among-us/web ProfileComments.vue -->
                <div id="add-comment" class="add-comment">
                    <textarea ref="textareaEl"
                              v-model="draft"
                              rows="1"
                              maxlength="4000"
                              :placeholder="msg.writeCommentPlaceholder"
                              :aria-label="msg.writeCommentPlaceholder"
                              :readonly="submitting"
                              @input="resizeInput"
                              @keydown="onComposerKeydown" />
                    <div id="send-comment-btn" class="send-comment-btn" v-if="draft.trim().length > 0 || submitting">
                        <span class="char-count unselectable">{{ draft.trim().length }}</span>
                        <button type="button"
                                class="unstyled-button"
                                :disabled="!canSubmit"
                                :aria-label="msg.postComment"
                                @click="submitComment">
                            <span v-if="submitting" class="send-spinner" aria-hidden="true"></span>
                            <i-fas-paper-plane v-else class="icon" />
                        </button>
                    </div>
                </div>

                <!-- Manual ALTCHA fallback ONLY shown if automatic inline PoW failed -->
                <AltchaWidget v-if="needsAltcha && showManualAltcha"
                              ref="altchaRef"
                              :api="activeApi"
                              v-model="altchaPayload" />

                <div v-if="submitError" class="composer-error">{{ submitError }}</div>
            </div>
        </div>

        <ReactionSelector :open="!!reactionTarget"
                          :reactions="availableCommentReactions"
                          :chosen-keys="chosenCommentReactionKeys"
                          :posts-url="resolvedPostsUrl"
                          :anchor="selectorAnchor"
                          @select="onSelectCommentReactionChoice"
                          @close="reactionTargetId = null" />
    </div>
</template>

<script lang="ts" setup>
import moment from 'moment'
import {computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, onUpdated, ref, watch} from 'vue'
import {CommentDTO, MergedReaction, ReactionTogglePayload} from '@/logic/models'
import {solveAltchaChallenge} from '@/logic/altcha'
import {sanitizeCommentHtml} from '@/logic/api'
import {replaceTextEmojisWithApple, useAppleEmojiBaseUrl} from '@/logic/appleEmoji'
import {
    buildAvailableReactions,
    canonicalReactionKey,
    ReactionChoice,
    resolveCustomEmojiBaseSrc,
} from '@/logic/reactions'
import {
    applyCommentDeleteInList,
    applyOptimisticCommentReactionToggle,
    buildChatMessages,
    formatCommentShortDate,
    loadOwnCommentIds,
    mergeCommentReactionsInList,
    saveOwnCommentId,
    upsertCommentInList,
} from '@/logic/state'
import {useTgbInteractive} from '@/logic/interactive'
import {useTgbMessages} from '@/logic/messages'
import {sanitizeAvatarUrl} from '@/logic/url'
import AltchaWidget from '@/views/AltchaWidget.vue'
import AppleEmoji from '@/views/AppleEmoji.vue'
import CustomEmoji from '@/views/CustomEmoji.vue'

const ReactionSelector = defineAsyncComponent(() => import('@/views/ReactionSelector.vue'))

const SENDER_PALETTE = [
    '#c8553d', '#2b8a6e', '#5a6fb8', '#a85d8e', '#b5742c', '#2c7da0', '#8d5b4c',
]

const msg = useTgbMessages()
const ctx = useTgbInteractive()
const appleEmojiBaseUrl = useAppleEmojiBaseUrl()

const props = defineProps<{
    postId: number
    postsUrl?: string
}>()

const chatListEl = ref<HTMLElement | null>(null)
const comments = ref<CommentDTO[]>([])
const ownCommentIds = ref<Set<number>>(new Set())
const loading = ref(true)
const loadError = ref<string | null>(null)

const draft = ref('')
const replyTarget = ref<CommentDTO | null>(null)
const asAnonymous = ref(false)
const altchaPayload = ref<string | null>(null)
const showManualAltcha = ref(false)
const altchaRef = ref<InstanceType<typeof AltchaWidget> | null>(null)
const textareaEl = ref<HTMLTextAreaElement | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const confirmDeleteId = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null
const deletingId = ref<number | null>(null)
const togglingNotify = ref(false)

const highlightedId = ref<number | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null
let autoAltchaController: AbortController | null = null

const reactionTargetId = ref<number | null>(null)
const selectorAnchor = ref({x: 0, y: 0})
const reactionSeqMap = new Map<number, number>()
const reactionInFlightMap = new Map<number, number>()

const channelCustomEmojis = computed(() => ctx?.channelCustomEmojis.value ?? {})
const epochEmojiBase = computed(() => ctx?.epochEmojiBase.value ?? null)
const resolvedPostsUrl = computed(() => props.postsUrl ?? '')

const reactionTarget = computed(() => {
    if (reactionTargetId.value === null) return null
    const target = comments.value.find(c => c.id === reactionTargetId.value)
    return target && !target.deleted ? target : null
})

const availableCommentReactions = computed((): ReactionChoice[] =>
    buildAvailableReactions(
        reactionTarget.value?.reactions ?? [],
        channelCustomEmojis.value,
        resolvedPostsUrl.value,
        epochEmojiBase.value,
        ctx?.allowedReactions.value ?? null
    )
)

const chosenCommentReactionKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    for (const r of reactionTarget.value?.reactions ?? []) {
        if (!r.reacted) continue
        keys.add(r.reaction_key)
        const canon = canonicalReactionKey(r)
        if (canon) keys.add(canon)
    }
    return keys
})

function customEmojiSrc(id: string): string {
    return resolveCustomEmojiBaseSrc(id, channelCustomEmojis.value, resolvedPostsUrl.value, epochEmojiBase.value)
}

const activeApi = computed(() => ctx?.api.value ?? null)
const me = computed(() => ctx?.me.value ?? null)
const allowAnon = computed(() => ctx?.allowAnonComments.value ?? false)
const isPostingAnon = computed(() => !me.value || (allowAnon.value && asAnonymous.value))
const canCompose = computed(() => !!me.value || allowAnon.value)
const needsAltcha = computed(() => canCompose.value && isPostingAnon.value)
const canSubmit = computed(() => {
    if (!activeApi.value || submitting.value) return false
    if (!draft.value.trim()) return false
    if (needsAltcha.value && showManualAltcha.value && !altchaPayload.value) return false
    return true
})

const chatMessages = computed(() => buildChatMessages(comments.value, ownCommentIds.value))

watch(me, (newMe) => {
    if (!newMe) asAnonymous.value = false
})

watch(needsAltcha, (needed) => {
    if (!needed) {
        altchaPayload.value = null
        showManualAltcha.value = false
    }
})

watch(activeApi, (nextApi) => {
    if (nextApi) {
        void fetchComments()
    }
})

function safeAvatar(url?: string | null): string | null {
    return sanitizeAvatarUrl(url)
}

function avatarInitial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase() || '?'
}

function isTelegramSynced(c: CommentDTO): boolean {
    return c.source === 'telegram' || c.author?.role === 'telegram'
}

function isAnonymous(c: CommentDTO): boolean {
    return !c.author?.verified && !isTelegramSynced(c)
}

function hashName(name: string): number {
    let h = 0
    for (let i = 0; i < name.length; i++) {
        h = ((h << 5) - h + name.charCodeAt(i)) | 0
    }
    return Math.abs(h)
}

function senderColor(c: CommentDTO): string {
    if (c.author?.role === 'owner') return '#ab4343'
    if (isTelegramSynced(c)) return '#1982b8'
    if (isAnonymous(c)) return '#8a7357'
    return SENDER_PALETTE[hashName(c.author?.display_name || '') % SENDER_PALETTE.length]
}

function avatarFallbackStyle(c: CommentDTO): Record<string, string> {
    if (c.author?.role === 'owner' || isTelegramSynced(c) || isAnonymous(c)) return {}
    const col = senderColor(c)
    return {backgroundColor: col, color: '#fff'}
}

function avatarClass(c: CommentDTO): Record<string, boolean> {
    return {
        owner: c.author?.role === 'owner',
        telegram: isTelegramSynced(c),
        anon: isAnonymous(c),
    }
}

function providerLabel(provider?: string | null): string {
    if (!provider) return msg.badgeVerified
    return `${msg.badgeVerified} (${provider})`
}

function formatFullDate(iso: string): string {
    return moment(iso).format(msg.dateFormat)
}

function formatShortDate(iso: string): string {
    return formatCommentShortDate(iso)
}

function formatShortTime(iso: string): string {
    return moment(iso).format('HH:mm')
}

function applyAppleEmojis() {
    if (!chatListEl.value || !appleEmojiBaseUrl.value) return
    chatListEl.value.querySelectorAll<HTMLElement>('.comment-body').forEach(node => {
        replaceTextEmojisWithApple(node, appleEmojiBaseUrl.value)
    })
}

function quoteSnippet(c: CommentDTO): string {
    const raw = (c.body_text || '').replace(/\s+/g, ' ').trim()
    return raw.length > 90 ? `${raw.slice(0, 90)}…` : raw
}

function renderBody(c: CommentDTO): string {
    return sanitizeCommentHtml(c.body_html, c.body_text)
}

function resizeInput() {
    const el = textareaEl.value
    if (!el) return
    el.style.height = 'auto'
    const border = el.offsetHeight - el.clientHeight
    el.style.height = `${Math.min(el.scrollHeight + border, 160)}px`
}

function jumpToComment(commentId: number) {
    if (typeof document === 'undefined') return
    const target = document.getElementById(`comment-${commentId}`)
    if (!target) return
    target.scrollIntoView({behavior: 'smooth', block: 'center'})
    highlightedId.value = commentId
    if (highlightTimer) clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => {
        highlightedId.value = null
    }, 1500)
}

async function fetchComments() {
    if (!ctx || !activeApi.value) return
    loading.value = true
    loadError.value = null
    try {
        const res = await activeApi.value.getComments(props.postId)
        comments.value = res.comments ?? []
        ctx.markCommentsSeen(props.postId, comments.value.map(c => c.id))
    } catch (err: any) {
        loadError.value = err?.message || msg.commentsLoadFailed
    } finally {
        loading.value = false
    }
}

function upsertComment(incoming: CommentDTO) {
    comments.value = upsertCommentInList(comments.value, incoming)
}

function applyDelete(commentId: number) {
    if (replyTarget.value?.id === commentId) {
        replyTarget.value = null
    }
    if (reactionTargetId.value === commentId) {
        reactionTargetId.value = null
    }
    comments.value = applyCommentDeleteInList(comments.value, commentId)
}

const BUBBLE_TRIGGER_IGNORE_SELECTOR = 'a, button, input, textarea, select, img, .comment-reaction-btn, .inline-reply-quote, pre, code'

function shouldIgnoreBubbleReactionTrigger(target: EventTarget | null): boolean {
    if (typeof window !== 'undefined' && window.getSelection()?.toString().trim()) {
        return true
    }
    if (target instanceof Element && target.closest(BUBBLE_TRIGGER_IGNORE_SELECTOR)) {
        return true
    }
    return false
}

function openCommentReactionSelectorAt(comment: CommentDTO, x: number, y: number) {
    if (comment.deleted) return
    selectorAnchor.value = {x, y}
    reactionTargetId.value = comment.id
}

function onBubbleContextMenu(comment: CommentDTO, e: MouseEvent) {
    if (comment.deleted || e.shiftKey) return
    if (shouldIgnoreBubbleReactionTrigger(e.target)) return
    e.preventDefault()
    openCommentReactionSelectorAt(comment, e.clientX, e.clientY)
}

const SWIPE_REPLY_THRESHOLD = 44
const SWIPE_MAX_OFFSET = 68

interface BubbleSwipeState {
    id: number
    startX: number
    startY: number
    offset: number
    locked: 'h' | 'v' | null
    pointerId: number
    comment: CommentDTO
}

const swipeState = ref<BubbleSwipeState | null>(null)

let bubbleLongPressTimer: ReturnType<typeof setTimeout> | null = null
let bubbleGhostClickTimer: ReturnType<typeof setTimeout> | null = null
let bubbleSuppressGhostClick = false
let bubblePressStart = {x: 0, y: 0}
let activeTouchCleanup: (() => void) | null = null

function cancelBubbleLongPress() {
    if (bubbleLongPressTimer) {
        clearTimeout(bubbleLongPressTimer)
        bubbleLongPressTimer = null
    }
}

function clearBubbleGhostClickGuard() {
    bubbleSuppressGhostClick = false
    if (bubbleGhostClickTimer) {
        clearTimeout(bubbleGhostClickTimer)
        bubbleGhostClickTimer = null
    }
}

function armBubbleGhostClickGuard(durationMs = 800) {
    bubbleSuppressGhostClick = true
    if (bubbleGhostClickTimer) clearTimeout(bubbleGhostClickTimer)
    bubbleGhostClickTimer = setTimeout(() => {
        bubbleSuppressGhostClick = false
        bubbleGhostClickTimer = null
    }, durationMs)
}

function cleanupTouchListeners() {
    activeTouchCleanup?.()
    activeTouchCleanup = null
}

function swipeWrapperStyle(commentId: number) {
    if (swipeState.value?.id !== commentId || swipeState.value.locked !== 'h') return undefined
    return {transform: `translateX(${swipeState.value.offset}px)`}
}

function swipeHintStyle(commentId: number) {
    if (swipeState.value?.id !== commentId || swipeState.value.locked !== 'h' || swipeState.value.offset >= 0) {
        return undefined
    }
    const progress = Math.min(1, Math.abs(swipeState.value.offset) / SWIPE_REPLY_THRESHOLD)
    const scale = 0.55 + progress * 0.45
    return {
        opacity: String(progress),
        transform: `translateY(-50%) scale(${scale.toFixed(2)})`,
    }
}

function onBubbleClickCapture(e: MouseEvent) {
    if (!bubbleSuppressGhostClick) return
    clearBubbleGhostClickGuard()
    e.preventDefault()
    e.stopPropagation()
}

function onBubblePointerDown(comment: CommentDTO, e: PointerEvent) {
    if (comment.deleted || e.pointerType !== 'touch') return

    cancelBubbleLongPress()
    cleanupTouchListeners()
    bubblePressStart = {x: e.clientX, y: e.clientY}

    if (!shouldIgnoreBubbleReactionTrigger(e.target)) {
        bubbleLongPressTimer = setTimeout(() => {
            bubbleLongPressTimer = null
            if (typeof window !== 'undefined' && window.getSelection()?.toString().trim()) return
            armBubbleGhostClickGuard(800)
            swipeState.value = null
            cleanupTouchListeners()
            openCommentReactionSelectorAt(comment, bubblePressStart.x, bubblePressStart.y)
        }, 420)
    }

    if (canCompose.value && typeof window !== 'undefined') {
        swipeState.value = {
            id: comment.id,
            startX: e.clientX,
            startY: e.clientY,
            offset: 0,
            locked: null,
            pointerId: e.pointerId,
            comment,
        }

        const onWindowMove = (ev: PointerEvent) => {
            const cur = swipeState.value
            if (!cur || ev.pointerId !== cur.pointerId) return
            const dx = ev.clientX - cur.startX
            const dy = ev.clientY - cur.startY

            if (Math.hypot(dx, dy) > 8) {
                cancelBubbleLongPress()
            }

            if (cur.locked === null) {
                if (Math.hypot(dx, dy) <= 8) return
                if (dx < 0 && Math.abs(dx) > Math.abs(dy)) {
                    cur.locked = 'h'
                    armBubbleGhostClickGuard(350)
                } else {
                    cur.locked = 'v'
                    swipeState.value = null
                    cleanupTouchListeners()
                    return
                }
            }

            if (cur.locked === 'h') {
                cur.offset = Math.max(-SWIPE_MAX_OFFSET, Math.min(0, dx * 0.72))
            }
        }

        const onWindowEnd = (ev: PointerEvent) => {
            const cur = swipeState.value
            if (cur && ev.pointerId !== cur.pointerId) return
            cancelBubbleLongPress()
            cleanupTouchListeners()
            if (
                ev.type === 'pointerup'
                && cur
                && cur.locked === 'h'
                && -cur.offset >= SWIPE_REPLY_THRESHOLD
                && !cur.comment.deleted
            ) {
                armBubbleGhostClickGuard(350)
                startReply(cur.comment)
            }
            swipeState.value = null
        }

        window.addEventListener('pointermove', onWindowMove, {passive: true})
        window.addEventListener('pointerup', onWindowEnd)
        window.addEventListener('pointercancel', onWindowEnd)
        activeTouchCleanup = () => {
            window.removeEventListener('pointermove', onWindowMove)
            window.removeEventListener('pointerup', onWindowEnd)
            window.removeEventListener('pointercancel', onWindowEnd)
        }
    } else if (typeof window !== 'undefined') {
        const onMoveNoSwipe = (ev: PointerEvent) => {
            if (ev.pointerId !== e.pointerId) return
            if (Math.hypot(ev.clientX - bubblePressStart.x, ev.clientY - bubblePressStart.y) > 8) {
                cancelBubbleLongPress()
            }
        }
        const onEndNoSwipe = (ev: PointerEvent) => {
            if (ev.pointerId !== e.pointerId) return
            cancelBubbleLongPress()
            cleanupTouchListeners()
        }
        window.addEventListener('pointermove', onMoveNoSwipe, {passive: true})
        window.addEventListener('pointerup', onEndNoSwipe)
        window.addEventListener('pointercancel', onEndNoSwipe)
        activeTouchCleanup = () => {
            window.removeEventListener('pointermove', onMoveNoSwipe)
            window.removeEventListener('pointerup', onEndNoSwipe)
            window.removeEventListener('pointercancel', onEndNoSwipe)
        }
    }
}

async function toggleCommentReaction(comment: CommentDTO, payload: ReactionTogglePayload) {
    const api = activeApi.value
    if (!api || comment.deleted) return
    const commentId = comment.id
    const prevSnapshot = (comment.reactions ?? []).map(r => ({...r}))

    const seq = (reactionSeqMap.get(commentId) ?? 0) + 1
    reactionSeqMap.set(commentId, seq)
    reactionInFlightMap.set(commentId, (reactionInFlightMap.get(commentId) ?? 0) + 1)

    // Optimistic UI update
    comments.value = applyOptimisticCommentReactionToggle(comments.value, commentId, payload)

    try {
        const res = await api.toggleCommentReaction(commentId, payload)
        if (activeApi.value === api && reactionSeqMap.get(commentId) === seq) {
            comments.value = mergeCommentReactionsInList(comments.value, commentId, res.reactions)
        }
    } catch (err) {
        console.warn('[tg-blog] Comment reaction toggle failed:', err)
        const remaining = (reactionInFlightMap.get(commentId) ?? 1) - 1
        if (activeApi.value === api) {
            if (reactionSeqMap.get(commentId) === seq && remaining === 0) {
                comments.value = mergeCommentReactionsInList(comments.value, commentId, prevSnapshot)
            } else {
                void fetchComments()
            }
        }
    } finally {
        const nextInFlight = Math.max(0, (reactionInFlightMap.get(commentId) ?? 1) - 1)
        if (nextInFlight === 0) {
            reactionInFlightMap.delete(commentId)
        } else {
            reactionInFlightMap.set(commentId, nextInFlight)
        }
    }
}

function onToggleCommentReaction(comment: CommentDTO, r: MergedReaction) {
    if (r.custom_emoji_id) {
        void toggleCommentReaction(comment, {custom_emoji_id: r.custom_emoji_id})
    } else if (r.emoji) {
        void toggleCommentReaction(comment, {emoji: r.emoji})
    }
}

function onSelectCommentReactionChoice(choice: ReactionChoice) {
    const target = reactionTarget.value
    if (!target) return
    if (choice.custom_emoji_id) {
        void toggleCommentReaction(target, {custom_emoji_id: choice.custom_emoji_id})
    } else if (choice.emoji) {
        void toggleCommentReaction(target, {emoji: choice.emoji})
    }
}

function startReply(comment: CommentDTO) {
    if (comment.deleted) return
    replyTarget.value = comment
    nextTick(() => {
        textareaEl.value?.focus()
    })
}

function onComposerKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSubmit.value) {
        e.preventDefault()
        void submitComment()
    }
}

async function submitComment() {
    if (!ctx || !activeApi.value || !canSubmit.value) return
    submitting.value = true
    submitError.value = null

    try {
        let solvedPayload: string | null = null
        if (needsAltcha.value) {
            if (altchaPayload.value) {
                solvedPayload = altchaPayload.value
            } else {
                // Frictionless automatic inline ALTCHA PoW on send
                autoAltchaController?.abort()
                const controller = new AbortController()
                autoAltchaController = controller
                try {
                    const challenge = await activeApi.value.getCaptchaChallenge(controller.signal)
                    if (controller.signal.aborted) return
                    const res = await solveAltchaChallenge(challenge, controller.signal)
                    if (controller.signal.aborted) return
                    solvedPayload = res.payload
                } catch (powErr: any) {
                    if (controller.signal.aborted || powErr?.name === 'AbortError') return
                    showManualAltcha.value = true
                    submitError.value = msg.altchaError
                    return
                } finally {
                    if (autoAltchaController === controller) {
                        autoAltchaController = null
                    }
                }
            }
        }

        const created = await activeApi.value.createComment(props.postId, {
            body: draft.value.trim(),
            parent_id: replyTarget.value?.id ?? null,
            as_anonymous: isPostingAnon.value,
            altcha_payload: solvedPayload,
        })

        // Mark as own comment locally (persists across reloads even for anonymous replies)
        saveOwnCommentId(created.id)
        const nextOwn = new Set(ownCommentIds.value)
        nextOwn.add(created.id)
        ownCommentIds.value = nextOwn

        upsertComment({...created, is_mine: true})
        ctx.notifyLocalCommentCreated(created)
        draft.value = ''
        replyTarget.value = null
        altchaPayload.value = null
        showManualAltcha.value = false
        altchaRef.value?.reset()
        await nextTick()
        resizeInput()
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to post comment'
        altchaPayload.value = null
        altchaRef.value?.reset()
    } finally {
        submitting.value = false
    }
}

async function handleDeleteClick(comment: CommentDTO) {
    if (!ctx || !activeApi.value) return
    if (confirmDeleteId.value !== comment.id) {
        confirmDeleteId.value = comment.id
        if (confirmTimer) clearTimeout(confirmTimer)
        confirmTimer = setTimeout(() => {
            confirmDeleteId.value = null
        }, 3000)
        return
    }

    if (confirmTimer) clearTimeout(confirmTimer)
    confirmDeleteId.value = null
    deletingId.value = comment.id
    try {
        await activeApi.value.deleteComment(comment.id)
        applyDelete(comment.id)
        ctx.notifyLocalCommentDeleted(props.postId, comment.id)
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to delete comment'
    } finally {
        deletingId.value = null
    }
}

async function toggleNotify() {
    if (!ctx || !me.value || togglingNotify.value) return
    togglingNotify.value = true
    try {
        await ctx.updateProfile({notify_replies: !me.value.notify_replies})
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to update notification setting'
    } finally {
        togglingNotify.value = false
    }
}

async function handleLogout() {
    if (!ctx) return
    await ctx.logout()
}

let unsubscribe: (() => void) | null = null

onMounted(() => {
    ownCommentIds.value = loadOwnCommentIds()
    if (!ctx) return
    void fetchComments()
    unsubscribe = ctx.subscribeComments(props.postId, {
        onCreated: (c) => upsertComment(c),
        onDeleted: (ev) => applyDelete(ev.comment_id),
        onReactionUpdated: (ev) => {
            if ((reactionInFlightMap.get(ev.comment_id) ?? 0) > 0) return
            comments.value = mergeCommentReactionsInList(comments.value, ev.comment_id, ev.reactions)
        },
        onAuthChanged: () => { void fetchComments() },
    })
    nextTick(() => {
        resizeInput()
        applyAppleEmojis()
    })
})

onUpdated(() => {
    applyAppleEmojis()
})

watch(appleEmojiBaseUrl, () => {
    nextTick(() => applyAppleEmojis())
})

onUnmounted(() => {
    unsubscribe?.()
    autoAltchaController?.abort()
    cancelBubbleLongPress()
    cleanupTouchListeners()
    clearBubbleGhostClickGuard()
    if (confirmTimer) clearTimeout(confirmTimer)
    if (highlightTimer) clearTimeout(highlightTimer)
})
</script>

<style lang="sass" scoped>
@use "sass:color"
@use "css/colors" as *
@use "css/global" as *

// External chat zone tucked cleanly underneath .post.tgb-card's 20px rounded bottom corners
.chat-zone
    position: relative
    margin: 0 14px
    padding: 14px 12px 14px
    text-align: left
    font-size: 0.9em
    background: linear-gradient(180deg, rgba(255, 131, 115, 0.14) 0%, rgba(255, 131, 115, 0.04) 65%, rgba(255, 131, 115, 0) 100%)

    // Two delicate 1px vertical pink-to-transparent lines along left & right edges (integer 1px avoids Firefox subpixel mismatch)
    &::before, &::after
        content: ""
        position: absolute
        top: 0
        bottom: 0
        width: 1px
        background: linear-gradient(180deg, rgba(255, 131, 115, 0.52) 0%, rgba(255, 131, 115, 0.16) 75%, rgba(255, 131, 115, 0) 100%)
        pointer-events: none

    &::before
        left: 0

    &::after
        right: 0

.thread-status
    padding: 8px 6px
    font-size: 0.88em
    color: $color-text-light
    display: flex
    align-items: center
    justify-content: center
    gap: 8px

    &.error
        color: #c93b3b

.link-btn
    background: none
    border: none
    color: $color-text-special
    font-weight: 600
    font-size: inherit
    cursor: pointer
    padding: 0
    text-decoration: underline

.chat-list
    display: flex
    flex-direction: column
    margin-bottom: 10px

// Telegram Web A Message bubble layout (Message.scss + _message-content.scss + MessageAppendix.tsx)
.Message
    --border-radius-messages: 15px
    --border-radius-messages-small: 6px
    --border-top-left-radius: var(--border-radius-messages)
    --border-top-right-radius: var(--border-radius-messages)
    --border-bottom-left-radius: var(--border-radius-messages)
    --border-bottom-right-radius: var(--border-radius-messages)
    --tgb-bubble-bg: #fffcf9
    --tgb-bubble-highlight-bg: #fff1ee

    position: relative
    display: flex
    align-items: flex-end
    margin-bottom: 3px
    touch-action: pan-y

    &.last-in-group
        margin-bottom: 9px

    &.is-highlighted .message-content
        animation: tgb-bubble-highlight 1.4s ease

    &.is-highlighted .svg-appendix .corner
        animation: tgb-appendix-highlight 1.4s ease

    &.is-highlighted .tombstone-bubble
        animation: tgb-tombstone-highlight 1.4s ease

    &:not(.own)
        padding-left: 2.35rem

        &.first-in-group:not(.last-in-group)
            --border-bottom-left-radius: var(--border-radius-messages-small)

        &:not(.first-in-group):not(.last-in-group)
            --border-top-left-radius: var(--border-radius-messages-small)
            --border-bottom-left-radius: var(--border-radius-messages-small)

        &.last-in-group:not(.first-in-group)
            --border-top-left-radius: var(--border-radius-messages-small)

        &.last-in-group .message-content.has-appendix
            --border-bottom-left-radius: 0

    &.own
        flex-direction: row-reverse

        &.first-in-group:not(.last-in-group)
            --border-bottom-right-radius: var(--border-radius-messages-small)

        &:not(.first-in-group):not(.last-in-group)
            --border-top-right-radius: var(--border-radius-messages-small)
            --border-bottom-right-radius: var(--border-radius-messages-small)

        &.last-in-group:not(.first-in-group)
            --border-top-right-radius: var(--border-radius-messages-small)

        &.last-in-group .message-content.has-appendix
            --border-bottom-right-radius: 0

        .message-content-wrapper
            flex-direction: row-reverse

        .svg-appendix
            right: -8.5px
            left: auto

.tombstone-bubble
    font-style: italic
    font-size: 0.82em
    color: $color-text-light
    padding: 4px 10px
    border-radius: 10px
    border: 1px dashed rgba(112, 81, 42, 0.2)

.avatar-slot
    position: absolute
    bottom: 0
    left: 0
    width: 32px
    height: 32px
    flex-shrink: 0

.bubble-avatar
    width: 32px
    height: 32px
    border-radius: 50%
    object-fit: cover
    display: block
    box-shadow: 0 1px 3px rgba(112, 81, 42, 0.16)

.avatar-fallback
    display: inline-flex
    align-items: center
    justify-content: center
    background: rgba(112, 81, 42, 0.16)
    color: $color-text-main
    font-size: 0.82em
    font-weight: 700
    user-select: none

    &.owner
        background: $color-text-special
        color: #fff

    &.telegram
        background: #24a1de
        color: #fff

    &.anon
        background: rgba(112, 81, 42, 0.12)
        color: $color-text-light

.message-content-wrapper
    display: flex
    align-items: center
    gap: 5px
    max-width: 88%
    min-width: 0
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)

    &.is-swiping
        transition: none

.swipe-reply-hint
    position: absolute
    right: 2px
    top: 50%
    width: 26px
    height: 26px
    border-radius: 50%
    background: rgba(253, 249, 241, 0.94)
    border: 1px solid rgba(112, 81, 42, 0.14)
    color: $color-text-light
    display: flex
    align-items: center
    justify-content: center
    pointer-events: none
    opacity: 0
    transform: translateY(-50%) scale(0.55)
    transition: background-color 0.14s ease, border-color 0.14s ease, color 0.14s ease

    svg
        width: 14px
        height: 14px

    &.ready
        background: $color-text-special
        border-color: $color-text-special
        color: #fff

.message-content
    position: relative
    min-width: 64px
    max-width: 100%
    background: var(--tgb-bubble-bg)
    box-shadow: 0 1px 2px rgba(112, 81, 42, 0.12)
    border-top-left-radius: var(--border-top-left-radius)
    border-top-right-radius: var(--border-top-right-radius)
    border-bottom-left-radius: var(--border-bottom-left-radius)
    border-bottom-right-radius: var(--border-bottom-right-radius)
    padding: 6px 10px 6px 11px
    box-sizing: border-box

.svg-appendix
    position: absolute
    bottom: -3px
    left: -8.5px
    width: 9px
    height: 20px
    overflow: hidden
    pointer-events: none
    filter: drop-shadow(0 1px 1px rgba(112, 81, 42, 0.08))

    .corner
        fill: var(--tgb-bubble-bg)

.message-title
    display: flex
    align-items: center
    gap: 4px
    margin-bottom: 2px
    font-size: 0.82em
    font-weight: 600
    line-height: 1.25
    user-select: none

    .sender-title
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

// Bottom-right timestamp inside every bubble (date by default, hover over the date for HH:mm)
.message-timestamp
    display: inline-grid
    align-items: center
    justify-items: end
    font-size: 0.72em
    font-weight: 400
    line-height: 1.1
    color: $color-text-light
    font-variant-numeric: tabular-nums
    white-space: nowrap
    flex-shrink: 0
    cursor: default
    user-select: none

    &.in-text
        float: right
        margin: 4px 0 -1px 8px

    &.in-reactions
        margin-left: auto
        align-self: flex-end
        padding: 2px 0 1px 4px

    > span
        grid-area: 1 / 1
        transition: opacity 0.15s ease

    .ts-time
        opacity: 0

.message-timestamp:hover
    .ts-date
        opacity: 0

    .ts-time
        opacity: 1

.badge
    display: inline-flex
    align-items: center
    gap: 2px
    padding: 0 5px
    border-radius: 999px
    font-size: 0.78em
    font-weight: 600
    line-height: 1.35
    flex-shrink: 0

    .badge-svg
        width: 10px
        height: 10px

.badge-owner
    background: $color-text-special
    color: #fff

.badge-verified
    padding: 2px
    background: rgba(47, 158, 68, 0.13)
    color: #2b8a3e

.badge-telegram
    padding: 2px
    background: rgba(36, 161, 222, 0.14)
    color: #1982b8

.badge-anon
    background: rgba(112, 81, 42, 0.08)
    color: $color-text-light
    font-weight: 500

.inline-reply-quote
    display: block
    width: 100%
    text-align: left
    margin: 2px 0 5px
    padding: 3px 8px
    border: none
    border-left: 2.5px solid $color-text-special
    border-radius: 4px 6px 6px 4px
    background: rgba(255, 131, 115, 0.1)
    font-family: inherit
    transition: background-color 0.15s ease

    &:hover
        background: rgba(255, 131, 115, 0.17)

    .quote-author
        font-size: 0.78em
        font-weight: 700
        color: $color-text-special-dark
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

    .quote-snippet
        font-size: 0.78em
        color: $color-text-light
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

.text-content
    display: flow-root
    font-size: 0.94em
    line-height: 1.42
    overflow-wrap: anywhere
    color: $color-text-main

.comment-body
    :deep(p)
        display: inline
        margin: 0

    :deep(p + p::before)
        content: "\A"
        white-space: pre

    :deep(a)
        color: $color-text-special
        text-decoration: underline

    :deep(code)
        background: rgba(0, 0, 0, 0.06)
        padding: 1px 4px
        border-radius: 4px
        font-size: 0.9em

    :deep(blockquote)
        margin: 4px 0
        padding: 2px 8px
        font-size: 0.92em

.comment-reactions
    display: flex
    flex-wrap: wrap
    gap: 4px
    margin-top: 5px

.comment-reaction-btn
    --custom-emoji-size: 1.05rem
    --apple-emoji-size: 1rem
    display: inline-flex
    align-items: center
    gap: 3px
    height: 1.45rem
    padding: 0 7px 0 5px
    border: none
    border-radius: 999px
    font-family: inherit
    font-size: 0.78em
    font-weight: 600
    font-variant-numeric: tabular-nums
    line-height: 1
    white-space: nowrap
    cursor: pointer
    background: rgba(255, 131, 115, 0.13)
    color: $color-text-special-dark
    transition: background-color 150ms ease, color 150ms ease, transform 120ms ease

    .reaction-emoji
        --apple-emoji-size: 0.98rem
        font-size: 0.95rem
        line-height: 1
        vertical-align: middle !important

    .reaction-count
        color: inherit
        font-size: 0.92em
        font-weight: 600

    &:hover
        background: rgba(255, 131, 115, 0.22)

    &:active
        transform: scale(0.95)

    &.chosen
        background: $color-text-special
        color: #ffffff

        &:hover
            background: color.adjust($color-text-special, $lightness: -4%)

.bubble-actions
    display: flex
    align-items: center
    gap: 2px
    opacity: 0
    transition: opacity 0.15s ease
    flex-shrink: 0

@media (hover: hover) and (pointer: fine)
    .Message:hover .bubble-actions,
    .Message:focus-within .bubble-actions,
    .Message.selector-open .bubble-actions
        opacity: 1

@media (hover: none), (pointer: coarse)
    .bubble-act-btn.reply-btn
        display: none

    .bubble-actions:has(.bubble-act-btn.danger)
        opacity: 0.65

    .bubble-actions:not(:has(.bubble-act-btn.danger))
        display: none

.bubble-act-btn
    background: rgba(253, 249, 241, 0.85)
    border: 1px solid rgba(112, 81, 42, 0.1)
    border-radius: 999px
    min-width: 24px
    height: 24px
    padding: 0 5px
    color: $color-text-light
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    font-family: inherit
    font-size: 0.72em
    transition: color 0.14s ease, background-color 0.14s ease, border-color 0.14s ease

    svg
        width: 13px
        height: 13px

    &:hover
        color: $color-text-special-dark
        border-color: rgba(255, 131, 115, 0.45)

    &.danger:hover, &.confirming
        color: #c93b3b
        border-color: rgba(201, 59, 59, 0.45)

    .confirm-text
        font-weight: 600
        white-space: nowrap

// Composer area
.composer
    display: flex
    flex-direction: column
    gap: 6px

.user-bar, .guest-bar
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: 6px

.guest-bar
    position: relative
    z-index: 1

.guest-auth-row
    display: inline-flex
    align-items: center
    gap: 8px

.guest-bar.has-composer
    align-items: flex-end

    .guest-auth-row
        align-items: flex-end

    .guest-avatar
        margin-left: 12px
        margin-bottom: -16px

    .signin-btn
        margin-bottom: 2px

.guest-avatar
    width: 30px
    height: 30px
    border-radius: 50%
    flex-shrink: 0
    display: inline-flex
    align-items: center
    justify-content: center
    background: #eee5d7
    color: $color-text-light
    border: 1px solid rgba(112, 81, 42, 0.14)
    box-sizing: border-box
    user-select: none

    svg
        width: 18px
        height: 18px

.user-pill
    display: inline-flex
    align-items: center
    gap: 6px
    font-size: 0.84em
    font-weight: 600
    color: $color-text-main

.avatar.sm
    width: 18px
    height: 18px
    border-radius: 50%
    object-fit: cover

.user-controls
    display: flex
    align-items: center
    flex-wrap: wrap
    gap: 6px

.anon-toggle
    display: inline-flex
    align-items: center
    gap: 4px
    font-size: 0.78em
    color: $color-text-light
    cursor: pointer
    user-select: none

    input
        margin: 0
        accent-color: $color-text-special

.chip-btn
    background: rgba(253, 249, 241, 0.8)
    border: 1px solid rgba(112, 81, 42, 0.12)
    border-radius: 999px
    padding: 2px 8px
    font-size: 0.75em
    font-family: inherit
    color: $color-text-main
    cursor: pointer
    transition: background 0.15s ease, border-color 0.15s ease

    &.active
        background: rgba(255, 131, 115, 0.16)
        border-color: rgba(255, 131, 115, 0.45)
        color: $color-text-special-dark

    &.subtle
        color: $color-text-light

    &:hover:not(:disabled)
        background: rgba(255, 244, 235, 0.95)

.signin-btn
    display: inline-flex
    align-items: center
    gap: 5px
    background: $color-bg-card
    border: none
    color: $color-text-light
    border-radius: 999px
    padding: 3px 10px
    font-size: 0.82em
    font-weight: 400
    line-height: 1.4
    font-family: inherit
    cursor: pointer
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 8%)
    transition: color 0.2s ease, transform 0.2s ease

    &:hover
        color: $color-text-special
        transform: translateY(-1px)

.guest-hint
    font-size: 0.78em
    color: $color-text-light

.composer-box
    position: relative
    z-index: 2
    display: flex
    flex-direction: column
    gap: 6px

.reply-banner
    display: flex
    align-items: center
    justify-content: space-between
    gap: 8px
    padding: 5px 10px
    border-left: 2.5px solid $color-text-special
    border-radius: 6px 10px 10px 6px
    background: #fbf4ea
    font-size: 0.8em

    .reply-banner-content
        display: flex
        flex-direction: column
        min-width: 0

    .reply-banner-title
        font-weight: 600
        color: $color-text-special-dark

    .reply-banner-snippet
        color: $color-text-light
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

.cancel-reply-btn
    background: none
    border: none
    color: $color-text-light
    font-size: 0.95em
    cursor: pointer
    padding: 2px 4px
    flex-shrink: 0

    &:hover
        color: $color-text-special-dark

// Ported from one-among-us/web ProfileComments.vue (#add-comment + #send-comment-btn)
.add-comment
    position: relative

    textarea
        display: block
        font-family: $font
        font-size: 0.94em
        line-height: 1.45
        width: 100%
        min-height: 40px
        background: #fdf9f1
        color: $color-text-main
        border-radius: 12px
        overflow-y: auto
        resize: none
        border: 1px solid rgba(112, 81, 42, 0.14)
        padding: 10px 68px 10px 12px
        box-sizing: border-box
        outline: none
        transition: border-color 0.16s ease, background-color 0.16s ease

        &:focus, &:focus-visible
            outline: none
            border-color: rgba(112, 81, 42, 0.26)
            background: #fffcf9

        &::placeholder
            color: $color-text-light
            opacity: 0.65

.send-comment-btn
    position: absolute
    right: 10px
    bottom: 10px
    color: $color-text-special
    display: flex
    align-items: center

    .char-count
        font-size: 10px
        color: $color-text-light
        margin-right: 5px
        font-variant-numeric: tabular-nums

    .unstyled-button
        background: none
        border: none
        padding: 2px
        color: inherit
        cursor: pointer
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 1.05em
        transition: transform 0.12s ease, opacity 0.15s ease

        &:hover:not(:disabled)
            transform: scale(1.1)

        &:disabled
            opacity: 0.55
            cursor: wait

.send-spinner
    width: 14px
    height: 14px
    border-radius: 50%
    border: 2px solid rgba(255, 131, 115, 0.28)
    border-top-color: $color-text-special
    animation: tgb-chat-spin 0.75s linear infinite

.composer-error
    color: #c93b3b
    font-size: 0.8em
    padding: 0 4px

@keyframes tgb-chat-spin
    to
        transform: rotate(360deg)

@keyframes tgb-bubble-highlight
    0%, 100%
        background: var(--tgb-bubble-bg)
        filter: drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0)) drop-shadow(0 0 0 rgba(255, 131, 115, 0))
    25%, 65%
        background: var(--tgb-bubble-highlight-bg)
        box-shadow: none
        filter: drop-shadow(1.5px 0 0 rgba(255, 131, 115, 0.85)) drop-shadow(-1.5px 0 0 rgba(255, 131, 115, 0.85)) drop-shadow(0 1.5px 0 rgba(255, 131, 115, 0.85)) drop-shadow(0 -1.5px 0 rgba(255, 131, 115, 0.85)) drop-shadow(0 0 6px rgba(255, 131, 115, 0.45))

@keyframes tgb-appendix-highlight
    0%, 100%
        fill: var(--tgb-bubble-bg)
    25%, 65%
        fill: var(--tgb-bubble-highlight-bg)

@keyframes tgb-tombstone-highlight
    0%, 100%
        box-shadow: 0 1px 2px rgba(112, 81, 42, 0.12)
    25%, 65%
        box-shadow: 0 0 0 2.5px rgba(255, 131, 115, 0.65), 0 4px 12px rgba(255, 131, 115, 0.2)
</style>
