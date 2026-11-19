<template>
    <div id="ImageViewer" v-if="img">
        <div class="img-container">
            <img :src="displayedSrc" alt="Photo" class="undraggable" :style="imgStyle">
        </div>
        <div class="top">
            <span class="f-grow1"></span>
            <i-ep-close class="icn close clickable" @click="close"/>
        </div>
        <div class="bottom">
            <div class="left unselectable">
                <div class="index">{{msg.photoIndex(index + 1, imgs.length)}}</div>
                <div class="detail">
                    <span class="date" v-if="img.date">{{img.date}}</span>
                </div>
            </div>
            <div class="right">
                <button v-if="img.originalUrl" type="button"
                        class="orig-btn clickable"
                        :class="{ active: viewingOriginal, loading: loadingOriginal }"
                        :disabled="loadingOriginal"
                        @click="toggleOriginal">
                    <span v-if="loadingOriginal" class="orig-spinner" aria-hidden="true"></span>
                    <span>{{ originalButtonLabel }}</span>
                </button>
                <i-ep-download class="icn download clickable" @click="download"/>
            </div>
            <div class="description unselectable">
                <div class="text" v-if="img.text">
                    <div v-html="textHtml"></div>
                </div>
            </div>
        </div>
        <div class="arrows">
            <i-ep-arrow-left class="icn left clickable" v-if="hasPrev" @click="updateIndex(-1)"/>
            <i-ep-arrow-right class="icn right clickable" v-if="hasNext" @click="updateIndex(1)"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import * as KeyCode from 'keycode-js';
import fileDownload from "js-file-download";
import {sizeFmt} from "@/logic/formatter";
import {useTgbMessages} from "@/logic/messages";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";

const msg = useTgbMessages()

export interface ViewedImage
{
    url: string
    text?: string
    date?: string
    fileName?: string
    originalUrl?: string
    originalSize?: number
    originalName?: string
}

export interface TrackedImage extends ViewedImage
{
    postIndex: number
}

const props = defineProps<{
    imgs: ViewedImage[]
    index: number
}>()
const imgs = computed(() => props.imgs)
const index = computed(() => props.index)

const emit = defineEmits<{
    (e: "close"): void
    (e: "update:index", value: number): void
}>()

const ctrlDown = ref(false)
const zoom = ref(1)
const viewingOriginal = ref(false)
const loadingOriginal = ref(false)
let originalLoadToken = 0

const img = computed(() => {
    if (imgs.value) return imgs.value[index.value]
    return undefined
})
const isOpen = computed(() => !!img.value)
const hasPrev = computed(() => index.value > 0)
const hasNext = computed(() => index.value + 1 < imgs.value.length)
const textHtml = computed(() => img.value?.text)

const displayedSrc = computed(() => {
    if (!img.value) return ''
    if (viewingOriginal.value && img.value.originalUrl) {
        return img.value.originalUrl
    }
    return img.value.url
})

const originalButtonLabel = computed(() => {
    if (loadingOriginal.value) return msg.loadingOriginal
    if (viewingOriginal.value) return msg.viewingOriginal
    if (img.value?.originalSize) {
        return msg.viewOriginalWithSize(sizeFmt(img.value.originalSize))
    }
    return msg.viewOriginal
})

watch([index, () => img.value?.url], () => {
    originalLoadToken++
    viewingOriginal.value = false
    loadingOriginal.value = false
})

function toggleOriginal() {
    const cur = img.value
    if (!cur?.originalUrl || loadingOriginal.value) return

    if (viewingOriginal.value) {
        originalLoadToken++
        viewingOriginal.value = false
        return
    }

    const token = ++originalLoadToken
    const targetUrl = cur.originalUrl
    loadingOriginal.value = true

    if (typeof window === 'undefined' || typeof Image === 'undefined') {
        viewingOriginal.value = true
        loadingOriginal.value = false
        return
    }

    const preloader = new Image()
    preloader.onload = () => {
        if (token !== originalLoadToken) return
        viewingOriginal.value = true
        loadingOriginal.value = false
    }
    preloader.onerror = () => {
        if (token !== originalLoadToken) return
        loadingOriginal.value = false
    }
    preloader.src = targetUrl
}

async function download() {
    if (!img.value) return
    const targetUrl = img.value.originalUrl || img.value.url
    const fallbackName = targetUrl.split("/").slice(-1)[0].split("?")[0]
    const fileName = img.value.originalUrl
        ? (img.value.originalName ?? img.value.fileName ?? fallbackName)
        : (img.value.fileName ?? fallbackName)
    fileDownload(await (await fetch(targetUrl)).blob(), fileName)
}

function close() {
    originalLoadToken++
    viewingOriginal.value = false
    loadingOriginal.value = false
    emit("close")
    rawUpdateIndex(-1)
}

function updateIndex(offset: number)
{
    const ni = index.value + offset
    if (ni < 0 || ni >= imgs.value.length) return
    zoom.value = 1
    rawUpdateIndex(ni)
}

function rawUpdateIndex(index: number) {
    emit("update:index", index)
}

function keydown(e: KeyboardEvent)
{
    if (!isOpen.value) return
    if (e.code === KeyCode.CODE_ESCAPE) return close()
    if (e.code === KeyCode.CODE_LEFT) return updateIndex(-1)
    if (e.code === KeyCode.CODE_RIGHT) return updateIndex(1)
    if (e.key == KeyCode.VALUE_CONTROL || e.key === KeyCode.VALUE_META) return ctrlDown.value = true
}

function keyup(e: KeyboardEvent)
{
    if (e.key == KeyCode.VALUE_CONTROL || e.key === KeyCode.VALUE_META) return ctrlDown.value = false
}

function wheel(e: WheelEvent)
{
    if (!isOpen.value) return

    // Prevent page scroll
    e.preventDefault()

    // Get scroll direction
    const dir = Math.sign(e.deltaY)

    // Regular scroll: switch photos, Ctrl scroll: zoom
    if (!ctrlDown.value) updateIndex(dir)
    else zoom.value = Math.min(Math.max(zoom.value *= 1 + (dir * -0.1), 0.1), 5.0)
}

const imgStyle = computed(() =>
{
    return {transform: `scale(${zoom.value.toFixed(2)})`}
})

onMounted(() =>
{
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)
    document.addEventListener("wheel", wheel, {passive: false})
})

onUnmounted(() =>
{
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('keyup', keyup)
    document.removeEventListener("wheel", wheel)
})
</script>

<style lang="sass" scoped>
#ImageViewer
    // Absolute positioning
    position: fixed
    z-index: 1000000
    inset: 0
    background: rgba(0, 0, 0, 0.8)
    backdrop-filter: blur(2px)

.img-container
    position: absolute
    inset: 0

    display: flex
    align-items: center
    justify-content: center

    img
        max-width: 100%
        max-height: 100%

.icn
    font-size: 2em
    filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))

.top, .bottom, .arrows
    color: white
    opacity: 0.8
    z-index: 1000002

.top
    position: absolute

.arrows
    .icn
        position: absolute
        top: calc(50% - 0.5em)
        z-index: 1000004

    .left
        left: 10px

    .right
        right: 10px

.top
    position: absolute
    inset: 10px 10px auto 10px
    display: flex

.bottom
    position: absolute
    inset: auto 10px 10px 10px
    display: flex

    .clickable
        z-index: 1000008

    .left, .right
        // Align contents inside info box to the bottom
        display: flex
        flex-direction: column
        justify-content: end

    .left, .right
        flex-grow: 1
        flex-shrink: 0

    .left
        // Align the info box
        text-align: left

        display: flex
        flex-direction: column
        justify-content: end

        .index
            font-weight: bold

        .detail
            display: flex
            gap: 10px

    .right
        flex-direction: row
        align-items: center
        justify-content: end
        gap: 12px

.orig-btn
    display: inline-flex
    align-items: center
    gap: 6px
    padding: 5px 12px
    border-radius: 999px
    border: 1px solid rgba(255, 255, 255, 0.4)
    background: rgba(0, 0, 0, 0.45)
    color: #fff
    font-size: 0.82em
    font-weight: 500
    font-family: inherit
    backdrop-filter: blur(4px)
    transition: background 0.18s ease, border-color 0.18s ease

    &:hover:not(:disabled)
        background: rgba(255, 255, 255, 0.18)
        border-color: rgba(255, 255, 255, 0.75)

    &.active
        background: rgba(255, 131, 115, 0.85)
        border-color: #ff8373

    &.loading
        cursor: wait
        opacity: 0.85

.orig-spinner
    width: 11px
    height: 11px
    border-radius: 50%
    border: 2px solid rgba(255, 255, 255, 0.35)
    border-top-color: #fff
    animation: tgb-viewer-spin 0.75s linear infinite

@keyframes tgb-viewer-spin
    to
        transform: rotate(360deg)

.description
    position: absolute
    inset: auto 0 0 0

    display: flex
    justify-content: center

    .text
        max-width: 800px
        // Border box
        padding: 10px
        background: rgba(0, 0, 0, 0.7)
        border-radius: 10px

        // Text
        font-size: 0.8em
        text-align: left
        white-space: pre-line

        // Limit content to 10 lines
        > div
            overflow: hidden
            text-overflow: ellipsis
            display: -webkit-box
            -webkit-line-clamp: 10
            line-clamp: 10
            -webkit-box-orient: vertical
    
// Mobile optimizations
@media only screen and (max-width: 600px)
    // Put middle text block outside
    .description
        position: absolute
        bottom: 100%
        margin-bottom: 10px
</style>

<style lang="sass">
#ImageViewer
    a
        color: unset
</style>
