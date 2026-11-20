<template>
    <span class="tgb-custom-emoji">
        <span v-if="isTgs" ref="tgsHost" class="tgb-tgs-host"></span>
        <video v-else-if="isVideo"
               ref="videoEl"
               :key="currentSrc"
               :src="currentSrc"
               preload="auto"
               muted
               autoplay
               loop
               playsinline
               disablepictureinpicture
               @error="tryNext(currentSrc)" />
        <img v-else-if="currentSrc"
             ref="imgEl"
             :key="currentSrc"
             :src="currentSrc"
             alt=""
             loading="lazy"
             @error="tryNext(currentSrc)" />
        <span v-else class="fallback-star" aria-hidden="true">✦</span>
    </span>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {buildCustomEmojiCandidates} from '@/logic/customEmojiDom'
import {useTgbInteractive} from '@/logic/interactive'
import {isValidCustomEmojiId} from '@/logic/reactions'
import {MountedTgsHandle, mountTgsAnimation} from '@/logic/tgs'
import {resolveRelativeUrl} from '@/logic/url'

const props = defineProps<{
    id: string
    src?: string | null
    postsUrl: string
}>()

const interactiveCtx = useTgbInteractive()
const attemptIdx = ref(0)
const tgsHost = ref<HTMLElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
let tgsHandle: MountedTgsHandle | null = null
let tgsAbort: AbortController | null = null

const deferExtensionlessProbe = computed(
    () => !!(interactiveCtx?.api.value && !interactiveCtx.customEmojiCatalogReady.value)
)

const candidates = computed((): string[] => {
    if (!isValidCustomEmojiId(props.id)) return []
    const primary = props.src ? props.src.trim() : resolveRelativeUrl(`emoji/${props.id}`, props.postsUrl)
    return buildCustomEmojiCandidates(primary, deferExtensionlessProbe.value)
})

watch(() => [props.id, props.src, props.postsUrl, candidates.value.join('|')], () => {
    cleanupTgs()
    attemptIdx.value = 0
})

const currentSrc = computed(() => candidates.value[attemptIdx.value] ?? '')
const cleanExtSrc = computed(() => currentSrc.value.toLowerCase().split('?')[0])
const isVideo = computed(() => !!currentSrc.value && cleanExtSrc.value.endsWith('.webm'))
const isTgs = computed(() => !!currentSrc.value && cleanExtSrc.value.endsWith('.tgs'))

function cleanupTgs() {
    tgsAbort?.abort()
    tgsAbort = null
    tgsHandle?.destroy()
    tgsHandle = null
}

function tryNext(expectedSrc?: string) {
    if (expectedSrc !== undefined && expectedSrc !== currentSrc.value) {
        return
    }
    cleanupTgs()
    if (attemptIdx.value < candidates.value.length) {
        attemptIdx.value++
    }
}

watch(
    () => [isTgs.value, currentSrc.value] as const,
    async ([tgs, url]) => {
        cleanupTgs()
        if (!tgs || !url || typeof window === 'undefined') return
        const controller = new AbortController()
        tgsAbort = controller
        await nextTick()
        if (controller.signal.aborted || !tgsHost.value) return
        try {
            const handle = await mountTgsAnimation(tgsHost.value, url, controller.signal)
            if (controller.signal.aborted) {
                handle.destroy()
                return
            }
            tgsHandle = handle
        } catch {
            if (!controller.signal.aborted) {
                tryNext(url)
            }
        }
    },
    {immediate: true}
)

onMounted(() => {
    // SSR-rendered <img> / <video> candidates can 404 before Vue attaches @error listeners
    if (isTgs.value || !currentSrc.value) return
    if (isVideo.value) {
        if (videoEl.value?.error) tryNext(currentSrc.value)
        return
    }
    const img = imgEl.value
    if (img && img.complete && img.naturalWidth === 0) {
        tryNext(currentSrc.value)
    }
})

onUnmounted(() => {
    cleanupTgs()
})
</script>

<style lang="sass" scoped>
.tgb-custom-emoji
    display: inline-flex
    align-items: center
    justify-content: center
    width: var(--custom-emoji-size, 1.25rem)
    height: var(--custom-emoji-size, 1.25rem)
    vertical-align: middle
    flex-shrink: 0

    img, video, .tgb-tgs-host
        width: 100%
        height: 100%
        object-fit: contain
        display: block
        pointer-events: none

    .tgb-tgs-host
        :deep(svg)
            width: 100% !important
            height: 100% !important
            display: block

    .fallback-star
        font-size: 0.9em
        line-height: 1
</style>
