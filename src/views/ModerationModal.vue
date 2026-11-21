<template>
    <Teleport to="body" v-if="isClient && open">
        <div class="tgb-mod-backdrop" @click.self="emit('close')" role="dialog" aria-modal="true" :aria-label="msg.reviewModalTitle">
            <div class="tgb-mod-modal">
                <div class="modal-header">
                    <div class="header-tabs">
                        <h3 class="modal-title">{{ msg.reviewModalTitle }}</h3>
                        <div class="tab-pills">
                            <button type="button"
                                    class="tab-pill clickable"
                                    :class="{ active: activeTab === 'pending' }"
                                    @click="activeTab = 'pending'">
                                {{ msg.reviewTabPending }} ({{ comments.length }})
                            </button>
                            <button type="button"
                                    class="tab-pill clickable"
                                    :class="{ active: activeTab === 'whitelist' }"
                                    @click="activeTab = 'whitelist'">
                                {{ msg.reviewTabWhitelist }} ({{ whitelist.length }})
                            </button>
                        </div>
                    </div>
                    <button type="button" class="close-btn clickable" @click="emit('close')" :aria-label="msg.authClose">
                        <i-ep-close />
                    </button>
                </div>

                <div class="modal-body">
                    <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

                    <div v-if="loading" class="status-state">
                        <span class="loading-spinner" aria-hidden="true"></span>
                    </div>

                    <template v-else-if="activeTab === 'pending'">
                        <div v-if="comments.length === 0" class="empty-state">
                            {{ msg.reviewEmpty }}
                        </div>
                        <div v-else class="pending-list">
                            <div v-for="c in comments"
                                 :key="c.id"
                                 class="pending-card"
                                 :class="{ focused: focusCommentId === c.id }">
                                <div class="pending-meta-row">
                                    <span class="sender-name">{{ c.author.display_name }}</span>
                                    <span class="badge-tag">{{ c.author.verified ? (c.author.provider || 'verified') : msg.badgeAnonymous }}</span>
                                    <span v-if="c.sender_whitelisted" class="badge-tag whitelisted">whitelisted</span>
                                    <button type="button" class="post-jump-btn clickable" @click="emit('jump-post', c.post_id)">
                                        {{ msg.reviewOpenPost(c.post_id) }}
                                    </button>
                                    <span class="comment-id-label">#{{ c.id }}</span>
                                </div>

                                <div v-if="reasonSummary(c)" class="reason-line">
                                    {{ reasonSummary(c) }}
                                </div>

                                <div v-if="c.media && (commentMediaThumbUrl(c.media, safeMediaSrc) || commentMediaLabel(c.media))" class="media-preview">
                                    <img v-if="commentMediaThumbUrl(c.media, safeMediaSrc)"
                                         :src="commentMediaThumbUrl(c.media, safeMediaSrc)!"
                                         alt="" />
                                    <span v-else class="media-type-note">
                                        {{ commentMediaLabel(c.media) }}
                                    </span>
                                </div>

                                <div v-if="c.body_text" class="body-preview">{{ c.body_text }}</div>

                                <div class="card-actions">
                                    <button type="button"
                                            class="action-btn approve clickable"
                                            :disabled="busyId === c.id"
                                            @click="handleDecision(c, 'approve', false)">
                                        {{ msg.reviewApprove }}
                                    </button>
                                    <button v-if="c.can_whitelist && !c.sender_whitelisted"
                                            type="button"
                                            class="action-btn whitelist clickable"
                                            :disabled="busyId === c.id"
                                            @click="handleDecision(c, 'approve', true)">
                                        {{ msg.reviewApproveWhitelist }}
                                    </button>
                                    <button type="button"
                                            class="action-btn reject clickable"
                                            :disabled="busyId === c.id"
                                            @click="handleDecision(c, 'reject', false)">
                                        {{ msg.reviewReject }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div v-if="whitelist.length === 0" class="empty-state">
                            {{ msg.reviewWhitelistEmpty }}
                        </div>
                        <div v-else class="whitelist-list">
                            <div v-for="w in whitelist" :key="w.id" class="whitelist-row">
                                <div class="wl-info">
                                    <span class="wl-label">{{ w.label || `${w.kind}:${w.key}` }}</span>
                                    <span class="wl-meta">{{ w.kind }} · {{ w.key }}</span>
                                </div>
                                <button type="button"
                                        class="action-btn reject clickable"
                                        :disabled="busyWhitelistId === w.id"
                                        @click="handleRemoveWhitelist(w.id)">
                                    {{ msg.reviewWhitelistRemove }}
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {LifeApiClient} from '@/logic/api'
import {useTgbMessages} from '@/logic/messages'
import {commentMediaLabel, commentMediaThumbUrl} from '@/logic/messageMedia'
import {ModerationCommentDTO, ModerationWhitelistEntryDTO} from '@/logic/models'
import {resolveApiAssetUrl} from '@/logic/url'

const props = defineProps<{
    open: boolean
    api: LifeApiClient
    focusCommentId?: number | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'updated', pendingCount: number): void
    (e: 'jump-post', postId: number): void
}>()

const msg = useTgbMessages()
const isClient = ref(false)
const activeTab = ref<'pending' | 'whitelist'>('pending')
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const comments = ref<ModerationCommentDTO[]>([])
const whitelist = ref<ModerationWhitelistEntryDTO[]>([])
const busyId = ref<number | null>(null)
const busyWhitelistId = ref<number | null>(null)

function safeMediaSrc(url?: string | null): string {
    if (!url) return ''
    return resolveApiAssetUrl(url, props.api.baseUrl)
}

function reasonSummary(c: ModerationCommentDTO): string {
    const meta = c.moderation_meta
    if (!meta) return ''
    const parts: string[] = []
    if (meta.reason) parts.push(String(meta.reason))
    if (meta.top_category && typeof meta.top_score === 'number' && meta.top_score > 0) {
        parts.push(`${meta.top_category}: ${(meta.top_score * 100).toFixed(0)}%`)
    }
    return parts.join(' · ')
}

async function fetchQueue() {
    loading.value = true
    errorMsg.value = null
    try {
        const res = await props.api.getModerationQueue()
        comments.value = res.comments ?? []
        whitelist.value = res.whitelist ?? []
        emit('updated', res.pending_count ?? comments.value.length)
    } catch (err: any) {
        errorMsg.value = err?.message || 'Failed to load moderation queue'
    } finally {
        loading.value = false
    }
}

async function handleDecision(
    c: ModerationCommentDTO,
    action: 'approve' | 'reject',
    whitelistSender: boolean
) {
    busyId.value = c.id
    errorMsg.value = null
    try {
        await props.api.decideModerationComment(c.id, {
            action,
            whitelist_sender: whitelistSender,
        })
        await fetchQueue()
    } catch (err: any) {
        errorMsg.value = err?.message || 'Action failed'
    } finally {
        busyId.value = null
    }
}

async function handleRemoveWhitelist(entryId: number) {
    busyWhitelistId.value = entryId
    errorMsg.value = null
    try {
        await props.api.removeModerationWhitelist(entryId)
        whitelist.value = whitelist.value.filter(w => w.id !== entryId)
    } catch (err: any) {
        errorMsg.value = err?.message || 'Failed removing whitelist entry'
    } finally {
        busyWhitelistId.value = null
    }
}

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            activeTab.value = 'pending'
            void fetchQueue()
        }
    }
)

onMounted(() => {
    isClient.value = true
    if (props.open) {
        void fetchQueue()
    }
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.tgb-mod-backdrop
    position: fixed
    inset: 0
    z-index: 2100
    background: rgba(34, 24, 16, 0.54)
    backdrop-filter: blur(4px)
    display: flex
    align-items: center
    justify-content: center
    padding: 16px

.tgb-mod-modal
    width: 100%
    max-width: 520px
    max-height: 85vh
    display: flex
    flex-direction: column
    background: $color-bg-5
    color: $color-text-main
    border-radius: 18px
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25)
    overflow: hidden
    border: 1px solid rgba(112, 81, 42, 0.14)

.modal-header
    display: flex
    align-items: flex-start
    justify-content: space-between
    gap: 12px
    padding: 16px 18px 12px
    border-bottom: 1px solid rgba(112, 81, 42, 0.1)

.header-tabs
    display: flex
    flex-direction: column
    gap: 8px

.modal-title
    margin: 0
    font-size: 1.08em
    font-weight: 700

.tab-pills
    display: flex
    gap: 6px

.tab-pill
    border: 1px solid rgba(112, 81, 42, 0.16)
    background: $color-bg-4
    color: $color-text-light
    border-radius: 999px
    padding: 4px 10px
    font-size: 0.8em
    font-weight: 600

    &.active
        background: $color-text-special
        border-color: $color-text-special
        color: #fff

.close-btn
    background: transparent
    border: none
    color: $color-text-light
    padding: 4px
    border-radius: 8px
    display: flex
    align-items: center
    justify-content: center

.modal-body
    padding: 14px 18px 18px
    overflow-y: auto
    display: flex
    flex-direction: column
    gap: 12px

.error-banner
    padding: 8px 12px
    border-radius: 10px
    background: rgba(220, 38, 38, 0.1)
    color: #b91c1c
    font-size: 0.85em

.status-state, .empty-state
    padding: 28px 12px
    text-align: center
    color: $color-text-light
    font-size: 0.9em

.loading-spinner
    display: inline-block
    width: 24px
    height: 24px
    border: 2.5px solid rgba(112, 81, 42, 0.2)
    border-top-color: $color-text-special
    border-radius: 50%
    animation: tgb-mod-spin 0.75s linear infinite

@keyframes tgb-mod-spin
    to
        transform: rotate(360deg)

.pending-list, .whitelist-list
    display: flex
    flex-direction: column
    gap: 10px

.pending-card
    background: $color-bg-4
    border: 1px solid rgba(112, 81, 42, 0.14)
    border-radius: 12px
    padding: 12px
    display: flex
    flex-direction: column
    gap: 8px

    &.focused
        border-color: $color-text-special
        box-shadow: 0 0 0 2px rgba(255, 131, 115, 0.22)

.pending-meta-row
    display: flex
    flex-wrap: wrap
    align-items: center
    gap: 6px
    font-size: 0.82em

.sender-name
    font-weight: 700
    color: $color-text-main

.badge-tag
    padding: 1px 6px
    border-radius: 999px
    background: rgba(112, 81, 42, 0.1)
    color: $color-text-light
    font-size: 0.88em

    &.whitelisted
        background: rgba(16, 185, 129, 0.14)
        color: #047857

.post-jump-btn
    margin-left: auto
    border: none
    background: transparent
    color: $color-text-special
    font-weight: 600
    padding: 0
    font-size: 0.92em

.comment-id-label
    color: $color-text-light
    font-size: 0.88em

.reason-line
    font-size: 0.78em
    font-weight: 600
    color: #b45309
    background: rgba(245, 158, 11, 0.14)
    padding: 3px 8px
    border-radius: 6px
    width: fit-content

.media-preview
    img
        max-width: 100%
        max-height: 220px
        border-radius: 8px
        object-fit: contain
        display: block

.media-type-note
    font-size: 0.82em
    color: $color-text-light

.body-preview
    font-size: 0.92em
    line-height: 1.45
    white-space: pre-wrap
    word-break: break-word
    background: rgba(112, 81, 42, 0.04)
    padding: 8px 10px
    border-radius: 8px

.card-actions
    display: flex
    flex-wrap: wrap
    gap: 6px
    padding-top: 2px

.action-btn
    border: none
    border-radius: 8px
    padding: 6px 10px
    font-size: 0.8em
    font-weight: 600
    cursor: pointer

    &:disabled
        opacity: 0.55
        cursor: not-allowed

    &.approve
        background: rgba(16, 185, 129, 0.16)
        color: #047857

    &.whitelist
        background: rgba(59, 130, 246, 0.14)
        color: #1d4ed8

    &.reject
        background: rgba(239, 68, 68, 0.14)
        color: #b91c1c

.whitelist-row
    display: flex
    align-items: center
    justify-content: space-between
    gap: 10px
    padding: 10px 12px
    background: $color-bg-4
    border: 1px solid rgba(112, 81, 42, 0.12)
    border-radius: 10px

.wl-info
    display: flex
    flex-direction: column
    gap: 2px
    min-width: 0

.wl-label
    font-weight: 600
    font-size: 0.88em
    overflow: hidden
    text-overflow: ellipsis

.wl-meta
    font-size: 0.76em
    color: $color-text-light
</style>
