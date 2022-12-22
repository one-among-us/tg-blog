<template>
    <div class="error tgb-card" v-if="fail">
        <h2>Failed loading posts from: <br>{{postsUrl}}</h2>
        {{fail}}
    </div>
    <div v-infinite-scroll="infiniteScroll" id="Life" v-if="posts.length !== 0">
        <PostView :p="posts[i]" :postsUrl="postsUrl" v-for="(n, i) in count" :key="i"
                  @play="a => audio = a" @click-img="ii => img = postImgIndex[i] + ii" @click-reply="id => clickReply(i, id)"
                  :class="{shake: replyShake === i}" />
    </div>
    <AudioPlayer :audio="audio" v-if="audio"
                 @prev="audioNext(-1)" @next="audioNext(1)"/>
    <ImageViewer :imgs="imgList" v-model:index="img" />
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import moment from "moment";
import {Prop} from "vue-property-decorator";
import {Post, TGFile} from "@/logic/models";
import PostView from "@/views/PostView.vue";
import { initSpoilers } from '@/logic/spoilers';
import AudioPlayer from "@/views/AudioPlayer.vue";
import ImageViewer, {TrackedImage, ViewedImage} from "@/views/ImageViewer.vue";

@Options({components: {ImageViewer, AudioPlayer, PostView}})
export default class TgBlog extends Vue
{
    // Post URL for loading the posts
    @Prop({required: true}) postsUrl: string

    // Loaded posts
    posts: Post[] = []

    // Constants: imgList and postImgIndex are computed based on posts
    imgList: TrackedImage[]
    postImgIndex: number[]

    // Currently shown number of posts (used for infinite scroll)
    count = 20

    // Audio player will be open when audio != null, and image viewer will be open when img != -1
    audio?: TGFile = null
    img: number = -1

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
    
    replaceUrl(url: string): string
    {
        return new URL(url, this.postsUrl).toString();
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

    clickReply(fromId: number, id: number)
    {
        console.log(`Reply id ${id} clicked`)

        // Check if reply message is loaded, if not, load
        const index = this.postIdIndex[id]
        console.log(this.count, index)
        if (index > this.count)
        {
            console.log("Setting count to index")
            this.count = index + 1
        }

        console.log("Jumping")
        this.jumpToReply(fromId, id, index)
    }

    jumpToReply(fromId: number, id: number, index: number)
    {
        // Did it load yet?
        const el = document.getElementById(`message-${id}`)
        if (!el)
        {
            // No, wait for another 50ms
            return setTimeout(() => this.jumpToReply(fromId, id, index), 50)
        }
        // Yes, jump
        el.scrollIntoView({ behavior: 'smooth', block: fromId > id ? 'end' : 'start' })
        // TODO: Emphasize post
    }

    async created(): Promise<void>
    {
        try
        {
            this.posts = await (await fetch(this.postsUrl)).json()
            this.posts.forEach(it => it.date = moment(it.date).format('YYYY-MM-DD h:mm'))
            this.posts.reverse()
            this.posts = this.posts.filter(it => it.type !== 'service')

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

#Life
    margin: 20px auto
    font-size: 1em
    width: min(450px, 80vw)
    color: $color-text-main

    #header
        color: $color-text-light
        margin-bottom: 30px

// Phone layout
@media screen and (max-width: 570px)
    #Life
        margin: 20px 20px 0
        width: unset

*
    transition: all .25s ease
</style>
