<template>
    <div class="tg-blog" :class="{margins: margins}">
        <slot></slot>

        <div class="search">
            <input v-model="search" ref="searchEl" placeholder="Search...">
            <i-ic-round-search />
        </div>

        <div class="error tgb-card" v-if="fail">
            <h2>Failed loading posts from: <br>{{purl}}</h2>
            {{fail}}
        </div>

        <div v-infinite-scroll="loadBelow" :infinite-scroll-distance="50"
             :infinite-scroll-disabled="endIdx >= searchedPosts.length"
             v-if="posts.length !== 0">
            <div ref="topSentinel" class="top-sentinel" v-if="startIdx > 0"></div>
            <PostView :p="searchedPosts[startIdx + i]" :postsUrl="purl"
                      v-for="(_, i) in (endIdx - startIdx)" :key="searchedPosts[startIdx + i].id"
                      @play-file="a => audio = a" @click-img="ii => openImage(searchedPosts[startIdx + i], ii)"
                      @click-reply="clickReply"
                      :class="{shake: replyShake.includes(startIdx + i)}" />
        </div>

        <AudioPlayer :audio="audio" v-if="audio"
                     @prev="audioNext(-1)" @next="audioNext(1)"/>
        <ImageViewer :imgs="activeImgList" v-model:index="img" />
    </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import {Post, TGFile} from "@/logic/models";
import PostView from "@/views/PostView.vue";
import {initSpoilers} from '@/logic/spoilers';
import ImageViewer, {TrackedImage} from "@/views/ImageViewer.vue";
import {computed, defineAsyncComponent, nextTick, onBeforeMount, onMounted, onUnmounted, onUpdated, ref, watch} from "vue";

const AudioPlayer = defineAsyncComponent(() => import("./AudioPlayer.vue"))

// Post URL for loading the posts
const props = withDefaults(defineProps<{
    postsUrl: string
    postsData?: Post[]
    margins?: boolean
}>(), {
    margins: true
})
const margins = computed(() => props.margins)

const searchEl = ref<HTMLInputElement>()
const purl = computed(() => new URL(props.postsUrl, document.location.href).href)

const search = ref("")

// Loaded posts
const posts = ref<Post[]>([])

// Constants: imgList and postImgIndex are computed based on posts
const imgList = ref<TrackedImage[]>([])
const postImgIndex = ref<number[]>([])

// Bi-directional infinite scroll window over searchedPosts: [startIdx, endIdx)
const PAGE_SIZE = 20
const LOAD_STEP = 10
const startIdx = ref(0)
const endIdx = ref(PAGE_SIZE)

// Sentinel for upward scroll
const topSentinel = ref<HTMLElement | null>(null)
let topObserver: IntersectionObserver | null = null
// Suppress upward-load observer until initial scroll (e.g. for ?shared) settles.
const upwardScrollReady = ref(false)

// Audio player will be open when audio != null, and image viewer will be open when img != -1
const audio = ref<TGFile | null>(null)
const img = ref(-1)

// The indicies of the post that's currently shaking
const replyShake = ref<number[]>([])
const replyLoading = ref(false)

// Whether loading failed
const fail = ref<string | null>(null)

const audios = computed((): TGFile[] =>
{
    return posts.value.filter(p => p.files?.at(0)?.media_type == "audio_file").flatMap(p => p.files)
})

function audioNext(off: number)
{
    audio.value = audios.value.at(audios.value.indexOf(audio.value) + off)
}

const searchedPosts = computed((): Post[] =>
{
    let q = search.value.toLowerCase()
    if (!q) return posts.value
    let res = posts.value

    function take(len: number): string
    {
        let tk: string
        [tk, q] = q.split(" ", 2)
        return tk.substring(len)
    }

    // Take all specific queries
    while (q)
    {
        if (q.startsWith("id:"))
        {
            let id = take(3)
            console.log(id)
            res = res.filter(p => p.id + "" == id)
            continue
        }

        if (q.startsWith("author:"))
        {
            let author = take(7)
            res = res.filter(p => p.author.toLowerCase().startsWith(author))
            continue
        }

        if (q.startsWith("date:"))
        {
            let date = take(5)
            res = res.filter(p => p.date.includes(date))
            continue
        }

        break
    }

    if (!q) return res
    return res.filter(p => p.text && p.text.toLowerCase().includes(q))
})

// Reset window when the searched set changes (e.g., user types in search box).
// We don't reset on initial post load — that path is handled in onBeforeMount.
watch(searchedPosts, (n, o) =>
{
    if (!o || o.length === 0) return
    startIdx.value = 0
    endIdx.value = Math.min(PAGE_SIZE, n.length)
})

const globalPostImgIndexById = computed((): {[postId: number]: number} =>
{
    return Object.fromEntries(posts.value.map((post, i) => [post.id, postImgIndex.value[i]]))
})

const searchedImageContext = computed((): {imgs: TrackedImage[], postImgIndexById: {[postId: number]: number}} =>
{
    if (!search.value) return {imgs: imgList.value, postImgIndexById: globalPostImgIndexById.value}

    const imgs: TrackedImage[] = []
    const filteredPostImgIndexById: {[postId: number]: number} = {}
    searchedPosts.value.forEach(post =>
    {
        if (!post.images?.length) return
        const pi = postIdIndex.value[post.id]
        if (pi === undefined) return
        const start = postImgIndex.value[pi]
        if (start === undefined) return
        filteredPostImgIndexById[post.id] = imgs.length
        imgs.push(...imgList.value.slice(start, start + post.images.length))
    })
    return {imgs, postImgIndexById: filteredPostImgIndexById}
})

const activeImgList = computed(() => searchedImageContext.value.imgs)

watch(activeImgList, (newImgs, oldImgs) =>
{
    if (img.value < 0) return
    const current = oldImgs?.[img.value]
    if (!current)
    {
        img.value = -1
        return
    }
    const nextIndex = newImgs.findIndex(it => it.url === current.url)
    img.value = nextIndex < 0 ? -1 : nextIndex
})

function openImage(post: Post, imageOffset: number)
{
    const start = searchedImageContext.value.postImgIndexById[post.id]
    if (start === undefined) return
    img.value = start + imageOffset
}

function onKey(e: KeyboardEvent)
{
    // Ctrl+F to search
    if ((e.ctrlKey || e.metaKey) && e.code == 'KeyF')
    {
        if (!searchEl.value) return
        searchEl.value.focus()
        searchEl.value.scrollIntoView({block: 'center'})

        e.stopPropagation()
        e.preventDefault()
    }
}

function onHashChange(e: HashChangeEvent)
{
    const h = window.location.hash
    console.log("Hash change", e.newURL, h)

    if (!h) return;

    // Search for hashtag
    search.value = decodeURIComponent(h)
    window.location.hash = ""
    searchEl.value?.scrollIntoView({block: 'center'})
    e.preventDefault()
    e.stopPropagation()
}

onMounted(() =>
{
    document.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHashChange)
})

onUnmounted(() =>
{
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('hashchange', onHashChange)
    topObserver?.disconnect()
})

function replaceUrl(url: string): string
{
    return new URL(url, purl.value).toString();
}

function parseSharedId(): number | null
{
    const raw = new URL(window.location.href).searchParams.get('shared')
    if (raw === null) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
}

function loadBelow()
{
    const n = searchedPosts.value.length
    if (endIdx.value >= n) return
    endIdx.value = Math.min(endIdx.value + LOAD_STEP, n)
}

function loadAbove()
{
    if (!upwardScrollReady.value) return
    if (startIdx.value <= 0) return

    // Preserve scroll position when prepending posts above the viewport.
    // Anchor on the first post currently rendered: record its viewport offset
    // before, then scroll so it lands at the same offset after the prepend.
    const anchorPost = searchedPosts.value[startIdx.value]
    const anchorEl = anchorPost ? document.getElementById(`message-${anchorPost.id}`) : null
    const beforeTop = anchorEl ? anchorEl.getBoundingClientRect().top : 0

    startIdx.value = Math.max(0, startIdx.value - LOAD_STEP)

    nextTick(() =>
    {
        if (!anchorEl) return
        const afterTop = anchorEl.getBoundingClientRect().top
        window.scrollBy({top: afterTop - beforeTop, behavior: 'auto'})
    })
}

function setupTopObserver()
{
    topObserver?.disconnect()
    if (!topSentinel.value) return
    topObserver = new IntersectionObserver(entries =>
    {
        if (entries.some(e => e.isIntersecting)) loadAbove()
    }, {rootMargin: '200px 0px 0px 0px'})
    topObserver.observe(topSentinel.value)
}

watch(topSentinel, () => setupTopObserver())

const postIdIndex = computed((): {[index: number]: number} =>
{
    // Mapping of post id to post index in the array
    return Object.fromEntries(posts.value.map((it, i) => [it.id, i]))
})

function clickReply(id: number)
{
    if (replyLoading.value) return

    const list = searchedPosts.value
    const index = list.findIndex(p => p.id === id)
    if (index < 0) return

    // If the target is outside the rendered window, extend the window toward it.
    if (index < startIdx.value)
    {
        replyLoading.value = true
        startIdx.value = Math.max(0, index - LOAD_STEP)
    }
    else if (index >= endIdx.value)
    {
        replyLoading.value = true
        endIdx.value = Math.min(list.length, index + LOAD_STEP)
    }

    jumpToReply(id, index)
}

function jumpToReply(id: number, index: number)
{
    // Did it load yet?
    const el = document.getElementById(`message-${id}`)
    if (!el)
    {
        // No, wait for another 50ms
        return setTimeout(() => jumpToReply(id, index), 50)
    }
    // Yes, jump
    el.scrollIntoView({behavior: 'smooth', block: 'center'})
    replyLoading.value = false

    // Try to listen to scroll end and shake posts when scrolling is done
    const shake = () => {
        // Shake the post
        replyShake.value = [...replyShake.value, index]
        setTimeout(() => replyShake.value = replyShake.value.filter(it => it != index), 1500)
    }

    // The below code doesn't work when the post is already at the scrolled position.
    // So we have to set another timeout: If nothing moves in 1 second, shake it
    let scrollHandler: (e: Event) => void;
    const fallback = setTimeout(() => {
        shake()
        window.removeEventListener('scroll', scrollHandler)
    }, 1000)

    // Try to listen to scroll events
    let scrollTimeout;
    scrollHandler = () => {
        // Still scrolling, reset the timeout to 100ms
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            clearTimeout(fallback)
            // Done scrolling
            shake()

            // Remove listener
            window.removeEventListener('scroll', scrollHandler)
        }, 100);
    }
    window.addEventListener('scroll', scrollHandler);
}

onBeforeMount(async (): Promise<void> =>
{
    try
    {
        if (props.postsData) posts.value = props.postsData
        else posts.value = await (await fetch(purl.value)).json()
        posts.value.forEach(it => it.date = moment(it.date).format('YYYY-MM-DD H:mm'))
        posts.value.reverse()
        posts.value = posts.value.filter(it => it.type !== 'service')

        // Initial window: try ?shared={id}, otherwise top of feed.
        const sharedId = parseSharedId()
        let anchor = -1
        if (sharedId !== null) anchor = posts.value.findIndex(p => p.id === sharedId)

        if (anchor >= 0)
        {
            const half = Math.floor(PAGE_SIZE / 2)
            startIdx.value = Math.max(0, anchor - half)
            endIdx.value = Math.min(posts.value.length, anchor + half)
        }
        else
        {
            startIdx.value = 0
            endIdx.value = Math.min(PAGE_SIZE, posts.value.length)
        }

        // Replace URLs
        posts.value.forEach(it =>
        {
            it.images?.forEach(img => img.url = replaceUrl(img.url))
            if (it.reply?.thumb) it.reply.thumb = replaceUrl(it.reply.thumb)
            it.files?.forEach(f =>
            {
                f.url = replaceUrl(f.url)
                if (f.thumb) f.thumb = replaceUrl(f.thumb)
            })
        })

        // Index images
        imgList.value = posts.value.flatMap((post, pi) => (post.images ?? []).map(img => {
            return {
                url: img.url,
                text: post.text,
                author: post.author ?? (typeof post.forwarded_from == 'string' ? post.forwarded_from : post.forwarded_from?.name),
                date: post.date,
                postIndex: pi
            }
        }))
        postImgIndex.value = new Array(posts.value.length).fill(null)
        imgList.value.forEach((img, i) => {
            if (postImgIndex.value[img.postIndex] === null)
                postImgIndex.value[img.postIndex] = i
        })
        console.log(imgList.value)
        console.log(postImgIndex.value)

        setTimeout(() => initSpoilers(), 100);

        // Jump to shared post if requested.
        const sid = parseSharedId()
        if (sid !== null)
        {
            const idx = posts.value.findIndex(p => p.id === sid)
            if (idx >= 0)
            {
                // Wait for DOM to render the windowed posts before scrolling.
                setTimeout(() => jumpToReply(sid, idx), 50)
                // Allow upward loading once the user has had a moment to land at
                // the shared post — otherwise the observer fires immediately and
                // prepends posts before the scroll-to-shared completes.
                setTimeout(() => upwardScrollReady.value = true, 1500)
            }
            else upwardScrollReady.value = true
        }
        else upwardScrollReady.value = true
    }
    catch (e)
    {
        console.log(e)
        fail.value = e as string
    }
})

onUpdated((): void =>
{
    initSpoilers()
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *
@use "css/global" as *

.search
    width: 100%
    margin-bottom: 20px
    padding: 0.5em 1em
    box-sizing: border-box

    display: flex
    align-items: center

    border-radius: 999px
    background: $color-bg-card
    box-shadow: var(--tgb-shadow)
    overflow: hidden

    input
        flex: 1
        border: none
        background: transparent
        color: inherit

    input::placeholder
        color: $color-text-light

    input:focus-visible
        outline: none

.top-sentinel
    height: 1px
    width: 100%

.tg-blog.margins
    margin-top: 20px
    margin-bottom: 20px

.tg-blog
    margin-left: auto
    margin-right: auto
    width: 450px
    color: $color-text-main

    text-align: center
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale

    // Phone layout
    @media screen and (max-width: 490px)
        margin: 20px 20px 0
        width: unset

    *
        transition: all .25s ease

// Animations
.shake
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both
    transform: translate3d(0, 0, 0)

@keyframes shake
    10%, 90%
        transform: translate3d(-1px, 0, 0)

    20%, 80%
        transform: translate3d(2px, 0, 0)

    30%, 50%, 70%
        transform: translate3d(-4px, 0, 0)

    40%, 60%
        transform: translate3d(4px, 0, 0)
</style>
