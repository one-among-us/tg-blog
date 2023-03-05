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

        <div v-infinite-scroll="infiniteScroll" v-if="posts.length !== 0">
            <PostView :p="searchedPosts[i]" :postsUrl="purl" v-for="(n, i) in searchedCount" :key="searchedPosts[i].id"
                      @play-file="a => audio = a" @click-img="ii => img = postImgIndex[i] + ii" @click-reply="clickReply"
                      :class="{shake: replyShake.includes(i)}" />
        </div>

        <AudioPlayer :audio="audio" v-if="audio"
                     @prev="audioNext(-1)" @next="audioNext(1)"/>
        <ImageViewer :imgs="imgList" v-model:index="img" />
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import moment from "moment";
import {Prop, Ref} from "vue-property-decorator";
import {Post, TGFile} from "@/logic/models";
import PostView from "@/views/PostView.vue";
import { initSpoilers } from '@/logic/spoilers';
import ImageViewer, {TrackedImage} from "@/views/ImageViewer.vue";

@Options({components: {
    PostView, ImageViewer,
    AudioPlayer: defineAsyncComponent(() => import("./AudioPlayer.vue"))
}})
export default class TgBlog extends Vue
{
    // Post URL for loading the posts
    @Prop({required: true}) postsUrl: string
    @Prop() postsData?: Post[]

    // Whether to add margins
    @Prop({default: true}) margins: boolean

    @Ref('searchEl') searchEl: HTMLInputElement

    get purl() { return new URL(this.postsUrl, document.location.href).href }

    search: string = ""

    // Loaded posts
    posts: Post[] = []

    // Constants: imgList and postImgIndex are computed based on posts
    imgList: TrackedImage[] = null
    postImgIndex: number[]

    // Currently shown number of posts (used for infinite scroll)
    count = 20

    // Audio player will be open when audio != null, and image viewer will be open when img != -1
    audio?: TGFile = null
    img: number = -1

    // The indicies of the post that's currently shaking
    replyShake = []
    replyLoading = false

    // Whether loading failed
    fail: string = null

    get audios(): TGFile[]
    {
        return this.posts.filter(p => p.files?.at(0)?.media_type == "audio_file").flatMap(p => p.files)
    }

    audioNext(off: number)
    {
        this.audio = this.audios.at(this.audios.indexOf(this.audio) + off)
    }

    get searchedPosts(): Post[]
    {
        let q = this.search.toLowerCase()
        if (!q) return this.posts
        let res = this.posts

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
    }

    get searchedCount(): number {
        return Math.min(this.count, this.searchedPosts.length)
    }

    onKey(e: KeyboardEvent)
    {
        // Ctrl+F to search
        if ((e.ctrlKey || e.metaKey) && e.code == 'KeyF')
        {
            this.searchEl.focus()
            this.searchEl.scrollIntoView({block: 'center'})

            e.stopPropagation()
            e.preventDefault()
        }
    }

    onHashChange(e: HashChangeEvent)
    {
        const h = window.location.hash
        console.log("Hash change", e.newURL, h)

        if (!h) return;

        // Search for hashtag
        this.search = h
        window.location.hash = ""
        this.searchEl.scrollIntoView({block: 'center'})
        e.preventDefault()
        e.stopPropagation()
    }

    mounted()
    {
        document.addEventListener('keydown', this.onKey)
        window.addEventListener('hashchange', this.onHashChange)
    }

    unmounted()
    {
        document.removeEventListener('keydown', this.onKey)
        window.removeEventListener('hashchange', this.onHashChange)
    }

    replaceUrl(url: string): string
    {
        return new URL(url, this.purl).toString();
    }

    infiniteScroll()
    {
        console.log("Infinite Scroll - Load more")
        this.count = Math.min(this.count + 10, this.posts.length)
    }

    get postIdIndex(): {[index: number]: number}
    {
        // Mapping of post id to post index in the array
        return Object.fromEntries(this.posts.map((it, i) => [it.id, i]))
    }

    clickReply(id: number)
    {
        if (this.replyLoading) return

        // Check if reply message is loaded, if not, load
        const index = this.postIdIndex[id]
        if (index > this.count)
        {
            this.replyLoading = true
            this.count = Math.min(index + 10, this.posts.length)
        }

        this.jumpToReply(id, index)
    }

    jumpToReply(id: number, index: number)
    {
        // Did it load yet?
        const el = document.getElementById(`message-${id}`)
        if (!el)
        {
            // No, wait for another 50ms
            return setTimeout(() => this.jumpToReply(id, index), 50)
        }
        // Yes, jump
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        this.replyLoading = false

        // Try to listen to scroll end and shake posts when scrolling is done
        const shake = () => {
            // Shake the post
            this.replyShake = [...this.replyShake, index]
            setTimeout(() => this.replyShake = this.replyShake.filter(it => it != index), 1500)
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
        sh = e => {
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

    async created(): Promise<void>
    {
        try
        {
            if (this.postsData) this.posts = this.postsData
            else this.posts = await (await fetch(this.purl)).json()
            this.posts.forEach(it => it.date = moment(it.date).format('YYYY-MM-DD h:mm'))
            this.posts.reverse()
            this.posts = this.posts.filter(it => it.type !== 'service')
            this.count = Math.min(this.count, this.posts.length)

            // Replace URLs
            this.posts.forEach(it =>
            {
                it.images?.forEach(img => img.url = this.replaceUrl(img.url))
                if (it.reply?.thumb) it.reply.thumb = this.replaceUrl(it.reply.thumb)
                it.files?.forEach(f =>
                {
                    f.url = this.replaceUrl(f.url)
                    if (f.thumb) f.thumb = this.replaceUrl(f.thumb)
                })
            })

            // Index images
            this.imgList = this.posts.flatMap((post, pi) => (post.images ?? []).map(img => {
                return {
                    url: img.url,
                    text: post.text,
                    author: post.author ?? (typeof post.forwarded_from == 'string' ? post.forwarded_from : post.forwarded_from?.name),
                    date: post.date,
                    postIndex: pi
                }
            }))
            this.postImgIndex = new Array(this.posts.length).fill(null)
            this.imgList.forEach((img, i) => {
                if (this.postImgIndex[img.postIndex] === null)
                    this.postImgIndex[img.postIndex] = i
            })
            console.log(this.imgList)
            console.log(this.postImgIndex)

            setTimeout(() => initSpoilers(), 100);
        }
        catch (e)
        {
            console.log(e)
            this.fail = e
        }
    }

    updated(): void
    {
        initSpoilers()
    }
}
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
