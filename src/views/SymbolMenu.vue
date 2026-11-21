<template>
    <Teleport to="body" v-if="isClient && open">
        <div class="tgb-symbol-backdrop"
             @pointerdown.self="backdropArmed = true"
             @click.self="onBackdropClick" />
        <div ref="menuEl"
             class="SymbolMenu"
             :style="floatingStyle"
             role="dialog"
             :aria-label="msg.emojiAndStickers"
             @click.stop>
            <div class="SymbolMenu-main">
                    <!-- Emoji Tab -->
                    <div v-if="activeTab === 'emoji'" class="EmojiPicker">
                        <div class="emoji-search-bar">
                            <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <input v-model="searchQuery"
                                   type="search"
                                   class="emoji-search-input"
                                   :placeholder="msg.searchEmojisPlaceholder"
                                   :aria-label="msg.searchEmojisPlaceholder" />
                            <button v-if="searchQuery"
                                    type="button"
                                    class="search-clear-btn"
                                    :aria-label="msg.cancel"
                                    @mousedown.prevent
                                    @click="searchQuery = ''">
                                ✕
                            </button>
                        </div>

                        <!-- Category Quick-Jump Header -->
                        <div v-if="!trimmedQuery" class="emoji-cat-bar" @mousedown.prevent>
                            <button v-if="mergedCustomEmojis.length > 0"
                                    type="button"
                                    class="cat-jump-btn"
                                    :title="msg.siteCustomEmojis"
                                    @click="scrollToSection('custom')">
                                ✨
                            </button>
                            <button v-for="cat in APPLE_EMOJI_CATEGORIES"
                                    :key="cat.id"
                                    type="button"
                                    class="cat-jump-btn"
                                    :title="catTitle(cat)"
                                    @click="scrollToSection(cat.id)">
                                <AppleEmoji :emoji="cat.icon" class="cat-icon-emoji" />
                            </button>
                        </div>

                        <div ref="emojiScrollEl" class="EmojiPicker-main" @mousedown.prevent>
                            <!-- Custom Emojis Section -->
                            <div v-if="filteredCustomEmojis.length > 0"
                                 data-emoji-sec="custom"
                                 class="symbol-set">
                                <div class="symbol-set-header">
                                    <span class="symbol-set-title">{{ msg.siteCustomEmojis }}</span>
                                    <span class="symbol-set-count">{{ filteredCustomEmojis.length }}</span>
                                </div>
                                <div class="symbol-set-grid custom-grid">
                                    <button v-for="ce in filteredCustomEmojis"
                                            :key="ce.id"
                                            type="button"
                                            class="EmojiButton"
                                            :title="ce.alt || ce.id"
                                            @click="emit('select-custom-emoji', ce)">
                                        <CustomEmoji :id="ce.id" :src="ce.url" :alt="ce.alt" :posts-url="postsUrl" />
                                    </button>
                                </div>
                            </div>

                            <!-- Apple Emoji Categories -->
                            <div v-for="cat in filteredCategories"
                                 :key="cat.id"
                                 :data-emoji-sec="cat.id"
                                 class="symbol-set">
                                <div class="symbol-set-header">
                                    <span class="symbol-set-title">{{ catTitle(cat) }}</span>
                                </div>
                                <div class="symbol-set-grid">
                                    <button v-for="item in cat.emojis"
                                            :key="item.emoji"
                                            type="button"
                                            class="EmojiButton"
                                            @click="emit('select-emoji', item.emoji)">
                                        <AppleEmoji :emoji="item.emoji" class="picker-apple-emoji" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Stickers Tab -->
                    <div v-else class="StickerPicker">
                        <div v-if="stickersLoading" class="picker-status">
                            <span class="picker-spinner" aria-hidden="true"></span>
                        </div>
                        <div v-else-if="stickerPacks.length === 0" class="picker-status">
                            {{ msg.noStickersFound }}
                        </div>
                        <div v-else class="StickerPicker-main">
                            <div v-for="pack in stickerPacks" :key="pack.id || pack.name || pack.title" class="symbol-set">
                                <div class="symbol-set-header">
                                    <span class="symbol-set-title">{{ pack.title }}</span>
                                    <span class="symbol-set-count">{{ pack.stickers.length }}</span>
                                </div>
                                <div class="symbol-set-grid sticker-grid">
                                    <button v-for="sticker in pack.stickers"
                                            :key="sticker.id"
                                            type="button"
                                            class="StickerButton"
                                            :title="sticker.emoji || pack.title"
                                            @click="selectSticker(sticker)">
                                        <StickerMedia :url="sticker.url"
                                                      :thumb="sticker.thumb"
                                                      :emoji="sticker.emoji"
                                                      :format="sticker.format"
                                                      :is-animated="sticker.is_animated"
                                                      :is-video="sticker.is_video" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Telegram Web A SymbolMenuFooter -->
                <div class="SymbolMenu-footer" @mousedown.prevent>
                    <div class="footer-tabs">
                        <button type="button"
                                class="symbol-tab-button"
                                :class="{ activated: activeTab === 'emoji' }"
                                :title="msg.emojiTab"
                                :aria-label="msg.emojiTab"
                                @click="switchTab('emoji')">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                            </svg>
                        </button>
                        <button v-if="!hideStickers"
                                type="button"
                                class="symbol-tab-button"
                                :class="{ activated: activeTab === 'stickers' }"
                                :title="msg.stickersTab"
                                :aria-label="msg.stickersTab"
                                @click="switchTab('stickers')">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="currentColor" d="M18.5 2h-13C3.57 2 2 3.57 2 5.5v13C2 20.43 3.57 22 5.5 22H13l9-9V5.5C22 3.57 20.43 2 18.5 2zM13 19.5V15c0-1.1.9-2 2-2h4.5L13 19.5zM18.5 11H15c-2.21 0-4 1.79-4 4v3.5H5.5c-.83 0-1.5-.67-1.5-1.5v-13c0-.83.67-1.5 1.5-1.5h13c.83 0 1.5.67 1.5 1.5V11z"/>
                            </svg>
                        </button>
                    </div>

                    <button v-if="activeTab === 'emoji'"
                            type="button"
                            class="symbol-delete-button"
                            :title="msg.backspace"
                            :aria-label="msg.backspace"
                            @click="emit('backspace')">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
                        </svg>
                    </button>
                </div>
            </div>
    </Teleport>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {APPLE_EMOJI_CATEGORIES, EmojiCatalogCategory} from '@/logic/emojiCatalog'
import {
    clampCenterPlacement,
    clampFloatingPlacement,
    createFloatingPositionController,
} from '@/logic/floatingPosition'
import {useTgbInteractive} from '@/logic/interactive'
import {useTgbMessages} from '@/logic/messages'
import {CustomEmojiAsset, StickerItem} from '@/logic/models'
import {isValidCustomEmojiId} from '@/logic/reactions'
import AppleEmoji from '@/views/AppleEmoji.vue'
import CustomEmoji from '@/views/CustomEmoji.vue'
import StickerMedia from '@/views/StickerMedia.vue'

const msg = useTgbMessages()
const ctx = useTgbInteractive()

const props = withDefaults(defineProps<{
    open: boolean
    postsUrl?: string
    anchorRect?: { left: number; top: number; bottom: number; width: number } | null
    anchorEl?: HTMLElement | null
    hideStickers?: boolean
}>(), {
    postsUrl: '',
    anchorRect: null,
    anchorEl: null,
    hideStickers: false,
})

const emit = defineEmits<{
    (e: 'select-emoji', emoji: string): void
    (e: 'select-custom-emoji', asset: CustomEmojiAsset): void
    (e: 'select-sticker', sticker: StickerItem): void
    (e: 'backspace'): void
    (e: 'close'): void
}>()

const isClient = ref(false)
const activeTab = ref<'emoji' | 'stickers'>('emoji')
const searchQuery = ref('')
const backdropArmed = ref(false)
const menuEl = ref<HTMLElement | null>(null)
const emojiScrollEl = ref<HTMLElement | null>(null)
const pos = ref({left: 10, top: 10})

const trimmedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const mergedCustomEmojis = computed((): CustomEmojiAsset[] => {
    const byId = new Map<string, CustomEmojiAsset>()
    for (const item of ctx?.customEmojiCatalog.value ?? []) {
        if (isValidCustomEmojiId(item.id)) {
            byId.set(item.id, item)
        }
    }
    for (const [id, url] of Object.entries(ctx?.channelCustomEmojis.value ?? {})) {
        if (isValidCustomEmojiId(id) && !byId.has(id)) {
            byId.set(id, {id, url})
        }
    }
    return Array.from(byId.values())
})

const filteredCustomEmojis = computed((): CustomEmojiAsset[] => {
    const q = trimmedQuery.value
    if (!q) return mergedCustomEmojis.value
    return mergedCustomEmojis.value.filter(ce =>
        ce.id.includes(q) || (!!ce.alt && ce.alt.includes(q))
    )
})

const filteredCategories = computed(() => {
    const q = trimmedQuery.value
    if (!q) return APPLE_EMOJI_CATEGORIES
    return APPLE_EMOJI_CATEGORIES
        .map(cat => ({
            ...cat,
            emojis: cat.emojis.filter(e =>
                e.emoji.includes(q) || e.keywords.toLowerCase().includes(q)
            ),
        }))
        .filter(cat => cat.emojis.length > 0)
})

const stickerPacks = computed(() => ctx?.stickerPacks.value ?? [])
const stickersLoading = computed(() => ctx?.stickersLoading.value ?? false)

function catTitle(cat: EmojiCatalogCategory): string {
    // Use zh label when current messages look Chinese
    return msg.emojiTab === '表情' ? cat.labelZh : cat.labelEn
}

function scrollToSection(sectionId: string) {
    const container = emojiScrollEl.value
    if (!container) return
    const target = container.querySelector<HTMLElement>(`[data-emoji-sec="${sectionId}"]`)
    if (target) {
        container.scrollTo({top: target.offsetTop - 4, behavior: 'smooth'})
    }
}

function switchTab(tab: 'emoji' | 'stickers') {
    activeTab.value = tab
    if (tab === 'stickers') {
        void ctx?.ensureStickers()
    }
}

function selectSticker(sticker: StickerItem) {
    emit('select-sticker', sticker)
    emit('close')
}

const floatingStyle = computed(() => ({
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
}))

const positionController = createFloatingPositionController({
    getFloatingEl: () => menuEl.value,
    getAnchorEl: () => props.anchorEl,
    positionMode: 'absolute',
    computeBasePosition: (delta) => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const margin = 10
        const el = menuEl.value
        const width = el?.offsetWidth || Math.min(340, vw - margin * 2)
        const height = el?.offsetHeight || 340

        const connectedRect = props.anchorEl && props.anchorEl.isConnected
            ? props.anchorEl.getBoundingClientRect()
            : null
        const anchor = connectedRect ?? (props.anchorRect
            ? {
                left: props.anchorRect.left + delta.dx,
                top: props.anchorRect.top + delta.dy,
                bottom: props.anchorRect.bottom + delta.dy,
                width: props.anchorRect.width,
            }
            : null)

        if (anchor) {
            return clampFloatingPlacement({
                desiredLeft: anchor.left,
                aboveTop: anchor.top - height - 8,
                belowTop: anchor.bottom + 8,
                width,
                height,
                viewportWidth: vw,
                viewportHeight: vh,
                margin,
            })
        }
        return clampCenterPlacement(width, height, vw, vh, margin)
    },
    onPositionChange: (nextPos) => {
        pos.value = nextPos
    },
})

function onBackdropClick(e: MouseEvent) {
    if (backdropArmed.value || e.detail === 0) {
        emit('close')
    }
    backdropArmed.value = false
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        e.stopPropagation()
        emit('close')
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
        if (props.hideStickers) {
            activeTab.value = 'emoji'
        }
        void ctx?.ensureCustomEmojis()
        if (activeTab.value === 'stickers') {
            void ctx?.ensureStickers()
        }
        await nextTick()
        positionController.updateBase()
        positionController.attach()
        if (typeof document !== 'undefined' && !keyListenerAttached) {
            document.addEventListener('keydown', onKeydown)
            keyListenerAttached = true
        }
    } else {
        detachListeners()
    }
}, {immediate: true})

watch([() => props.anchorRect, () => props.anchorEl], () => {
    if (isClient.value && props.open) positionController.updateBase()
}, {deep: true})

onMounted(() => {
    isClient.value = true
})

onUnmounted(() => {
    detachListeners()
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.tgb-symbol-backdrop
    position: fixed
    inset: 0
    z-index: 1000004
    background: transparent

.SymbolMenu
    position: absolute
    z-index: 1000005
    width: min(340px, calc(100vw - 20px))
    height: min(350px, calc(100vh - 24px))
    border-radius: 16px
    background: rgba(253, 249, 241, 0.96)
    backdrop-filter: blur(22px)
    -webkit-backdrop-filter: blur(22px)
    border: 1px solid rgba(112, 81, 42, 0.14)
    box-shadow: 0 10px 28px rgba(112, 81, 42, 0.2), 0 2px 6px rgba(112, 81, 42, 0.1)
    display: flex
    flex-direction: column
    overflow: hidden
    contain: layout style paint
    will-change: transform
    animation: tgb-symbol-appear 0.16s cubic-bezier(0.22, 1, 0.36, 1) both

.SymbolMenu-main
    flex: 1
    min-height: 0
    display: flex
    flex-direction: column

.EmojiPicker, .StickerPicker
    display: flex
    flex-direction: column
    height: 100%
    min-height: 0

.emoji-search-bar
    position: relative
    display: flex
    align-items: center
    padding: 8px 10px 6px
    flex-shrink: 0

    .search-icon
        position: absolute
        left: 18px
        width: 16px
        height: 16px
        color: $color-text-light
        pointer-events: none

    .emoji-search-input
        width: 100%
        height: 32px
        padding: 0 28px 0 28px
        border: 1px solid rgba(112, 81, 42, 0.12)
        border-radius: 999px
        background: $color-bg-4
        color: $color-text-main
        font-size: 13px
        font-family: inherit
        outline: none
        transition: border-color 0.15s ease

        &:focus
            border-color: rgba(255, 131, 115, 0.6)

        &::placeholder
            color: $color-text-light

    .search-clear-btn
        position: absolute
        right: 16px
        background: none
        border: none
        color: $color-text-light
        cursor: pointer
        font-size: 12px
        padding: 2px 4px

.emoji-cat-bar
    display: flex
    align-items: center
    gap: 2px
    padding: 2px 10px 6px
    border-bottom: 1px solid rgba(112, 81, 42, 0.08)
    flex-shrink: 0
    overflow-x: auto
    scrollbar-width: none

    &::-webkit-scrollbar
        display: none

.cat-jump-btn
    --apple-emoji-size: 1.15rem
    width: 28px
    height: 28px
    border: none
    border-radius: 8px
    background: transparent
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    font-size: 16px
    flex-shrink: 0
    transition: background-color 0.12s ease

    &:hover
        background: rgba(255, 131, 115, 0.14)

.cat-icon-emoji
    vertical-align: middle !important

.EmojiPicker-main, .StickerPicker-main
    flex: 1
    min-height: 0
    overflow-y: auto
    padding: 6px 10px 10px
    overscroll-behavior: contain

.symbol-set
    margin-bottom: 10px

.symbol-set-header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 2px 4px 5px
    color: $color-text-light

.symbol-set-title
    font-size: 12px
    font-weight: 600

.symbol-set-count
    font-size: 11px
    opacity: 0.75

.symbol-set-grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr))
    gap: 2px

    &.sticker-grid
        grid-template-columns: repeat(auto-fill, minmax(66px, 1fr))
        gap: 6px

.EmojiButton
    --custom-emoji-size: 1.65rem
    --apple-emoji-size: 1.55rem
    width: 36px
    height: 36px
    padding: 0
    border: none
    border-radius: 10px
    background: transparent
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    transition: transform 0.12s ease, background-color 0.12s ease

    &:hover
        background: rgba(255, 131, 115, 0.16)
        transform: scale(1.12)

.picker-apple-emoji
    vertical-align: middle !important

.StickerButton
    width: 66px
    height: 66px
    padding: 4px
    border: none
    border-radius: 12px
    background: transparent
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    box-sizing: border-box
    transition: transform 0.14s ease, background-color 0.14s ease

    &:hover
        background: rgba(255, 131, 115, 0.15)
        transform: scale(1.06)

.picker-status
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    color: $color-text-light
    font-size: 13px
    padding: 20px

.picker-spinner
    width: 22px
    height: 22px
    border-radius: 50%
    border: 2.5px solid rgba(255, 131, 115, 0.25)
    border-top-color: $color-text-special
    animation: tgb-symbol-spin 0.75s linear infinite

.SymbolMenu-footer
    position: relative
    height: 40px
    flex-shrink: 0
    display: flex
    align-items: center
    justify-content: center
    border-top: 1px solid rgba(112, 81, 42, 0.1)
    background: rgba(255, 252, 249, 0.7)

.footer-tabs
    display: flex
    align-items: center
    gap: 14px

.symbol-tab-button, .symbol-delete-button
    width: 32px
    height: 32px
    padding: 0
    border: none
    border-radius: 50%
    background: transparent
    color: $color-text-light
    cursor: pointer
    display: inline-flex
    align-items: center
    justify-content: center
    transition: background-color 0.14s ease, color 0.14s ease

    svg
        width: 19px
        height: 19px

    &:hover
        background: rgba(255, 131, 115, 0.14)
        color: $color-text-special-dark

    &.activated
        background: rgba(255, 131, 115, 0.2)
        color: $color-text-special-dark

.symbol-delete-button
    position: absolute
    right: 8px

@keyframes tgb-symbol-appear
    from
        opacity: 0
        transform: translateY(8px) scale(0.96)
    to
        opacity: 1
        transform: translateY(0) scale(1)

@keyframes tgb-symbol-spin
    to
        transform: rotate(360deg)
</style>
