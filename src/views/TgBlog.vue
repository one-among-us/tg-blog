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

        <div v-infinite-scroll="infiniteScroll" :infinite-scroll-distance="50" v-if="posts.length !== 0">
            <PostView :p="searchedPosts[i]" :postsUrl="purl" v-for="(n, i) in searchedCount" :key="searchedPosts[i].id"
                      @play-file="a => audio = a" @click-img="ii => img = postImgIndex[i] + ii" @click-reply="clickReply"
                      :class="{shake: replyShake.includes(i)}" />
        </div>

        <AudioPlayer :audio="audio" v-if="audio"
                     @prev="audioNext(-1)" @next="audioNext(1)"/>
        <ImageViewer :imgs="imgList" v-model:index="img" />
    </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import {Post, TGFile} from "@/logic/models";
import PostView from "@/views/PostView.vue";
import {initSpoilers} from '@/logic/spoilers';
import ImageViewer, {TrackedImage} from "@/views/ImageViewer.vue";
import {computed, defineAsyncComponent, onBeforeMount, onMounted, onUnmounted, onUpdated, ref} from "vue";

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

// Currently shown number of posts (used for infinite scroll)
const count = ref(20)

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

const searchedCount = computed((): number =>
{
    return Math.min(count.value, searchedPosts.value.length)
})

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
})

function replaceUrl(url: string): string
{
    return new URL(url, purl.value).toString();
}

function infiniteScroll()
{
    console.log("Infinite Scroll - Load more")
    count.value = Math.min(count.value + 10, posts.value.length)
}

const postIdIndex = computed((): {[index: number]: number} =>
{
    // Mapping of post id to post index in the array
    return Object.fromEntries(posts.value.map((it, i) => [it.id, i]))
})

function clickReply(id: number)
{
    if (replyLoading.value) return

    // Check if reply message is loaded, if not, load
    const index = postIdIndex.value[id]
    if (index > count.value)
    {
        replyLoading.value = true
        count.value = Math.min(index + 10, posts.value.length)
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
    let sh: (Event) => void;
    const fallback = setTimeout(() => {
        shake()
        window.removeEventListener('scroll', sh)
    }, 1000)

    // Try to listen to scroll events
    let scrollTimeout;
    sh = () => {
        // Still scrolling, reset the timeout to 100ms
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            clearTimeout(fallback)
            // Done scrolling
            shake()

            // Remove listener
            window.removeEventListener('scroll', sh)
        }, 100);
    }
    window.addEventListener('scroll', sh);
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
        count.value = Math.min(count.value, posts.value.length)

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
@import "src/css/colors"
@import "src/css/global"

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
