<template>
    <div v-if="images.length"
         class="images"
         :class="{'has-head': hasHead, bleed, compact}"
         :style="containerStyle">
        <div class="image_container" v-for="(img, i) in images" :key="`${img.url}-${i}`" :style="getImageStyle(i)">
            <picture>
                <source v-if="getThumbJxlSrc(img)" :srcset="getThumbJxlSrc(img)" type="image/jxl">
                <img :src="img.thumb || img.url" alt="image"
                     class="clickable"
                     :class="{media_spoiler: isSpoilerActive(img, i)}"
                     @click.stop="clickImg(img, i)"
                     style="inset: 0">
            </picture>
        </div>
    </div>
    <div v-if="files.length"
         class="files"
         :class="{'has-images': images.length > 0, bleed, compact}">
        <FileView v-for="(f, i) in files" :key="`${f.url}-${i}`" :f="f"
                  :has-head="i > 0 || hasHead || images.length > 0"
                  :interactive="interactive"
                  :poll-state="f.media_type === 'poll' ? pollState : null"
                  :poll-voting="pollVoting"
                  @play-file="file => emit('play-file', file)"
                  @vote-poll="(pollId, indices) => emit('vote-poll', pollId, indices)" />
    </div>
</template>

<script lang="ts" setup>
import FileView from '@/views/FileView.vue'
import {Image, MergedPoll, TGFile} from '@/logic'
import {calculateAlbumLayout} from '@/logic/webz/calculateAlbumLayout'
import {computed, ref, StyleValue, watch} from 'vue'

const props = withDefaults(defineProps<{
    images?: Image[]
    files?: TGFile[]
    hasHead?: boolean
    interactive?: boolean
    pollState?: MergedPoll | null
    pollVoting?: boolean
    maxWidth?: number
    maxHeight?: number
    scale?: number
    bleed?: boolean
    compact?: boolean
}>(), {
    images: () => [],
    files: () => [],
    hasHead: false,
    interactive: false,
    pollState: null,
    pollVoting: false,
    maxWidth: 450,
    maxHeight: 450,
    scale: 1,
    bleed: true,
    compact: false,
})

const emit = defineEmits<{
    (e: 'click-img', idx: number): void
    (e: 'play-file', file: TGFile): void
    (e: 'vote-poll', pollId: string, optionIndices: number[]): void
}>()

const revealedSpoilers = ref<Set<number>>(new Set())
watch(() => props.images, () => {
    revealedSpoilers.value = new Set()
})

const dims = computed(() =>
    props.images.length ? calculateAlbumLayout(props.images, props.maxWidth, props.maxHeight) : null
)

const containerStyle = computed(() => {
    if (!dims.value) return {}
    const ss = props.scale
    const dm = dims.value.containerStyle
    const width = dm.width || Math.max(0, ...dims.value.layout.map(l => l.dimensions.x + l.dimensions.width))
    const height = dm.height || Math.max(0, ...dims.value.layout.map(l => l.dimensions.y + l.dimensions.height))
    return {width: width * ss + 'px', height: height * ss + 'px'}
})

function getImageStyle(i: number): StyleValue {
    if (!dims.value?.layout[i]) return {}
    const ss = props.scale
    const dm = dims.value.layout[i].dimensions
    return {
        left: dm.x * ss + 'px',
        top: dm.y * ss + 'px',
        width: dm.width * ss + 'px',
        height: dm.height * ss + 'px',
    }
}

function getThumbJxlSrc(img: Image): string | undefined {
    if (img.thumb_jxl_url) return img.thumb_jxl_url
    if (!img.thumb && img.jxl_url) return img.jxl_url
    return undefined
}

function isSpoilerActive(img: Image, i: number): boolean {
    return !!img.spoiler && !revealedSpoilers.value.has(i)
}

function clickImg(img: Image, i: number) {
    if (isSpoilerActive(img, i)) {
        const next = new Set(revealedSpoilers.value)
        next.add(i)
        revealedSpoilers.value = next
        img.spoiler = false
        return
    }
    emit('click-img', i)
}
</script>

<style lang="sass" scoped>
.images
    display: flex
    position: relative

    .image_container
        overflow: hidden
        position: absolute
        // Gray bg is needed to fix the white infix vignette effect from the spoiler blur
        background: gray

    picture
        display: block
        width: 100%
        height: 100%

    img
        width: 100%
        height: 100%
        object-fit: cover
        transition: filter 1s ease

    &.bleed
        margin: -12px -20px 10px

        &.has-head
            margin: 0 -20px 10px

    &:not(.bleed)
        margin: 0
        max-width: 100%
        border-radius: 10px
        overflow: hidden

.files
    &.bleed
        margin-left: -20px
        margin-right: -20px

        > * + *
            margin-top: 10px

    &:not(.bleed)
        display: flex
        flex-direction: column
        gap: 6px

    &.has-images:not(.bleed)
        margin-top: 6px

    &.compact
        :deep(.file), :deep(.sticker)
            margin-left: 0
            margin-right: 0

        :deep(.no-head)
            margin-top: 0

        :deep(.video)
            margin: 0
            border-radius: 10px
            overflow: hidden

        :deep(.location)
            margin: 0
            border-radius: 10px
            overflow: hidden

        :deep(.location .map)
            height: 220px

        :deep(.sticker > *)
            width: 140px
            min-height: 140px

        :deep(#Poll)
            margin: 0
            border-radius: 10px
</style>
