<template>
    <span class="tgb-sticker-media">
        <span v-if="isTgs" ref="tgsHost" class="tgb-sticker-tgs-host"></span>
        <video v-else-if="isWebm"
               :src="safeUrl"
               :poster="safeThumb || undefined"
               preload="auto"
               muted
               autoplay
               loop
               playsinline
               disablepictureinpicture
               @error="videoFailed = true" />
        <img v-else-if="isStaticImage"
             :src="safeUrl"
             :alt="alt || emoji || 'sticker'"
             loading="lazy"
             draggable="false" />
        <img v-else-if="safeThumb"
             :src="safeThumb"
             :alt="alt || emoji || 'sticker'"
             loading="lazy"
             draggable="false" />
        <span v-else class="tgb-sticker-fallback">{{ emoji || '✨' }}</span>
    </span>
</template>

<script lang="ts" setup>
import {computed, nextTick, onUnmounted, ref, watch} from 'vue'
import {MountedTgsHandle, mountTgsAnimation} from '@/logic/tgs'
import {isSafeMediaUrl} from '@/logic/url'

const props = defineProps<{
    url: string
    thumb?: string | null
    emoji?: string | null
    format?: string | null
    isAnimated?: boolean | null
    isVideo?: boolean | null
    alt?: string
}>()

const tgsHost = ref<HTMLElement | null>(null)
const tgsFailed = ref(false)
const videoFailed = ref(false)
let tgsHandle: MountedTgsHandle | null = null
let tgsAbort: AbortController | null = null

const safeUrl = computed(() => (isSafeMediaUrl(props.url) ? props.url : ''))
const safeThumb = computed(() => (isSafeMediaUrl(props.thumb) ? props.thumb : ''))
const cleanExt = computed(() => safeUrl.value.toLowerCase().split('?')[0].split('#')[0])

const wantsTgs = computed(() =>
    props.format === 'tgs' || !!props.isAnimated || cleanExt.value.endsWith('.tgs')
)

const wantsWebm = computed(() =>
    !wantsTgs.value && (props.format === 'webm' || !!props.isVideo || cleanExt.value.endsWith('.webm'))
)

const isTgs = computed(() => !!safeUrl.value && wantsTgs.value && !tgsFailed.value)
const isWebm = computed(() => !!safeUrl.value && wantsWebm.value && !videoFailed.value)
const isStaticImage = computed(() => !!safeUrl.value && !wantsTgs.value && !wantsWebm.value)

function cleanupTgs() {
    tgsAbort?.abort()
    tgsAbort = null
    tgsHandle?.destroy()
    tgsHandle = null
}

watch(
    () => [props.url, props.format, props.isAnimated, props.isVideo],
    () => {
        tgsFailed.value = false
        videoFailed.value = false
    }
)

watch(
    () => [isTgs.value, safeUrl.value] as const,
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
                tgsFailed.value = true
            }
        }
    },
    {immediate: true}
)

onUnmounted(() => {
    cleanupTgs()
})
</script>

<style lang="sass" scoped>
.tgb-sticker-media
    display: inline-flex
    align-items: center
    justify-content: center
    width: 100%
    height: 100%

    img, video, .tgb-sticker-tgs-host
        width: 100%
        height: 100%
        object-fit: contain
        display: block

    .tgb-sticker-tgs-host
        :deep(svg)
            width: 100% !important
            height: 100% !important
            display: block

.tgb-sticker-fallback
    font-size: 2rem
    line-height: 1
</style>
