<template>
    <div class="post card" :id="`message-${p.id}`" :class="{'service': p.type === 'service'}">
        <div class="head unselectable">
            <div class="forward" v-if="p.forwarded_from">Forwarded from: {{p.forwarded_from}}</div>
        </div>
        <div class="reply undraggable clickable" v-if="p.reply" @click="clickReply">
            <img class="thumb" v-if="p.reply.thumb" :src="p.reply.thumb" alt="">
            <div class="mtext">
                <div class="reply-to">Reply to:</div>
                <span v-html="p.reply.text"></span>
            </div>
        </div>
        <div class="images" v-if="p.images && p.images.length === 1">
            <img v-for="i in p.images" :key="i.url" :src="i.url" alt="image">
        </div>
        <div class="images" v-if="p.images && p.images.length !== 1">
            <div class="img" v-for="i in p.images" :key="i[0]"
                 :style="{'background-image': `url(${i.url})`, ...getImageStyle(p, i)}"></div>
        </div>
        <div class="files" v-if="p.files">
            <div class="file" v-for="f in p.files" :key="f">
                <!-- Files -->
                <div class="thumb" v-if="shouldDisplayDetail(f)">
                    <img v-if="f.thumb" :src="f.thumb" :alt="f.url"/>
                    <div v-if="f.media_type === 'audio_file'" class="icon fbox-center">
                        <i class="fa-solid fa-play"></i>
                    </div>
                    <div v-if="!f.media_type" class="icon fbox-center">
                        <i class="fa-solid fa-download"></i>
                    </div>
                </div>
                <div class="detail fbox-vcenter" v-if="shouldDisplayDetail(f)">
                    <div class="title" v-if="fileTitle(f)">{{fileTitle(f)}}</div>
                    <div class="file-detail">
                        <span class="duration" v-if="f.duration">{{durationFmt(f.duration)}}</span>
                        <span class="size" v-if="f.size">{{sizeFmt(f.size)}}</span>
                    </div>
                </div>

                <!-- Stickers -->
                <div class="sticker" v-if="f.media_type === 'sticker'">
                    <video v-if="f.url.endsWith('webm')" :src="f.url"
                           preload="auto" muted autoplay loop playsinline disablepictureinpicture>
                        <img v-if="f.thumb" :src="f.thumb">
                    </video>
                    <img v-else :src="f.url"/>
                </div>
            </div>
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
import {Image, Post, File} from "@/logic/models";
import { mdParseInline } from '@/logic/spoilers';
import moment from "moment";

@Options({components: {}})
export default class PostView extends Vue
{
    @Prop({required: true}) p!: Post

    get text(): string | undefined
    {
        if (!this.p.text) return undefined
        return mdParseInline(this.p.text)
    }

    shouldDisplayDetail(f: File): boolean
    {
        return !f.media_type || f.media_type == 'audio_file'
    }

    fileTitle(f: File): string | undefined
    {
        if (!f.media_type)
        {
            return f.url.split("/").slice(-1)[0]
        }
        if (f.media_type == "audio_file")
        {
            let ret = ""
            if (f.performer) ret += f.performer + " - "
            if (f.title) ret += f.title
            return ret
        }
    }

    durationFmt(duration: number): string
    {
        return moment.utc(moment.duration(duration, "seconds").asMilliseconds()).format("mm:ss")
    }

    sizeFmt(size: number): string
    {
        for (const unit of ["B", "KiB", "MiB", "GiB", "TiB", "PiB"])
        {
            if (Math.abs(size) < 1024.0)
            {
                return `${size.toFixed(1)} ${unit}`
            }
            size /= 1024.0
        }
        return "> 1024 PiB"
    }

    getImageStyle(post: Post, i: Image): object
    {
        return {}
    }

    clickReply()
    {
        // Scroll to the reply message
        document.getElementById(`message-${this.p.reply.id}`).scrollIntoView({ behavior: 'smooth', block: 'end'})
    }
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

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

    .forward, .reply-to
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
            flex: 1
            max-height: 40px
            margin-left: 10px
            //color: lighten($color-text-main, 20)
            color: $color-text-light
            display: -webkit-box
            -webkit-line-clamp: 2 /* number of lines to show */
            line-clamp: 2
            -webkit-box-orient: vertical
            overflow: hidden


    .reply:before
        content: " "
        border: 2px solid lighten($color-text-main, 20)
        border-radius: 2px

    .reply + .images
        margin: 0 -20px 10px

    .images
        margin: -22px -20px 10px
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

    .info
        display: flex
        color: lighten($color-text-main, 40)
        div
            margin: 0 10px

        div:first-child, div:last-child
            margin: 0

        i
            font-size: 0.8em
            margin-left: 4px

    // Files
    .files
        > * + *
            margin-top: 10px

    .file
        // One type of file
        display: flex
        flex-direction: row
        gap: 10px

        .thumb > img, .icon
            border-radius: 10000px
            width: 45px
            height: 45px
            object-fit: cover

        .detail
            gap: 5px

            .title
                font-weight: bold

            .file-detail
                color: $color-text-light

                // Add commas in between
                * + *:before
                    content: ", "

        .thumb
            position: relative
            .icon
                position: absolute
                left: 0
                top: 0
                color: white
                font-size: 1.5em
                background: rgba(0, 0, 0, 0.25)
                opacity: 0.8

        .sticker
            > *
                width: 120px

</style>

<style lang="sass">
@import "src/css/colors"

.post
    a
        color: $color-text-special
        text-decoration: none
</style>
