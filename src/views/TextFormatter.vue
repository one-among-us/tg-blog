<template>
    <Teleport to="body" v-if="isClient && open">
        <div class="tgb-tf-backdrop"
             @pointerdown.self="backdropArmed = true"
             @click.self="onBackdropClick"
             @contextmenu.prevent="close" />
        <div ref="toolbarEl"
             class="TextFormatter"
             :class="{ 'link-control-shown': linkControlOpen }"
             :style="floatingStyle"
             role="toolbar"
             :aria-label="msg.formatToolbarLabel"
             @click.stop>
            <div class="tf-buttons" @mousedown.prevent>
                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.blockquote }"
                            :title="msg.formatBlockquote"
                            :aria-label="msg.formatBlockquote"
                            @click="emit('toggle-format', 'blockquote')">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                        </svg>
                    </button>
                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.spoiler }"
                            :disabled="isInlineDisabled('spoiler')"
                            :title="`${msg.formatSpoiler} (Ctrl+Shift+P)`"
                            :aria-label="msg.formatSpoiler"
                            @click="emit('toggle-format', 'spoiler')">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 11.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5z"/>
                            <path fill="currentColor" d="M3 4.27L4.28 3 20 18.72 18.73 20z"/>
                        </svg>
                    </button>

                    <div class="tf-divider" />

                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.bold }"
                            :disabled="isInlineDisabled('bold')"
                            :title="`${msg.formatBold} (Ctrl+B)`"
                            :aria-label="msg.formatBold"
                            @click="emit('toggle-format', 'bold')">
                        <span class="tf-glyph tf-bold">B</span>
                    </button>
                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.italic }"
                            :disabled="isInlineDisabled('italic')"
                            :title="`${msg.formatItalic} (Ctrl+I)`"
                            :aria-label="msg.formatItalic"
                            @click="emit('toggle-format', 'italic')">
                        <span class="tf-glyph tf-italic">I</span>
                    </button>
                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.underline }"
                            :disabled="isInlineDisabled('underline')"
                            :title="`${msg.formatUnderline} (Ctrl+U)`"
                            :aria-label="msg.formatUnderline"
                            @click="emit('toggle-format', 'underline')">
                        <span class="tf-glyph tf-underline">U</span>
                    </button>
                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.strikethrough }"
                            :disabled="isInlineDisabled('strikethrough')"
                            :title="`${msg.formatStrikethrough} (Ctrl+Shift+X)`"
                            :aria-label="msg.formatStrikethrough"
                            @click="emit('toggle-format', 'strikethrough')">
                        <span class="tf-glyph tf-strike">S</span>
                    </button>
                    <button type="button"
                            class="tf-btn"
                            :class="{ active: activeFormats.monospace }"
                            :title="`${msg.formatMonospace} (Ctrl+Shift+M)`"
                            :aria-label="msg.formatMonospace"
                            @click="emit('toggle-format', 'monospace')">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                        </svg>
                    </button>

                    <div class="tf-divider" />

                    <button type="button"
                            class="tf-btn"
                            :class="{ active: !!activeFormats.linkHref }"
                            :title="`${msg.formatLink} (Ctrl+K)`"
                            :aria-label="msg.formatLink"
                            @click="openLinkControl">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                        </svg>
                    </button>

                    <div class="tf-divider" />

                    <button type="button"
                            class="tf-btn"
                            :disabled="!activeFormats.hasFormatting"
                            :title="msg.formatClear"
                            :aria-label="msg.formatClear"
                            @click="emit('clear-formatting')">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/>
                        </svg>
                    </button>
                </div>

                <!-- Inline URL Input Bar (Web A linkControl overlay) -->
                <div class="tf-link-control" :aria-hidden="!linkControlOpen">
                    <button type="button"
                            class="tf-btn"
                            :title="msg.cancel"
                            :aria-label="msg.cancel"
                            @mousedown.prevent
                            @click="closeLinkControl">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                    </button>
                    <input ref="linkInputEl"
                           v-model="linkUrl"
                           type="url"
                           inputmode="url"
                           class="tf-link-input"
                           :placeholder="msg.formatLinkPlaceholder"
                           :aria-label="msg.formatLinkPlaceholder"
                           :tabindex="linkControlOpen ? 0 : -1"
                           @keydown.enter.prevent="confirmLink"
                           @keydown.esc.prevent.stop="closeLinkControl" />
                    <button type="button"
                            class="tf-btn confirm"
                            :disabled="!canSubmitLink"
                            :title="msg.apply"
                            :aria-label="msg.apply"
                            @mousedown.prevent
                            @click="confirmLink">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </button>
                </div>
            </div>
    </Teleport>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {clampFloatingPlacement, createFloatingPositionController} from '@/logic/floatingPosition'
import {useTgbMessages} from '@/logic/messages'

export type FormatterFormatKey =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'monospace'
    | 'spoiler'
    | 'blockquote'

export interface ActiveFormatState {
    bold: boolean
    italic: boolean
    underline: boolean
    strikethrough: boolean
    monospace: boolean
    spoiler: boolean
    blockquote: boolean
    linkHref?: string
    hasFormatting: boolean
}

const msg = useTgbMessages()

const props = defineProps<{
    open: boolean
    anchor: { x: number; y: number }
    anchorEl?: HTMLElement | null
    activeFormats: ActiveFormatState
    initialLinkOpen?: boolean
}>()

const emit = defineEmits<{
    (e: 'toggle-format', format: FormatterFormatKey): void
    (e: 'apply-link', url: string): void
    (e: 'clear-formatting'): void
    (e: 'link-open-change', isOpen: boolean): void
    (e: 'close'): void
}>()

const isClient = ref(false)
const toolbarEl = ref<HTMLElement | null>(null)
const linkInputEl = ref<HTMLInputElement | null>(null)
const linkControlOpen = ref(false)
const linkUrl = ref('')
const backdropArmed = ref(false)
const pos = ref({left: 0, top: 0})

const canSubmitLink = computed(() => {
    return !!linkUrl.value.trim() || props.activeFormats.linkHref !== undefined
})

const floatingStyle = computed(() => ({
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
}))

function isInlineDisabled(key: FormatterFormatKey): boolean {
    if (props.activeFormats[key]) return false
    return props.activeFormats.monospace
}

const positionController = createFloatingPositionController({
    getFloatingEl: () => toolbarEl.value,
    getAnchorEl: () => props.anchorEl,
    positionMode: 'absolute',
    computeBasePosition: (delta) => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const margin = 10
        const el = toolbarEl.value
        const width = el?.offsetWidth || 340
        const height = el?.offsetHeight || 46
        const ax = props.anchor.x + delta.dx
        const ay = props.anchor.y + delta.dy

        return clampFloatingPlacement({
            desiredLeft: ax - width / 2,
            aboveTop: ay - height - 10,
            belowTop: ay + 14,
            width,
            height,
            viewportWidth: vw,
            viewportHeight: vh,
            margin,
        })
    },
    onPositionChange: (nextPos) => {
        pos.value = nextPos
    },
})

async function openLinkControl() {
    linkUrl.value = props.activeFormats.linkHref ?? ''
    linkControlOpen.value = true
    emit('link-open-change', true)
    await nextTick()
    linkInputEl.value?.focus()
    linkInputEl.value?.select()
}

function closeLinkControl() {
    linkControlOpen.value = false
    linkUrl.value = ''
    emit('link-open-change', false)
}

function normalizeUrlInput(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    if (/^(?:https?|mailto):/i.test(trimmed)) return trimmed
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return ''
    return `https://${trimmed}`
}

function confirmLink() {
    const raw = linkUrl.value.trim()
    const normalized = raw ? normalizeUrlInput(raw) : ''
    if (raw && !normalized) return
    emit('apply-link', normalized)
    closeLinkControl()
    emit('close')
}

function close() {
    backdropArmed.value = false
    if (linkControlOpen.value) {
        closeLinkControl()
    }
    emit('close')
}

function onBackdropClick(e: MouseEvent) {
    if (backdropArmed.value || e.detail === 0) {
        close()
    }
    backdropArmed.value = false
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        e.stopPropagation()
        if (linkControlOpen.value) {
            closeLinkControl()
        } else {
            close()
        }
    }
}

let keyListenerAttached = false

function detachListeners() {
    positionController.detach()
    if (!keyListenerAttached || typeof document === 'undefined') return
    document.removeEventListener('keydown', onKeydown)
    keyListenerAttached = false
}

watch(() => isClient.value && props.open, async (active) => {
    backdropArmed.value = false
    if (active) {
        if (props.initialLinkOpen) {
            void openLinkControl()
        } else {
            linkControlOpen.value = false
            linkUrl.value = ''
            emit('link-open-change', false)
        }
        await nextTick()
        positionController.updateBase()
        positionController.attach()
        if (typeof document !== 'undefined' && !keyListenerAttached) {
            document.addEventListener('keydown', onKeydown)
            keyListenerAttached = true
        }
    } else {
        linkControlOpen.value = false
        emit('link-open-change', false)
        detachListeners()
    }
}, {immediate: true})

watch([() => props.anchor, () => props.anchorEl], () => {
    if (isClient.value && props.open) positionController.updateBase()
}, {deep: true})

watch(() => props.initialLinkOpen, (openLink) => {
    if (isClient.value && props.open && openLink && !linkControlOpen.value) {
        void openLinkControl()
    }
})

onMounted(() => {
    isClient.value = true
})

onUnmounted(() => {
    detachListeners()
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.tgb-tf-backdrop
    position: fixed
    inset: 0
    z-index: 1000010
    background: transparent

.TextFormatter
    position: absolute
    z-index: 1000011
    max-width: calc(100vw - 20px)
    height: 44px
    padding: 5px 6px
    border-radius: 14px
    background: rgba(253, 249, 241, 0.96)
    backdrop-filter: blur(20px)
    -webkit-backdrop-filter: blur(20px)
    border: 1px solid rgba(112, 81, 42, 0.14)
    box-shadow: 0 6px 20px rgba(112, 81, 42, 0.18), 0 1px 3px rgba(112, 81, 42, 0.1)
    box-sizing: border-box
    display: flex
    align-items: center
    overflow: hidden
    animation: tgb-tf-appear 0.14s cubic-bezier(0.22, 1, 0.36, 1) both

.tf-buttons
    display: flex
    flex-wrap: nowrap
    align-items: center
    overflow-x: auto
    overflow-y: hidden
    height: 32px
    scrollbar-width: none

    &::-webkit-scrollbar
        display: none

.tf-divider
    width: 1px
    height: 22px
    margin: 0 4px
    background: rgba(112, 81, 42, 0.16)
    flex-shrink: 0

.tf-btn
    flex-shrink: 0
    width: 30px
    height: 30px
    margin: 0 1px
    padding: 0
    border: none
    border-radius: 8px
    background: transparent
    color: $color-text-main
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    font-family: inherit
    transition: background-color 0.14s ease, color 0.14s ease, opacity 0.14s ease

    svg
        width: 18px
        height: 18px

    &:hover:not(:disabled)
        background: rgba(255, 131, 115, 0.16)
        color: $color-text-special-dark

    &.active
        background: $color-text-special
        color: #ffffff

        &:hover:not(:disabled)
            background: $color-text-special
            color: #ffffff

    &:disabled
        opacity: 0.36
        cursor: default

    &.confirm:not(:disabled)
        color: $color-text-special-dark

        &:hover
            background: $color-text-special
            color: #ffffff

.tf-glyph
    font-size: 15px
    line-height: 1
    user-select: none

    &.tf-bold
        font-weight: 800

    &.tf-italic
        font-family: Georgia, serif
        font-style: italic
        font-weight: 600

    &.tf-underline
        text-decoration: underline
        font-weight: 600

    &.tf-strike
        text-decoration: line-through
        font-weight: 600

.tf-link-control
    position: absolute
    inset: 0
    padding: 5px 6px
    background: rgba(253, 249, 241, 0.99)
    display: flex
    align-items: center
    gap: 4px
    opacity: 0
    pointer-events: none
    transition: opacity 0.18s ease

.TextFormatter.link-control-shown .tf-link-control
    opacity: 1
    pointer-events: auto

.tf-link-input
    flex: 1
    min-width: 120px
    height: 30px
    padding: 0 8px
    border: none
    border-radius: 8px
    background: rgba(112, 81, 42, 0.06)
    color: $color-text-main
    font-size: 13px
    font-family: inherit
    outline: none

    &::placeholder
        color: $color-text-light

@keyframes tgb-tf-appear
    from
        opacity: 0
        transform: scale(0.94) translateY(4px)
    to
        opacity: 1
        transform: scale(1) translateY(0)
</style>
