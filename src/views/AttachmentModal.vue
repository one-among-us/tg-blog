<template>
    <Teleport to="body" v-if="isClient && open && file">
        <div class="tgb-attach-backdrop"
             @click.self="!sending && emit('close')"
             role="dialog"
             aria-modal="true"
             :aria-label="msg.sendPhoto">
            <div class="tgb-attach-modal" @click.stop>
                <div class="modal-header">
                    <div class="header-text">
                        <h3 class="modal-title">{{ msg.sendPhoto }}</h3>
                        <p class="modal-subtitle">
                            {{ file.name }} · {{ formattedSize }}
                        </p>
                    </div>
                    <button type="button"
                            class="close-btn clickable"
                            :disabled="sending"
                            :aria-label="msg.cancel"
                            @click="emit('close')">
                        <i-ep-close />
                    </button>
                </div>

                <div class="preview-box">
                    <img v-if="previewUrl" :src="previewUrl" :alt="file.name" class="preview-img" />
                </div>

                <div class="caption-row">
                    <button ref="smileyBtnEl"
                            type="button"
                            class="caption-smiley-btn"
                            :class="{ active: symbolMenuOpen }"
                            :title="msg.emojiTab"
                            :aria-label="msg.emojiTab"
                            :disabled="sending"
                            @mousedown.prevent
                            @click="toggleSymbolMenu">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                        </svg>
                    </button>
                    <RichCommentInput ref="captionInputRef"
                                      v-model="caption"
                                      class="caption-input"
                                      :placeholder="msg.captionPlaceholder"
                                      :aria-label="msg.captionPlaceholder"
                                      :readonly="sending"
                                      :custom-emoji-urls="customEmojiUrls"
                                      :custom-emoji-alts="customEmojiAlts"
                                      :epoch-emoji-base="epochEmojiBase"
                                      :posts-url="postsUrl"
                                      @submit="handleSend" />
                </div>

                <div v-if="error" class="error-msg">{{ error }}</div>

                <div class="modal-footer">
                    <button type="button"
                            class="btn-cancel"
                            :disabled="sending"
                            @click="emit('close')">
                        {{ msg.cancel }}
                    </button>
                    <button type="button"
                            class="btn-send"
                            :disabled="sending"
                            @click="handleSend">
                        <span v-if="sending" class="send-spinner" aria-hidden="true"></span>
                        <span>{{ sending ? msg.sendingPhoto : msg.sendPhoto }}</span>
                    </button>
                </div>

                <SymbolMenu :open="symbolMenuOpen"
                            :posts-url="postsUrl"
                            :anchor-rect="symbolAnchorRect"
                            :anchor-el="smileyBtnEl"
                            :hide-stickers="true"
                            @select-emoji="e => captionInputRef?.insertEmoji(e)"
                            @select-custom-emoji="ce => captionInputRef?.insertCustomEmoji({ id: ce.id, url: ce.url, alt: ce.alt })"
                            @backspace="() => captionInputRef?.backspaceAtSelection()"
                            @close="symbolMenuOpen = false" />
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {sizeFmt} from '@/logic/formatter'
import {useTgbMessages} from '@/logic/messages'
import RichCommentInput from '@/views/RichCommentInput.vue'
import SymbolMenu from '@/views/SymbolMenu.vue'

const msg = useTgbMessages()

const props = withDefaults(defineProps<{
    open: boolean
    file: File | null
    initialCaption?: string
    sending?: boolean
    error?: string | null
    customEmojiUrls?: Record<string, string>
    customEmojiAlts?: Record<string, string>
    epochEmojiBase?: string | null
    postsUrl?: string
}>(), {
    initialCaption: '',
    sending: false,
    error: null,
    postsUrl: '',
})

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'send', payload: { file: File; caption: string }): void
}>()

const isClient = ref(false)
const caption = ref('')
const previewUrl = ref<string | null>(null)
const symbolMenuOpen = ref(false)
const symbolAnchorRect = ref<{ left: number; top: number; bottom: number; width: number } | null>(null)
const smileyBtnEl = ref<HTMLElement | null>(null)
const captionInputRef = ref<InstanceType<typeof RichCommentInput> | null>(null)

const formattedSize = computed(() => (props.file ? sizeFmt(props.file.size) : ''))

function revokePreview() {
    if (previewUrl.value && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = null
}

function updatePreview() {
    revokePreview()
    if (props.open && props.file && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        previewUrl.value = URL.createObjectURL(props.file)
    }
}

function toggleSymbolMenu() {
    if (symbolMenuOpen.value) {
        symbolMenuOpen.value = false
        return
    }
    const rect = smileyBtnEl.value?.getBoundingClientRect()
    if (rect) {
        symbolAnchorRect.value = {
            left: rect.left,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
        }
    }
    symbolMenuOpen.value = true
}

function handleSend() {
    if (!props.file || props.sending) return
    symbolMenuOpen.value = false
    emit('send', {file: props.file, caption: caption.value.trim()})
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && props.open && !props.sending && !symbolMenuOpen.value) {
        emit('close')
    }
}

watch(() => [props.open, props.file] as const, async ([isOpen]) => {
    updatePreview()
    if (isOpen) {
        caption.value = props.initialCaption ?? ''
        symbolMenuOpen.value = false
        await nextTick()
        captionInputRef.value?.focus()
    } else {
        symbolMenuOpen.value = false
    }
}, {immediate: true})

onMounted(() => {
    isClient.value = true
    if (typeof document !== 'undefined') {
        document.addEventListener('keydown', onKeydown)
    }
})

onUnmounted(() => {
    revokePreview()
    if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', onKeydown)
    }
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.tgb-attach-backdrop
    position: fixed
    inset: 0
    z-index: 1000001
    background: rgba(34, 24, 14, 0.54)
    backdrop-filter: blur(4px)
    display: flex
    align-items: center
    justify-content: center
    padding: 16px

.tgb-attach-modal
    width: 100%
    max-width: 420px
    background: $color-bg-card
    color: $color-text-main
    border-radius: 20px
    padding: 18px 20px
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25)
    box-sizing: border-box
    display: flex
    flex-direction: column
    gap: 12px

.modal-header
    display: flex
    align-items: flex-start
    justify-content: space-between
    gap: 12px

    .header-text
        min-width: 0

    .modal-title
        margin: 0
        font-size: 1.08em
        font-weight: 700
        color: $color-text-main

    .modal-subtitle
        margin: 2px 0 0
        font-size: 0.8em
        color: $color-text-light
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

    .close-btn
        background: transparent
        border: none
        color: $color-text-light
        padding: 4px
        border-radius: 8px
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 1.15em
        flex-shrink: 0
        cursor: pointer
        transition: background 0.15s ease, color 0.15s ease

        &:hover:not(:disabled)
            background: rgba(112, 81, 42, 0.08)
            color: $color-text-main

.preview-box
    display: flex
    align-items: center
    justify-content: center
    background: rgba(112, 81, 42, 0.06)
    border-radius: 14px
    overflow: hidden
    max-height: 280px

.preview-img
    max-width: 100%
    max-height: 280px
    object-fit: contain
    display: block

.caption-row
    position: relative
    display: flex
    align-items: center

.caption-smiley-btn
    position: absolute
    left: 8px
    bottom: 7px
    z-index: 2
    width: 26px
    height: 26px
    padding: 0
    border: none
    border-radius: 50%
    background: transparent
    color: $color-text-light
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    transition: color 0.14s ease, background-color 0.14s ease

    svg
        width: 19px
        height: 19px

    &:hover:not(:disabled), &.active
        color: $color-text-special
        background: rgba(255, 131, 115, 0.12)

.caption-input
    --tgb-rich-pad-left: 38px
    --tgb-rich-pad-right: 12px

.error-msg
    color: #c93b3b
    font-size: 0.82em

.modal-footer
    display: flex
    justify-content: flex-end
    gap: 8px

.btn-cancel
    padding: 8px 14px
    border-radius: 10px
    border: 1px solid rgba(112, 81, 42, 0.16)
    background: transparent
    color: $color-text-main
    font-family: inherit
    font-size: 0.88em
    font-weight: 600
    cursor: pointer
    transition: background-color 0.15s ease

    &:hover:not(:disabled)
        background: rgba(112, 81, 42, 0.06)

.btn-send
    display: inline-flex
    align-items: center
    gap: 6px
    padding: 8px 16px
    border-radius: 10px
    border: none
    background: $color-text-special
    color: #fff
    font-family: inherit
    font-size: 0.88em
    font-weight: 600
    cursor: pointer
    transition: opacity 0.15s ease, transform 0.12s ease

    &:hover:not(:disabled)
        opacity: 0.92

    &:disabled
        opacity: 0.55
        cursor: wait

.send-spinner
    width: 13px
    height: 13px
    border-radius: 50%
    border: 2px solid rgba(255, 255, 255, 0.35)
    border-top-color: #fff
    animation: tgb-attach-spin 0.75s linear infinite

@keyframes tgb-attach-spin
    to
        transform: rotate(360deg)
</style>
