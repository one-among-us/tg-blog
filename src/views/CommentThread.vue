<template>
    <div v-if="ctx && activeApi" class="comment-thread" @click.stop>
        <!-- Loading / Error / Empty states -->
        <div v-if="loading" class="thread-status">{{ msg.loadingComments }}</div>
        <div v-else-if="loadError" class="thread-status error">
            <span>{{ msg.commentsLoadFailed }}</span>
            <button type="button" class="link-btn" @click="fetchComments">{{ msg.retry }}</button>
        </div>

        <!-- Comments list -->
        <div v-else-if="displayComments.length > 0" class="comment-list">
            <div v-for="item in displayComments" :key="item.comment.id"
                 class="comment-item"
                 :class="{
                     'is-reply': item.isReply,
                     'is-deleted': item.comment.deleted,
                     'is-owner': item.comment.author?.role === 'owner'
                 }">
                <template v-if="item.comment.deleted">
                    <div class="tombstone">{{ msg.commentDeleted }}</div>
                </template>
                <template v-else>
                    <div class="comment-header">
                        <div class="author-meta">
                            <img v-if="safeAvatar(item.comment.author.avatar_url)"
                                 :src="safeAvatar(item.comment.author.avatar_url)!"
                                 referrerpolicy="no-referrer"
                                 class="avatar" alt="" loading="lazy"/>
                            <span v-else class="avatar avatar-fallback" :class="avatarClass(item.comment)">
                                {{ avatarInitial(item.comment.author.display_name) }}
                            </span>
                            <span class="author-name" :class="{ muted: isAnonymous(item.comment) }">
                                {{ item.comment.author.display_name }}
                            </span>

                            <!-- Badges -->
                            <span v-if="item.comment.author.role === 'owner'" class="badge badge-owner">
                                {{ msg.badgeOwner }}
                            </span>
                            <span v-if="isTelegramSynced(item.comment)" class="badge badge-telegram"
                                  :title="msg.badgeTelegram">
                                <svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                </svg>
                                {{ msg.badgeTelegram }}
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
                                <span v-if="item.comment.author.role !== 'owner'">{{ msg.badgeVerified }}</span>
                            </span>
                            <span v-else class="badge badge-anon">
                                {{ msg.badgeAnonymous }}
                            </span>
                        </div>
                        <span class="comment-date">{{ formatDate(item.comment.created_at) }}</span>
                    </div>

                    <div v-if="item.parentAuthorName" class="reply-ref">
                        {{ msg.replyingTo(item.parentAuthorName) }}
                    </div>

                    <div class="comment-body" v-html="renderBody(item.comment)"></div>

                    <div class="comment-actions">
                        <button v-if="canCompose" type="button" class="action-btn" @click="startReply(item.comment)">
                            {{ msg.reply }}
                        </button>
                        <button v-if="item.comment.can_delete || me?.role === 'owner'" type="button"
                                class="action-btn danger"
                                :disabled="deletingId === item.comment.id"
                                @click="handleDeleteClick(item.comment)">
                            {{ confirmDeleteId === item.comment.id ? msg.confirmDelete : msg.deleteComment }}
                        </button>
                    </div>
                </template>
            </div>
        </div>
        <div v-else class="thread-status empty">{{ msg.noComments }}</div>

        <!-- Composer -->
        <div class="composer">
            <!-- User bar when signed in -->
            <div v-if="me" class="user-bar">
                <div class="user-pill">
                    <img v-if="safeAvatar(me.avatar_url)" :src="safeAvatar(me.avatar_url)!"
                         referrerpolicy="no-referrer" class="avatar sm" alt=""/>
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
                        <input type="checkbox" v-model="asAnonymous"/>
                        <span>{{ msg.commentAsAnonymous }}</span>
                    </label>
                    <button type="button" class="chip-btn subtle" @click="handleLogout">
                        {{ msg.signOut }}
                    </button>
                </div>
            </div>

            <!-- Signed-out header -->
            <div v-else class="guest-bar">
                <button type="button" class="signin-btn" @click="ctx.openAuthModal()">
                    {{ msg.signIn }}
                </button>
                <span v-if="allowAnon" class="guest-hint">{{ msg.commentingAnonymously }}</span>
                <span v-else class="guest-hint">{{ msg.signInToComment }}</span>
            </div>

            <!-- Reply composer form -->
            <form v-if="canCompose" class="composer-form" @submit.prevent="submitComment">
                <div v-if="replyTarget" class="reply-banner">
                    <span>{{ msg.replyingTo(replyTarget.author.display_name) }}</span>
                    <button type="button" class="cancel-reply-btn" @click="replyTarget = null">
                        {{ msg.cancelReply }}
                    </button>
                </div>

                <textarea ref="textareaEl" v-model="draft" rows="2" maxlength="4000"
                          class="composer-input"
                          :placeholder="msg.writeCommentPlaceholder"
                          :disabled="submitting"
                          @keydown="onComposerKeydown"></textarea>

                <AltchaWidget v-if="needsAltcha" ref="altchaRef" :api="activeApi" v-model="altchaPayload"/>

                <div v-if="submitError" class="composer-error">{{ submitError }}</div>

                <div class="composer-footer">
                    <span class="char-count" v-if="draft.length > 3200">{{ draft.length }}/4000</span>
                    <span class="f-grow1"></span>
                    <button type="submit" class="send-btn" :disabled="!canSubmit">
                        {{ submitting ? msg.postingComment : msg.postComment }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts" setup>
import moment from 'moment'
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {CommentDTO} from '@/logic/models'
import {sanitizeCommentHtml} from '@/logic/api'
import {applyCommentDeleteInList, upsertCommentInList} from '@/logic/state'
import {useTgbInteractive} from '@/logic/interactive'
import {useTgbMessages} from '@/logic/messages'
import {sanitizeAvatarUrl} from '@/logic/url'
import AltchaWidget from '@/views/AltchaWidget.vue'

const msg = useTgbMessages()
const ctx = useTgbInteractive()

const props = defineProps<{
    postId: number
}>()

const comments = ref<CommentDTO[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)

const draft = ref('')
const replyTarget = ref<CommentDTO | null>(null)
const asAnonymous = ref(false)
const altchaPayload = ref<string | null>(null)
const altchaRef = ref<InstanceType<typeof AltchaWidget> | null>(null)
const textareaEl = ref<HTMLTextAreaElement | null>(null)
const submitting = ref(false)
const submitError = ref<string | null>(null)

const confirmDeleteId = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null
const deletingId = ref<number | null>(null)
const togglingNotify = ref(false)

const activeApi = computed(() => ctx?.api.value ?? null)
const me = computed(() => ctx?.me.value ?? null)
const allowAnon = computed(() => ctx?.allowAnonComments.value ?? false)
const isPostingAnon = computed(() => !me.value || (allowAnon.value && asAnonymous.value))
const canCompose = computed(() => !!me.value || allowAnon.value)
const needsAltcha = computed(() => canCompose.value && isPostingAnon.value)
const canSubmit = computed(() => {
    if (!activeApi.value || submitting.value) return false
    if (!draft.value.trim()) return false
    if (needsAltcha.value && !altchaPayload.value) return false
    return true
})

watch(me, (newMe) => {
    if (!newMe) asAnonymous.value = false
})

watch(needsAltcha, (needed) => {
    if (!needed) {
        altchaPayload.value = null
    }
})

watch(activeApi, (nextApi) => {
    if (nextApi) {
        void fetchComments()
    }
})

interface DisplayComment {
    comment: CommentDTO
    isReply: boolean
    parentAuthorName: string | null
}

const displayComments = computed((): DisplayComment[] => {
    const list = comments.value
    if (!list.length) return []
    const byId = new Map<number, CommentDTO>()
    for (const c of list) byId.set(c.id, c)

    function getRootId(c: CommentDTO): number {
        let cur: CommentDTO | undefined = c
        const visited = new Set<number>([c.id])
        while (cur?.parent_id != null && byId.has(cur.parent_id) && !visited.has(cur.parent_id)) {
            visited.add(cur.parent_id)
            cur = byId.get(cur.parent_id)
        }
        return cur ? cur.id : c.id
    }

    const roots: CommentDTO[] = []
    const repliesByRoot = new Map<number, CommentDTO[]>()

    for (const c of list) {
        if (c.parent_id == null || !byId.has(c.parent_id)) {
            roots.push(c)
        } else {
            const rootId = getRootId(c)
            const bucket = repliesByRoot.get(rootId)
            if (bucket) bucket.push(c)
            else repliesByRoot.set(rootId, [c])
        }
    }

    const out: DisplayComment[] = []
    for (const root of roots) {
        const orphanParent = root.parent_id != null ? byId.get(root.parent_id) : undefined
        out.push({
            comment: root,
            isReply: false,
            parentAuthorName: orphanParent ? orphanParent.author.display_name : null,
        })
        const replies = repliesByRoot.get(root.id)
        if (replies) {
            for (const r of replies) {
                const parent = r.parent_id != null ? byId.get(r.parent_id) : undefined
                out.push({
                    comment: r,
                    isReply: true,
                    parentAuthorName: parent && !parent.deleted ? parent.author.display_name : null,
                })
            }
        }
    }
    return out
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

function formatDate(iso: string): string {
    return moment(iso).format(msg.dateFormat)
}

function renderBody(c: CommentDTO): string {
    return sanitizeCommentHtml(c.body_html, c.body_text)
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
    comments.value = applyCommentDeleteInList(comments.value, commentId)
}

function startReply(comment: CommentDTO) {
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
        const created = await activeApi.value.createComment(props.postId, {
            body: draft.value.trim(),
            parent_id: replyTarget.value?.id ?? null,
            as_anonymous: isPostingAnon.value,
            altcha_payload: needsAltcha.value ? altchaPayload.value : null,
        })
        upsertComment(created)
        ctx.notifyLocalCommentCreated(created)
        draft.value = ''
        replyTarget.value = null
        if (needsAltcha.value) {
            altchaPayload.value = null
            altchaRef.value?.reset()
        }
    } catch (err: any) {
        submitError.value = err?.message || 'Failed to post comment'
        if (needsAltcha.value) {
            altchaPayload.value = null
            altchaRef.value?.reset()
        }
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
    if (!ctx) return
    void fetchComments()
    unsubscribe = ctx.subscribeComments(props.postId, {
        onCreated: (c) => upsertComment(c),
        onDeleted: (ev) => applyDelete(ev.comment_id),
        onAuthChanged: () => { void fetchComments() },
    })
})

onUnmounted(() => {
    unsubscribe?.()
    if (confirmTimer) clearTimeout(confirmTimer)
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.comment-thread
    margin-top: 8px
    padding-top: 10px
    border-top: 1px dashed rgba(112, 81, 42, 0.16)
    font-size: 0.9em

.thread-status
    padding: 8px 4px
    font-size: 0.88em
    color: $color-text-light
    display: flex
    align-items: center
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

.comment-list
    display: flex
    flex-direction: column
    gap: 8px
    margin-bottom: 10px

.comment-item
    padding: 8px 10px
    border-radius: 10px
    background: rgba(112, 81, 42, 0.04)
    border: 1px solid rgba(112, 81, 42, 0.06)

    &.is-owner
        background: rgba(255, 131, 115, 0.07)
        border-color: rgba(255, 131, 115, 0.18)

    &.is-reply
        margin-left: 16px
        border-left: 2.5px solid rgba(255, 131, 115, 0.45)

    &.is-deleted
        padding: 5px 10px
        background: transparent
        border-style: dashed

.tombstone
    font-style: italic
    font-size: 0.86em
    color: $color-text-light

.comment-header
    display: flex
    align-items: center
    justify-content: space-between
    gap: 6px
    flex-wrap: wrap
    margin-bottom: 4px

.author-meta
    display: flex
    align-items: center
    gap: 5px
    flex-wrap: wrap
    min-width: 0

.avatar
    width: 20px
    height: 20px
    border-radius: 50%
    object-fit: cover
    flex-shrink: 0

    &.sm
        width: 18px
        height: 18px

.avatar-fallback
    display: inline-flex
    align-items: center
    justify-content: center
    background: rgba(112, 81, 42, 0.15)
    color: $color-text-main
    font-size: 0.72em
    font-weight: 700

    &.owner
        background: $color-text-special
        color: #fff

    &.telegram
        background: rgba(36, 161, 222, 0.18)
        color: #1c88be

    &.anon
        background: rgba(112, 81, 42, 0.1)
        color: $color-text-light

.author-name
    font-weight: 600
    font-size: 0.92em
    color: $color-text-main
    word-break: break-word

    &.muted
        font-weight: 500
        color: $color-text-light

.badge
    display: inline-flex
    align-items: center
    gap: 3px
    padding: 1px 6px
    border-radius: 999px
    font-size: 0.72em
    font-weight: 600
    line-height: 1.4
    user-select: none

    .badge-svg
        width: 10px
        height: 10px

.badge-owner
    background: $color-text-special
    color: #fff

.badge-verified
    background: rgba(47, 158, 68, 0.12)
    color: #2b8a3e

.badge-telegram
    background: rgba(36, 161, 222, 0.13)
    color: #1982b8

.badge-anon
    background: rgba(112, 81, 42, 0.08)
    color: $color-text-light
    font-weight: 500

.comment-date
    font-size: 0.78em
    color: $color-text-light
    white-space: nowrap

.reply-ref
    font-size: 0.78em
    color: $color-text-special-dark
    margin-bottom: 3px
    opacity: 0.85

.comment-body
    font-size: 0.94em
    line-height: 1.45
    overflow-wrap: anywhere
    color: $color-text-main

    :deep(p)
        margin: 2px 0

    :deep(a)
        color: $color-text-special
        text-decoration: underline

    :deep(code)
        background: rgba(0, 0, 0, 0.05)
        padding: 1px 4px
        border-radius: 4px
        font-size: 0.9em

    :deep(blockquote)
        margin: 4px 0
        padding: 2px 8px
        font-size: 0.92em

.comment-actions
    display: flex
    align-items: center
    gap: 10px
    margin-top: 4px

.action-btn
    background: none
    border: none
    padding: 0
    font-size: 0.78em
    font-family: inherit
    color: $color-text-light
    cursor: pointer
    transition: color 0.15s ease

    &:hover
        color: $color-text-special

    &.danger:hover
        color: #c93b3b

    &:disabled
        opacity: 0.5
        cursor: wait

.composer
    display: flex
    flex-direction: column
    gap: 8px

.user-bar, .guest-bar
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: 6px

.user-pill
    display: inline-flex
    align-items: center
    gap: 6px
    font-size: 0.85em
    font-weight: 600
    color: $color-text-main

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
    background: rgba(112, 81, 42, 0.07)
    border: 1px solid rgba(112, 81, 42, 0.12)
    border-radius: 999px
    padding: 2px 8px
    font-size: 0.76em
    font-family: inherit
    color: $color-text-main
    cursor: pointer
    transition: background 0.15s ease, border-color 0.15s ease

    &.active
        background: rgba(255, 131, 115, 0.14)
        border-color: rgba(255, 131, 115, 0.4)
        color: $color-text-special-dark

    &.subtle
        color: $color-text-light

    &:hover:not(:disabled)
        background: rgba(112, 81, 42, 0.12)

.signin-btn
    background: $color-bg-5
    border: 1px solid rgba(255, 131, 115, 0.45)
    color: $color-text-special-dark
    border-radius: 999px
    padding: 4px 12px
    font-size: 0.82em
    font-weight: 600
    font-family: inherit
    cursor: pointer
    transition: background 0.15s ease, border-color 0.15s ease

    &:hover
        background: $color-bg-6
        border-color: $color-text-special

.guest-hint
    font-size: 0.8em
    color: $color-text-light

.composer-form
    display: flex
    flex-direction: column
    gap: 7px

.reply-banner
    display: flex
    align-items: center
    justify-content: space-between
    padding: 4px 9px
    border-radius: 8px
    background: rgba(255, 131, 115, 0.12)
    color: $color-text-special-dark
    font-size: 0.8em

.cancel-reply-btn
    background: none
    border: none
    color: inherit
    font-size: inherit
    font-weight: 600
    cursor: pointer
    padding: 0 2px

.composer-input
    width: 100%
    box-sizing: border-box
    resize: vertical
    min-height: 54px
    max-height: 180px
    padding: 8px 10px
    border-radius: 10px
    border: 1px solid rgba(112, 81, 42, 0.18)
    background: $color-bg-4
    color: $color-text-main
    font-family: inherit
    font-size: 0.92em
    line-height: 1.45
    transition: border-color 0.18s ease

    &::placeholder
        color: $color-text-light

    &:focus
        outline: none
        border-color: $color-text-special

.composer-error
    color: #c93b3b
    font-size: 0.8em

.composer-footer
    display: flex
    align-items: center
    gap: 8px

.char-count
    font-size: 0.76em
    color: $color-text-light

.send-btn
    background: $color-text-special
    color: #fff
    border: none
    border-radius: 999px
    padding: 5px 14px
    font-size: 0.84em
    font-weight: 600
    font-family: inherit
    cursor: pointer
    transition: opacity 0.15s ease, transform 0.12s ease

    &:hover:not(:disabled)
        opacity: 0.92
        transform: translateY(-1px)

    &:disabled
        opacity: 0.45
        cursor: not-allowed
</style>
