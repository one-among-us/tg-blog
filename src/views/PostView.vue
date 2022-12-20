<template>
    <div class="post tgb-card" :id="`message-${p.id}`" :class="{'service': p.type === 'service'}">
        <div class="head unselectable">
            <div class="forward" v-if="p.forwarded_from">
                Forwarded from: <a :href="fwdUrl">{{fwdName}}</a>
            </div>
        </div>
        <div class="reply undraggable clickable" v-if="p.reply" @click="clickReply">
            <img class="thumb" v-if="p.reply.thumb" :src="p.reply.thumb" alt="">
            <div class="mtext">
                <div class="reply-to">Reply to:</div>
                <div class="reply-text" v-html="p.reply.text"></div>
            </div>
        </div>
<!--        <div class="images" v-if="p.images && p.images.length === 1" :class="{'has-head': p.reply || p.forwarded_from}">-->
<!--            <img v-for="i in p.images" :key="i.url" :src="i.url" alt="image">-->
<!--        </div>-->
        <div class="images" v-if="p.images" :class="{'has-head': p.reply || p.forwarded_from}">
            <el-image class="img" v-for="i in p.images" :key="i[0]" :src="i.url"
                 :style="{...getImageStyle(p, i)}" :preview-src-list="imgList" :infinite="false"></el-image>
        </div>
        <div class="files" v-if="p.files">
            <FileView v-for="f in p.files" :f="f" :has-head="!!(p.reply || p.forwarded_from || p.images)"
                      @play="e => $emit('play', e)" />
        </div>
        <div class="text" v-html="text"></div>
        <div class="info font-code unselectable">
            <div class="id">#{{p.id}}</div>
            <div class="f-grow1"></div>
            <div class="author" v-if="p.author">{{p.author}}</div>
            <div class="date">{{p.date}}</div>
            <div class="views" v-if="p.views">{{p.views}}<i class="fas fa-eye"/></div>
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Prop} from "vue-property-decorator";
import {Image, Post, ForwardFrom} from "@/logic/models";
import {mdParseInline} from '@/logic/spoilers';
import FileView from "@/views/FileView.vue";

@Options({components: {FileView}})
export default class PostView extends Vue
{
    @Prop({required: true}) p!: Post
    @Prop({required: true}) postsUrl: string
    @Prop({required: true}) imgList!: string[]

    get text(): string | undefined
    {
        if (!this.p.text) return undefined
        return mdParseInline(this.p.text)
    }

    get fwdUrl() { return typeof this.p.forwarded_from == 'string' ? undefined : this.p.forwarded_from.url }
    get fwdName() { return typeof this.p.forwarded_from == 'string' ? this.p.forwarded_from : this.p.forwarded_from.name }

    getImageStyle(post: Post, i: Image): object
    {
        return {}
    }

    clickReply()
    {
        // Scroll to the reply message
        document.getElementById(`message-${this.p.reply.id}`).scrollIntoView({ behavior: 'smooth', block: 'end'})
    }

    mounted()
    {
        this.initEmoji()
    }

    replaceUrl(url: string): string
    {
        return new URL(url, this.postsUrl).toString();
    }

    /**
     * Initialize custom emojis
     */
    initEmoji()
    {
        // Find all non-initialized emojis
        document.querySelectorAll("i.custom-emoji:not(.init)").forEach(it => {
            // Read attributes
            const src = this.replaceUrl(it.getAttribute("emoji-src"))
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
}
</script>

<style lang="sass" scoped>
@import "src/css/global"
@import "src/css/colors"
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
        //font-size: 0.9em

        .thumb
            margin-left: 10px
            height: 35px
            width: 35px
            object-fit: cover

        .mtext
            flex-grow: 1
            margin-left: 10px
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
        border: 2px solid lighten($color-text-main, 20)
        border-radius: 2px

    .images.has-head
        margin: 0 -20px 10px

    .images
        margin: -20px -20px 10px
        display: flex

        .img
            flex: 1
            height: 200px
            width: 200px
            background-size: cover
            background-repeat: no-repeat
            background-position: center

            margin-right: 2px

        .img:last-child
            margin-right: 0

        img
            max-width: 100%
            min-width: 100%
            width: auto
            height: auto

    .text
        white-space: pre-line
        overflow-wrap: break-word

    .info
        display: flex
        color: lighten($color-text-main, 40)
        white-space: nowrap
        overflow: hidden
        font-size: 0.9em
        gap: 10px

        i
            font-size: 0.8em
            margin-left: 4px

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
@import "src/css/colors"

.post
    a
        color: $color-text-special
        text-decoration: none

// Custom emojis
i.custom-emoji
    video, img
        height: 1em
        transform: translateY(0.125em)
        pointer-events: none
</style>
