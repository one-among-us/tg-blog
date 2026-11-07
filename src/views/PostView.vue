<template>
    <div class="post tgb-card" :id="`message-${p.id}`" :class="{'service': p.type === 'service'}" ref="el">
        <div class="head unselectable">
            <div class="forward" v-if="p.forwarded_from">
                {{msg.forwardedFrom}} <a :href="fwdUrl">{{fwdName}}</a>
            </div>
        </div>
        <div class="reply undraggable clickable" v-if="p.reply" @click="clickReply">
            <div class="thumb-wrap" v-if="p.reply.thumb">
                <img class="thumb" :src="p.reply.thumb" alt="">
            </div>
            <div class="mtext">
                <div class="reply-to">{{msg.replyTo}}</div>
                <div class="reply-quote" v-if="p.quote?.text" v-html="p.quote.text"></div>
                <div class="reply-text" v-else-if="p.reply.text" v-html="p.reply.text"></div>
            </div>
        </div>
        <div class="quote-container" v-if="p.quote && !p.reply">
            <blockquote v-html="p.quote.text"></blockquote>
        </div>
        <div class="text" v-if="p.show_caption_above_media && text" v-html="text" @click="onTextClick"></div>
        <div class="images" v-if="p.images" :class="{'has-head': p.reply || p.forwarded_from || (p.show_caption_above_media && text)}"
             :style="containerStyle">
            <div class="image_container" v-for="(img, i) in p.images" :key="i" :style="getImageStyle(i)">
                <img :src="img.thumb || img.url" alt="image"
                     class="clickable" :class="{media_spoiler: img.spoiler}" @click="clickImg(img, i)" style="inset: 0">
            </div>
        </div>
        <div class="files" v-if="p.files">
            <FileView v-for="(f, i) in p.files" :key="f.url ?? i" :f="f" :has-head="!!(p.reply || p.forwarded_from || (p.show_caption_above_media && text) || p.images)"
                      @play-file="onPlayFile" />
        </div>
        <div class="text" v-if="!p.show_caption_above_media && text" v-html="text" @click="onTextClick"></div>
        <div class="reactions" v-if="p.reactions && p.reactions.length">
            <span class="reaction" v-for="(r, idx) in p.reactions" :key="idx">
                <i v-if="r.custom_emoji_id" class="custom-emoji" :emoji-src="`emoji/${r.custom_emoji_id}`"></i>
                <span v-else class="reaction-emoji">{{r.emoji}}</span>
                <span class="reaction-count" v-if="r.count">{{r.count}}</span>
            </span>
        </div>
        <div class="info font-code unselectable">
            <div class="id">
                <span class="share clickable" @click="share" :title="shareLabel">
                    <i-fas-check v-if="shared" />
                    <i-fas-link v-else />
                </span>
                #{{p.id}}
            </div>
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
import {useTgbMessages} from "@/logic/messages";
import {computed, onMounted, onUnmounted, onUpdated, ref, StyleValue} from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const msg = useTgbMessages()

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

function onTextClick(e: MouseEvent) {
    const target = (e.target as HTMLElement).closest('blockquote[expandable], blockquote.expandable') as HTMLElement | null
    if (target) {
        target.classList.toggle('expanded')
        target.toggleAttribute('open')
    }
}

function initRichContent()
{
    if (!el.value) return
    // Remove empty newline text nodes around block-level elements in .text
    const textEl = el.value.querySelector(".text")
    if (textEl) {
        const isBlock = (n: ChildNode | null) =>
            n && n.nodeType === Node.ELEMENT_NODE &&
            ['P', 'FIGURE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DETAILS', 'HR', 'PRE', 'TABLE', 'UL', 'OL', 'FOOTER'].includes((n as Element).tagName)

        Array.from(textEl.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
                if (isBlock(node.previousSibling) || isBlock(node.nextSibling)) {
                    node.remove()
                }
            }
        })
    }

    // Absolutize rich photo URLs and add click to view full image
    el.value.querySelectorAll<HTMLImageElement>("figure.rich-photo img:not(.init)").forEach(img => {
        img.classList.add("init")
        const rawSrc = img.getAttribute("data-src") || img.getAttribute("src")
        if (rawSrc) {
            img.src = replaceUrl(rawSrc)
        }
        const full = img.getAttribute("data-full")
        if (full) {
            img.setAttribute("data-full", replaceUrl(full))
        }
        img.classList.add("clickable")
        img.addEventListener("click", () => {
            const targetUrl = img.getAttribute("data-full") || img.src
            window.open(targetUrl, "_blank")
        })
    })

    // Render KaTeX for math formulas
    el.value.querySelectorAll<HTMLElement>("code.math:not(.katex-rendered)").forEach(node => {
        node.classList.add("katex-rendered")
        const expr = node.textContent?.trim() || ""
        if (expr) {
            try {
                katex.render(expr, node, { throwOnError: false, displayMode: false })
            } catch (e) {
                console.error("KaTeX render error:", e)
            }
        }
    })

    // Syntax highlighting for code blocks
    el.value.querySelectorAll<HTMLElement>("pre:not(.hljs-rendered)").forEach(pre => {
        pre.classList.add("hljs-rendered")
        let codeEl = pre.querySelector("code")
        const rawCode = (codeEl ? codeEl.textContent : pre.textContent) || ""
        let lang = pre.getAttribute("language") || ""
        if (!lang && codeEl) {
            const classLang = Array.from(codeEl.classList).find(c => c.startsWith("language-") || c.startsWith("lang-"))
            if (classLang) {
                lang = classLang.replace(/^language-|^lang-/, "")
            }
        }

        let highlighted = ""
        let detectedLang = lang
        if (lang && hljs.getLanguage(lang)) {
            try {
                const res = hljs.highlight(rawCode, { language: lang })
                highlighted = res.value
                detectedLang = lang
            } catch (e) {
                console.warn(`Failed to highlight with language ${lang}:`, e)
            }
        }

        if (!highlighted && rawCode.trim()) {
            try {
                const res = hljs.highlightAuto(rawCode)
                highlighted = res.value
                detectedLang = res.language || lang || ""
            } catch {
                highlighted = ""
            }
        }

        if (!codeEl) {
            codeEl = document.createElement("code")
            pre.innerHTML = ""
            pre.appendChild(codeEl)
        }

        if (highlighted) {
            codeEl.innerHTML = highlighted
            codeEl.classList.add("hljs")
        } else {
            codeEl.textContent = rawCode
        }

        // Add code header with language and copy button if not already present
        if (!pre.querySelector(".code-header")) {
            const header = document.createElement("div")
            header.className = "code-header"

            const langSpan = document.createElement("span")
            langSpan.className = "code-lang"
            langSpan.textContent = detectedLang || "code"

            const copyBtn = document.createElement("button")
            copyBtn.className = "code-copy-btn"
            copyBtn.setAttribute("type", "button")
            copyBtn.setAttribute("title", "Copy code")
            copyBtn.innerHTML = `<span>Copy</span>`
            copyBtn.addEventListener("click", async (e) => {
                e.stopPropagation()
                let success = false
                if (navigator.clipboard?.writeText) {
                    try {
                        await navigator.clipboard.writeText(rawCode)
                        success = true
                    } catch {
                        success = false
                    }
                }
                if (!success) {
                    const ta = document.createElement("textarea")
                    ta.value = rawCode
                    ta.style.position = "fixed"
                    ta.style.opacity = "0"
                    document.body.appendChild(ta)
                    ta.select()
                    try {
                        success = document.execCommand("copy")
                    } catch {
                        success = false
                    }
                    document.body.removeChild(ta)
                }
                if (success) {
                    copyBtn.innerHTML = `<span>Copied!</span>`
                    copyBtn.classList.add("copied")
                    setTimeout(() => {
                        copyBtn.innerHTML = `<span>Copy</span>`
                        copyBtn.classList.remove("copied")
                    }, 2000)
                }
            })

            header.appendChild(langSpan)
            header.appendChild(copyBtn)
            pre.insertBefore(header, pre.firstChild)
        }
    })
}

function refreshSize() {
    if (!el.value) return
    sizeScale.value = el.value.clientWidth / 450
}

onMounted(() =>
{
    initEmoji()
    initRichContent()
    refreshSize()
    window.addEventListener('resize', refreshSize)
})

onUpdated(() =>
{
    initEmoji()
    initRichContent()
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

const shared = ref(false)
const shareLabel = computed(() => shared.value ? msg.linkCopied : msg.copyShareLink)

function buildShareUrl(): string
{
    const url = new URL(window.location.href)
    url.searchParams.set('shared', String(p.value.id))
    url.hash = ""
    return url.toString()
}

async function share()
{
    const link = buildShareUrl()
    try
    {
        await navigator.clipboard.writeText(link)
    }
    catch
    {
        // Fallback for non-secure contexts: temporary textarea
        const ta = document.createElement('textarea')
        ta.value = link
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        try { document.execCommand('copy') } catch { /* ignore */ }
        document.body.removeChild(ta)
    }
    shared.value = true
    setTimeout(() => shared.value = false, 1500)
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
    overflow: hidden

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
        padding: 4px 10px 4px 12px
        border-radius: 4px
        background: linear-gradient(45deg, $color-text-main, $color-text-main), rgba(112, 81, 42, 0.08)
        background-size: 2.8px 100%
        background-repeat: no-repeat
        transition: background 0.2s ease

        &:hover
            background: linear-gradient(45deg, $color-text-main, $color-text-main), rgba(112, 81, 42, 0.14)
            background-size: 2.8px 100%
            background-repeat: no-repeat

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

        .reply-quote
            position: relative
            font-style: italic
            display: -webkit-box
            -webkit-line-clamp: 5
            -webkit-box-orient: vertical
            overflow: hidden
            white-space: pre-wrap
            word-break: break-word
            max-height: 7.5em

    .quote-container
        margin: 6px 0

    .reactions
        display: flex
        flex-wrap: wrap
        gap: 6px
        margin-top: 6px

        .reaction
            display: inline-flex
            align-items: center
            gap: 4px
            background: rgba(0, 0, 0, 0.05)
            border-radius: 12px
            padding: 2px 8px
            font-size: 0.85em
            user-select: none

            .reaction-emoji
                font-size: 1.1em

            .reaction-count
                color: $color-text-light
                font-size: 0.9em
                font-weight: 500

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

        .id
            display: flex
            align-items: center
            gap: 5px

        .share
            display: flex
            align-items: center

            &:hover
                color: $color-text-special

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
@use "sass:color"
@use "css/colors" as *

.media_spoiler
    // Hide content with blur
    filter: blur(18px)

.post
    a
        color: $color-text-special
        text-decoration: none

    blockquote
        display: inline-block
        width: fit-content
        max-width: 100%
        box-sizing: border-box
        margin: 4px 0
        padding: 3px 34px 3px 12px
        position: relative
        border-radius: 4px
        background: linear-gradient(45deg, $color-text-special, $color-text-special), rgba(255, 131, 115, 0.12)
        background-size: 2.8px 100%
        background-repeat: no-repeat
        white-space: pre-wrap
        word-break: break-word
        color: inherit

        &::after
            content: ""
            position: absolute
            width: 12px
            height: 12px
            top: 6px
            right: 6px
            background: $color-text-special
            -webkit-mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M3 101q0-18 9-33t24-23.5T68.5 36t32.5 8.5T125 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T39 217l12-24q7-13 11-27-25-3-42-21.5T3 101zm163 0q0-18 9-33t24-23.5 32.5-8.5 32.5 8.5T288 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T202 217l12-24q7-13 11-27-25-3-42-21.5T166 101z'/%3E%3C/svg%3E")
            mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M3 101q0-18 9-33t24-23.5T68.5 36t32.5 8.5T125 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T39 217l12-24q7-13 11-27-25-3-42-21.5T3 101zm163 0q0-18 9-33t24-23.5 32.5-8.5 32.5 8.5T288 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T202 217l12-24q7-13 11-27-25-3-42-21.5T166 101z'/%3E%3C/svg%3E")
            -webkit-mask-size: 100%
            mask-size: 100%

    blockquote[expandable], blockquote.expandable
        position: relative
        cursor: pointer
        transition: all 0.2s ease

        &::before
            content: ""
            position: absolute
            background: $color-text-special
            width: 16px
            height: 16px
            bottom: 4px
            right: 5px
            -webkit-mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M150 182l79-78q3-4 8.5-4t9 3.5 3.5 9-4 8.5l-87 88q-4 4-9 4t-9-4l-87-88q-4-3-4-8.5t3.5-9 9-3.5 8.5 4z'/%3E%3C/svg%3E")
            mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M150 182l79-78q3-4 8.5-4t9 3.5 3.5 9-4 8.5l-87 88q-4 4-9 4t-9-4l-87-88q-4-3-4-8.5t3.5-9 9-3.5 8.5 4z'/%3E%3C/svg%3E")
            -webkit-mask-size: 100%
            mask-size: 100%
            transition: transform 0.2s ease

        &:not([open]):not(.expanded)
            display: -webkit-box
            -webkit-box-orient: vertical
            -webkit-line-clamp: 3
            line-clamp: 3
            max-height: 4.5em
            text-overflow: ellipsis
            overflow: hidden

        &[open]::before, &.expanded::before
            transform: rotate(180deg)

        &[open], &.expanded
            display: block
            -webkit-line-clamp: none
            line-clamp: none
            max-height: none

    p
        margin: 4px 0
        &:first-child
            margin-top: 0
        &:last-child
            margin-bottom: 0

    h1, h2, h3, h4, h5, h6
        font-family: inherit
        font-weight: bold
        margin: 0
        padding: 0.6rem 0 0.4rem 0
        line-height: 1.3
        color: inherit

    h1
        font-size: 1.25em
    h2
        font-size: 1.15em
    h3
        font-size: 1.05em
    h4, h5, h6
        font-size: 1em

    ol, ul
        margin: 6px 0
        padding-left: 24px

    li
        margin: 3px 0
        > p
            margin: 0
            display: inline

    pre
        background: rgba(0, 0, 0, 0.05)
        border-radius: 8px
        margin: 12px 0
        overflow: hidden
        font-size: 0.9em
        position: relative
        box-sizing: border-box

        .code-header
            display: flex
            justify-content: space-between
            align-items: center
            padding: 5px 12px
            background: rgba(0, 0, 0, 0.03)
            border-bottom: 1px solid rgba(0, 0, 0, 0.06)
            font-size: 0.75em
            font-weight: 600
            color: $color-text-light
            text-transform: uppercase
            letter-spacing: 0.5px
            user-select: none

            .code-lang
                font-family: inherit

            .code-copy-btn
                background: none
                border: none
                color: $color-text-light
                cursor: pointer
                font-size: 0.85em
                display: flex
                align-items: center
                gap: 4px
                padding: 2px 8px
                border-radius: 4px
                font-family: inherit
                font-weight: 600
                transition: color 0.2s ease, background 0.2s ease

                &:hover
                    color: $color-text-special
                    background: rgba(0, 0, 0, 0.06)

                &.copied
                    color: #34c759

        code
            display: block
            font-family: monospace
            padding: 10px 14px
            overflow-x: auto
            background: none
            border-radius: 0
            line-height: 1.45

        code.hljs
            background: transparent !important
            color: inherit
            padding: 10px 14px

    .rich-photo
        margin: 6px -20px 8px
        text-align: center

        &:first-child
            margin-top: -12px

        &:last-child
            margin-bottom: -8px

        img
            width: 100%
            max-width: 100%
            height: auto
            border-radius: 0
            display: block
            margin: 0 auto

        figcaption
            font-size: 0.85em
            color: $color-text-light
            text-align: center
            margin-top: 4px
            padding: 0 20px

    .rich-table
        width: 100%
        border-collapse: collapse
        margin: 12px 0
        font-size: 0.9em
        border-radius: 8px
        overflow: hidden

        caption
            font-weight: bold
            font-size: 0.95em
            padding: 6px 0
            text-align: center
            color: inherit

        th, td
            padding: 8px 12px
            text-align: left
            vertical-align: top
            overflow-wrap: anywhere

        th
            background: rgba(0, 0, 0, 0.05)
            font-weight: bold

        &.bordered
            border: 1px solid rgba(0, 0, 0, 0.1)

            th, td
                border: 1px solid rgba(0, 0, 0, 0.1)

        &.striped tbody tr:nth-child(odd)
            background: rgba(0, 0, 0, 0.02)

    ul.checklist
        list-style: none
        padding-left: 2px
        margin: 6px 0

        li.check-item
            display: flex
            align-items: center
            gap: 8px
            margin: 4px 0
            line-height: 1.4

            input[type="checkbox"]
                appearance: none
                -webkit-appearance: none
                width: 16px
                height: 16px
                border: 1.5px solid rgba(0, 0, 0, 0.25)
                border-radius: 3px
                margin: 0
                cursor: default
                position: relative
                flex-shrink: 0

                &:checked
                    background-color: $color-text-special
                    border-color: $color-text-special

                    &::after
                        content: ""
                        position: absolute
                        left: 4px
                        top: 1px
                        width: 4px
                        height: 8px
                        border: solid white
                        border-width: 0 2px 2px 0
                        transform: rotate(45deg)

            p
                margin: 0

    details
        margin: 8px 0

        summary
            cursor: pointer
            font-weight: bold
            display: flex
            align-items: center
            gap: 6px
            padding: 6px 0
            user-select: none
            list-style: none
            outline: none

            &::-webkit-details-marker
                display: none

            &::before
                content: ""
                display: inline-block
                width: 14px
                height: 14px
                background: currentColor
                -webkit-mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E")
                mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E")
                -webkit-mask-size: 100%
                mask-size: 100%
                transition: transform 0.2s ease-in-out

        &[open] > summary::before
            transform: rotate(90deg)

        > *:not(summary)
            margin: 4px 0 6px 20px

    .rich-button-row
        display: flex
        gap: 8px
        margin: 8px 0
        flex-wrap: wrap

        &.align-center
            justify-content: center
        &.align-right
            justify-content: flex-end

    .rich-button
        display: inline-flex
        align-items: center
        justify-content: center
        padding: 6px 18px
        margin: 4px 6px 4px 0
        min-height: 32px
        box-sizing: border-box
        border-radius: 1000px
        font-weight: 600
        font-size: 0.88em
        text-align: center
        text-decoration: none !important
        transition: background-color 0.2s ease, opacity 0.2s ease
        line-height: 1.2

        &.default
            color: inherit
            background: rgba(0, 0, 0, 0.08)
            &:hover
                background: rgba(0, 0, 0, 0.14)

        &.primary
            background: $color-text-special
            color: white !important
            &:hover
                opacity: 0.9

        &.success
            background: rgba(47, 174, 73, 0.12)
            color: #2fae49 !important
            &:hover
                background: rgba(47, 174, 73, 0.2)

        &.danger
            background: rgba(223, 63, 64, 0.12)
            color: #df3f40 !important
            &:hover
                background: rgba(223, 63, 64, 0.2)

    .rich-footer
        font-size: 0.88em
        color: $color-text-light
        margin: 12px 0
        font-style: normal
        line-height: 1.4

    .pullquote
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        margin: 14px auto
        padding: 10px 28px
        width: fit-content
        max-width: 90%
        border-radius: 6px
        background: rgba(255, 131, 115, 0.12)
        background-size: auto
        border: none
        text-align: center
        font-style: italic
        position: relative

        &::before, &::after
            display: none

        cite
            display: block
            font-style: normal
            font-weight: bold
            font-size: 0.88em
            color: $color-text-special
            margin-top: 4px
            text-align: center

    cite
        display: block
        font-size: 0.88em
        font-weight: bold
        color: $color-text-special
        margin-top: 4px
        font-style: normal

    hr
        border: none
        height: 1px
        background: rgba(0, 0, 0, 0.12)
        width: 33.333%
        margin: 16px auto

    code.math
        background: transparent !important
        border: none
        padding: 0 2px
        font-size: 1.15em
        color: inherit

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
