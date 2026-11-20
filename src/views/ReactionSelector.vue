<template>
    <Teleport to="body" v-if="isClient && open">
        <div class="tgb-reaction-backdrop"
             @pointerdown.self="backdropArmed = true"
             @click.self="onBackdropClick"
             @contextmenu.prevent="onBackdropContextMenu">
            <div ref="selectorEl"
                 class="ReactionSelector"
                 :class="{ expanded, flipped: flippedBelow }"
                 :style="floatingStyle"
                 role="dialog"
                 aria-label="Reactions"
                 @click.stop>
                <div v-if="!expanded && !flippedBelow" class="ReactionSelector__bubble-small" />
                <div class="ReactionSelector__items-wrapper">
                    <div v-if="!expanded && !flippedBelow" class="ReactionSelector__bubble-big" />
                    <div class="ReactionSelector__items">
                        <!-- Stage 1: Compact frosted horizontal pill bar (7 reactions + show-more chevron) -->
                        <div v-if="!expanded" class="ReactionSelector__reactions">
                            <button v-for="(r, i) in compactReactions"
                                    :key="r.canonical_key"
                                    type="button"
                                    class="ReactionSelector__reaction"
                                    :class="{ chosen: isChosen(r) }"
                                    :style="{ '--_delay': `${(compactReactions.length - 1 - i) * 20}ms` }"
                                    @click="selectReaction(r)">
                                <CustomEmoji v-if="r.custom_emoji_id"
                                             :id="r.custom_emoji_id"
                                             :src="r.custom_emoji_src"
                                             :posts-url="postsUrl" />
                                <AppleEmoji v-else-if="r.emoji" :emoji="r.emoji" class="selector-apple-emoji" />
                            </button>
                            <button v-if="hasMore"
                                    type="button"
                                    class="ReactionSelector__show-more"
                                    aria-label="More reactions"
                                    @click="expandGrid">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="none" stroke="currentColor" stroke-width="2.2"
                                          stroke-linecap="round" stroke-linejoin="round"
                                          d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                        </div>

                        <!-- Stage 2: Expanded ReactionPickerLimited multi-row scrollable grid -->
                        <div v-else class="ReactionPickerGrid">
                            <button v-for="r in reactions"
                                    :key="r.canonical_key"
                                    type="button"
                                    class="ReactionPickerGrid__cell"
                                    :class="{ chosen: isChosen(r) }"
                                    @click="selectReaction(r)">
                                <CustomEmoji v-if="r.custom_emoji_id"
                                             :id="r.custom_emoji_id"
                                             :src="r.custom_emoji_src"
                                             :posts-url="postsUrl" />
                                <AppleEmoji v-else-if="r.emoji" :emoji="r.emoji" class="selector-apple-emoji" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import type {ReactionChoice} from '@/logic/reactions'
import AppleEmoji from '@/views/AppleEmoji.vue'
import CustomEmoji from '@/views/CustomEmoji.vue'

const REACTIONS_AMOUNT = 7

const props = defineProps<{
    open: boolean
    reactions: ReactionChoice[]
    chosenKeys: Set<string>
    postsUrl: string
    anchor: { x: number; y: number }
}>()

const emit = defineEmits<{
    (e: 'select', choice: ReactionChoice): void
    (e: 'close'): void
}>()

const isClient = ref(false)
const expanded = ref(false)
const flippedBelow = ref(false)
const backdropArmed = ref(false)
const selectorEl = ref<HTMLElement | null>(null)
const pos = ref({left: 0, top: 0})

const compactReactions = computed((): ReactionChoice[] => {
    if (props.reactions.length === REACTIONS_AMOUNT + 1) {
        return props.reactions
    }
    return props.reactions.slice(0, REACTIONS_AMOUNT)
})

const hasMore = computed(() => compactReactions.value.length < props.reactions.length)

const floatingStyle = computed(() => ({
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
}))

function isChosen(r: ReactionChoice): boolean {
    return props.chosenKeys.has(r.canonical_key) || props.chosenKeys.has(r.reaction_key)
}

function updatePosition() {
    if (typeof window === 'undefined') return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 10
    const el = selectorEl.value
    // Use offsetWidth/offsetHeight instead of getBoundingClientRect() so scale(0.92)
    // intro animation doesn't under-report width and cause 375px mobile viewport overflow
    const width = el?.offsetWidth || (expanded.value ? 304 : 316)
    const height = el?.offsetHeight || (expanded.value ? 256 : 42)

    // Prefer right-aligned above the anchor point, clamped inside the viewport
    let left = props.anchor.x - width + 34
    left = Math.max(margin, Math.min(left, vw - width - margin))

    let top = props.anchor.y - height - 16
    if (top < margin) {
        flippedBelow.value = true
        top = Math.min(props.anchor.y + 14, vh - height - margin)
    } else {
        flippedBelow.value = false
    }
    top = Math.max(margin, Math.min(top, vh - height - margin))

    pos.value = {left: Math.round(left), top: Math.round(top)}
}

function close() {
    backdropArmed.value = false
    emit('close')
}

function onBackdropClick(e: MouseEvent) {
    // Require a fresh pointerdown on the backdrop (or keyboard activation e.detail === 0)
    // so lifting the finger after a touch long-press never immediately dismisses the selector
    if (backdropArmed.value || e.detail === 0) {
        close()
    }
    backdropArmed.value = false
}

function onBackdropContextMenu() {
    // Mobile browsers may fire a trailing contextmenu right after a 420ms touch long-press opens the selector
    if (nowMs() - openedAt < 300) {
        return
    }
    close()
}

function selectReaction(choice: ReactionChoice) {
    emit('select', choice)
    close()
}

async function expandGrid() {
    expanded.value = true
    await nextTick()
    updatePosition()
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        e.stopPropagation()
        close()
    }
}

let openedAt = 0
let scrollBaselines = new WeakMap<EventTarget, number>()

function nowMs(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()
}

function getScrollTop(target: EventTarget | null): number {
    if (!target || target === document || target === window) {
        return typeof window !== 'undefined' ? window.scrollY : 0
    }
    if (target instanceof HTMLElement) {
        return target.scrollTop
    }
    return 0
}

function onWindowScroll(e: Event) {
    // Allow scrolling inside the expanded reaction grid itself
    if (e.target instanceof Node && selectorEl.value?.contains(e.target)) {
        return
    }
    // Ignore trailing scroll-into-view / momentum events right after opening
    if (nowMs() - openedAt < 200) {
        return
    }
    const target = e.target ?? window
    const currentTop = getScrollTop(e.target)
    if (!scrollBaselines.has(target)) {
        scrollBaselines.set(target, currentTop)
        return
    }
    if (Math.abs(currentTop - scrollBaselines.get(target)!) > 36) {
        close()
    }
}

let listenersAttached = false

function detachListeners() {
    if (!listenersAttached || typeof window === 'undefined') return
    document.removeEventListener('keydown', onKeydown)
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', onWindowScroll, true)
    listenersAttached = false
}

// Watch combined (isClient && open) with immediate: true so defineAsyncComponent mounting
// while open is already true still positions cleanly and attaches Escape/resize/scroll listeners
watch(() => isClient.value && props.open, async (active) => {
    backdropArmed.value = false
    if (active) {
        openedAt = nowMs()
        scrollBaselines = new WeakMap()
        expanded.value = false
        flippedBelow.value = false
        await nextTick()
        updatePosition()
        if (typeof window !== 'undefined' && !listenersAttached) {
            document.addEventListener('keydown', onKeydown)
            window.addEventListener('resize', updatePosition)
            window.addEventListener('scroll', onWindowScroll, {capture: true, passive: true})
            listenersAttached = true
        }
    } else {
        detachListeners()
    }
}, {immediate: true})

watch(() => props.anchor, () => {
    if (isClient.value && props.open) updatePosition()
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

.tgb-reaction-backdrop
    position: fixed
    inset: 0
    z-index: 1000005
    background: transparent

.ReactionSelector
    position: fixed
    min-width: 3rem
    max-width: calc(100vw - 20px)
    z-index: 1000006
    animation: tgb-selector-appear 0.16s cubic-bezier(0.22, 1, 0.36, 1) both

    &__bubble-big,
    &__bubble-small,
    &__items-wrapper
        background: rgba(253, 249, 241, 0.92)
        backdrop-filter: blur(20px)
        -webkit-backdrop-filter: blur(20px)
        box-shadow: 0 6px 20px rgba(112, 81, 42, 0.18), 0 1px 3px rgba(112, 81, 42, 0.1)

    &__bubble-big
        position: absolute
        z-index: -1
        right: 1.125rem
        bottom: -0.45rem
        display: block
        width: 1rem
        height: 0.5rem
        border-radius: 0 0 1rem 1rem

        @media (max-width: 600px)
            display: none

    &__bubble-small
        position: absolute
        right: 1.125rem
        bottom: -1.15rem
        display: block
        width: 0.5rem
        height: 0.5rem
        border-radius: 50%

        @media (max-width: 600px)
            display: none

    &__items-wrapper
        border-radius: 1.25rem
        border: 1px solid rgba(112, 81, 42, 0.1)
        transition: border-radius 0.2s ease

    &.expanded &__items-wrapper
        border-radius: 1rem

    &__items
        display: flex
        flex-direction: column
        align-items: center

    &__reactions
        display: flex
        align-items: center
        height: 2.5rem
        padding: 0 0.375rem
        gap: 0.125rem

    &__reaction
        --custom-emoji-size: 1.55rem
        --apple-emoji-size: 1.48rem
        width: 2.15rem
        height: 2.15rem
        padding: 0
        border: none
        border-radius: 50%
        background: transparent
        cursor: pointer
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 1.38rem
        line-height: 1
        animation: tgb-reaction-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both
        animation-delay: var(--_delay, 0ms)
        transition: transform 0.14s ease, background-color 0.14s ease

        &:hover
            transform: scale(1.22)
            background: rgba(255, 131, 115, 0.14)

        &.chosen
            background: rgba(255, 131, 115, 0.24)

    &__show-more
        width: 2rem
        height: 2rem
        margin-inline-start: 0.18rem
        padding: 0
        border: none
        border-radius: 50%
        background: rgba(112, 81, 42, 0.08)
        color: $color-text-main
        cursor: pointer
        display: inline-flex
        align-items: center
        justify-content: center
        flex-shrink: 0
        transition: background-color 0.15s ease, transform 0.15s ease

        svg
            width: 1.15rem
            height: 1.15rem

        &:hover
            background: rgba(255, 131, 115, 0.18)
            color: $color-text-special-dark
            transform: scale(1.06)

.ReactionPickerGrid
    display: grid
    grid-template-columns: repeat(7, 36px)
    gap: 5px
    padding: 8px
    max-height: 16rem
    overflow-y: auto
    overscroll-behavior: contain

    @media (max-width: 360px)
        grid-template-columns: repeat(6, 36px)

    &__cell
        --custom-emoji-size: 1.55rem
        --apple-emoji-size: 1.45rem
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
        font-size: 1.35rem
        line-height: 1
        transition: transform 0.13s ease, background-color 0.13s ease

        &:hover
            transform: scale(1.18)
            background: rgba(255, 131, 115, 0.14)

        &.chosen
            background: rgba(255, 131, 115, 0.24)

.selector-apple-emoji
    vertical-align: middle !important

@keyframes tgb-selector-appear
    from
        opacity: 0
        transform: scale(0.92) translateY(6px)
    to
        opacity: 1
        transform: scale(1) translateY(0)

@keyframes tgb-reaction-pop
    from
        opacity: 0
        transform: scale(0.45)
    to
        opacity: 1
        transform: scale(1)
</style>
