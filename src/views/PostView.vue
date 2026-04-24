<template>
    <div class="post tgb-card" :id="`message-${p.id}`" :class="{'service': p.type === 'service'}" ref="post">
        <div class="head unselectable">
            <div class="forward" v-if="p.forwarded_from">
                Forwarded from: <a :href="fwdUrl">{{fwdName}}</a>
            </div>
        </div>
        <div class="reply undraggable clickable" v-if="p.reply" @click="clickReply">
            <div class="thumb-wrap" v-if="p.reply.thumb">
                <img class="thumb" :src="p.reply.thumb" alt="" loading="lazy">
            </div>
            <div class="mtext">
                <div class="reply-to">Reply to:</div>
                <div class="reply-text" v-html="p.reply.text"></div>
            </div>
        </div>
        <div class="images" v-if="p.images" :class="{'has-head': p.reply || p.forwarded_from}"
             :style="containerStyle">
            <div class="image_container" v-for="(img, i) in p.images" :key="i" :style="getImageStyle(i)">
                <img :src="img.url" alt="image" loading="lazy"
                     class="clickable" :class="{media_spoiler: img.spoiler}" @click="clickImg(img, i)" style="inset: 0">
            </div>
        </div>
        <div class="files" v-if="p.files">
            <FileView v-for="(f, i) in p.files" :key="f.url ?? i" :f="f" :has-head="!!(p.reply || p.forwarded_from || p.images)"
                      @play-file="onPlayFile" />
        </div>
        <div class="text" v-html="text"></div>
        <div class="info font-code unselectable">
            <div class="id">#{{p.id}}</div>
            <div class="f-grow1"></div>
            <div class="author" v-if="p.author">{{p.author}}</div>
            <div class="date">{{p.date}}</div>
            <div class="views" v-if="p.views">{{p.views}} <i-fas-eye /></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {Image, Post, TGFile} from "@/logic/models";
import FileView from "@/views/FileView.vue";
import {calculateAlbumLayout} from "@/logic/webz/calculateAlbumLayout";
import {computed, onMounted, onUnmounted, ref, StyleValue} from "vue";

const props = defineProps<{
    p: Post
    postsUrl: string
}>()
const p = computed(() => props.p)

const emit = defineEmits<{
    (e: "click-reply", id: number): void
    (e: "click-img", index: number): void
    (e: "play-file", file: TGFile): void
}>()

const el = ref<HTMLDivElement>()
const sizeScale = ref(1)

const text = computed(() => p.value.text)
const fwdUrl = computed(() => typeof p.value.forwarded_from == 'string' ? undefined : p.value.forwarded_from.url)
const fwdName = computed(() => typeof p.value.forwarded_from == 'string' ? p.value.forwarded_from : p.value.forwarded_from.name)

const dims = computed(() =>
{
    console.log(`Calculating dimensions for ${p.value.id}...`)
    return calculateAlbumLayout(p.value.images, 450, 450)
})

const containerStyle = computed(() =>
{
    const ss = sizeScale.value
    const dm = dims.value.containerStyle
    return {width: dm.width * ss + "px", height: dm.height * ss + "px"}
})

function getImageStyle(i: number): StyleValue
{
    const ss = sizeScale.value
    const dm = dims.value.layout[i].dimensions
    return {
        left: dm.x * ss + "px", top: dm.y * ss + "px",
        width: dm.width * ss + "px", height: dm.height * ss + "px"
    }
}

function onPlayFile(file: TGFile) {
    emit("play-file", file)
}

function clickReply() {
    emit("click-reply", p.value.reply.id)
}

function refreshSize() {
    if (!el.value) return
    sizeScale.value = el.value.clientWidth / 450
}

onMounted(() =>
{
    initEmoji()
    refreshSize()
    window.addEventListener('resize', refreshSize)
})

onUnmounted(() =>
{
    window.removeEventListener('resize', refreshSize)
})

function replaceUrl(url: string): string
{
    return new URL(url, props.postsUrl).toString();
}

/**
 * Initialize custom emojis
 */
function initEmoji()
{
    // Find all non-initialized emojis
    document.querySelectorAll("i.custom-emoji:not(.init)").forEach(it => {
        // Read attributes
        const src = replaceUrl(it.getAttribute("emoji-src"))
        // const orig = it.getAttribute("emoji-orig")

        // Set initialized
        it.classList.add("init")

        // Video
        if (src.endsWith("webm"))
        {
            it.innerHTML = `<video src="${src}" preload="auto" muted autoplay loop playsinline disablepictureinpicture></video>`
        }

        // Image
        else
        {
            it.innerHTML = `<img src="${src}" alt="">`
        }
    })
}

function clickImg(img: Image, i: number)
{
    // Show spoiler if not already shown
    if (img.spoiler)
    {
        img.spoiler = false
        return
    }

    // Open image if spoiler is already shown
    emit('click-img', i)
}
</script>

<style lang="sass" scoped>
@use "sass:color"
@use "css/global" as *
@use "css/colors" as *
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@500&family=Shadows+Into+Light&display=swap')

.font-code
    font-family: Inconsolata, Monospaced, $font

.post.service
    .id
        display: none

.post
    padding: 12px 20px 8px
    text-align: left

    > *
        margin-bottom: 10px
    > *:last-child
        margin-bottom: 0

    .forward, .forward a, .reply-to
        color: $color-text-special-dark
        font-weight: bold

    .reply
        display: flex
        gap: 10px

        .thumb-wrap
            display: flex
            align-items: center

        .thumb
            height: 2.6em
            aspect-ratio: 1
            object-fit: cover

        .mtext
            flex-grow: 1
            color: $color-text-light
            display: -webkit-box
            -webkit-box-orient: vertical
            overflow: hidden

        .reply-text
            white-space: nowrap
            overflow: hidden
            text-overflow: ellipsis

    .reply:before
        content: " "
        border: 2px solid color.adjust($color-text-main, $lightness: 20%)
        border-radius: 2px
        background: $color-text-main

    .images.has-head
        margin: 0 -20px 10px

    .images
        margin: -20px -20px 10px
        display: flex
        position: relative

        .image_container
            overflow: hidden
            position: absolute
            // Gray bg is needed to fix the white infix vignette effect from the spoiler blur
            background: gray

        img
            width: 100%
            height: 100%
            object-fit: cover
            transition: filter 1s ease

    .text
        white-space: pre-line
        overflow-wrap: break-word

    .info
        display: flex
        color: color.adjust($color-text-main, $lightness: 40%)
        white-space: nowrap
        overflow: hidden
        font-size: 0.9em
        gap: 10px

        .views
            display: flex
            align-items: center
            gap: 5px

        svg
            font-size: 0.75em

    // Files
    .files
        // Custom margin control
        margin-left: -20px
        margin-right: -20px

        // Margin between files in a file group
        > * + *
            margin-top: 10px
</style>

<style lang="sass">
@use "css/colors" as *

.media_spoiler
    // Hide content with blur
    filter: blur(18px)

.post
    a
        color: $color-text-special
        text-decoration: none

// Custom emojis
i.custom-emoji
    video, img
        $size-incr: 0.3em
        height: 1em + $size-incr
        margin-top: calc($size-incr / -2)
        margin-bottom: calc($size-incr / -2)
        //transform: translateY(0.125em)
        transform: translateZ(1em)
        pointer-events: none
        image-rendering: optimizeQuality
</style>
