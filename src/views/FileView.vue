<template>
    <!-- Files -->
    <div class="file" v-if="shouldDisplayDetail(f)">
        <div class="thumb">
            <img v-if="f.thumb" :src="f.thumb" :alt="f.url"/>
            <div v-if="f.media_type === 'audio_file'" class="icon fbox-center">
                <i class="fa-solid fa-play"></i>
            </div>
            <div v-if="!f.media_type" class="icon fbox-center">
                <i class="fa-solid fa-download"></i>
            </div>
        </div>
        <div class="detail fbox-vcenter">
            <div class="title" v-if="fileTitle(f)">{{fileTitle(f)}}</div>
            <div class="file-detail">
                <span class="duration" v-if="f.duration">{{durationFmt(f.duration)}}</span>
                <span class="size" v-if="f.size">{{sizeFmt(f.size)}}</span>
            </div>
        </div>

    </div>

    <!-- Stickers -->
    <div class="sticker" v-if="f.media_type === 'sticker'">
        <video v-if="f.url.toLowerCase().endsWith('webm')" :src="f.url"
               preload muted autoplay loop playsinline disablepictureinpicture>
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
        <img v-else :src="f.url" alt=""/>
    </div>

    <!-- Videos / GIF -->
    <div class="video" v-if="f.media_type === 'video_file' || f.media_type === 'animation'"
         :class="{'has-head': hasHead}">
        <video :src="f.url"
               preload muted autoplay loop playsinline disablepictureinpicture>
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {File} from "@/logic/models";
import moment from "moment/moment";
import {Prop} from "vue-property-decorator";

@Options({components: {}})
export default class FileView extends Vue
{
    @Prop({required: true}) f: File
    @Prop({required: true}) hasHead: boolean

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
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"

// Normal margin files
.file, .sticker
    margin-left: 20px
    margin-right: 20px

// Regular file or audio
.file
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

.video.has-head
    margin-top: 0

.video
    margin: -22px 0 10px
    width: 100%

    video
        max-height: 500px
        width: 100%
</style>
