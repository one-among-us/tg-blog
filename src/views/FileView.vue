<template>
    <!-- Files -->
    <div class="file" v-if="shouldDisplayDetail">
        <div class="thumb clickable" @click="fileThumbClick">
            <img :src="f.thumb ?? 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='" alt=""/>
            <div class="icon fbox-center">
                <i-fas-download v-if="!f.media_type" />
                <i-fas-play v-else-if="isAudioOrVoice" />
                <i-fas-address-book v-else-if="f.media_type === 'contact'" />
            </div>
        </div>

        <div class="detail fbox-vcenter">
            <div class="title" v-if="fileTitle">{{fileTitle}}</div>
            <div class="file-detail">
                <span class="duration" v-if="f.duration">{{duration}}</span>
                <span class="size" v-if="f.size">{{size}}</span>
                <span class="phone" v-if="f.phone_number">{{f.phone_number}}</span>
            </div>
        </div>
    </div>

    <!-- Stickers -->
    <div class="sticker" v-if="f.media_type === 'sticker'">
        <video v-if="f.url.toLowerCase().endsWith('webm')" :src="f.url"
               preload="auto" muted autoplay loop playsinline disablepictureinpicture>
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
        <img v-else :src="f.url" alt=""/>
    </div>

    <!-- Videos -->
    <div class="video no-head" v-if="f.media_type === 'video_file'" :class="{'has-head': hasHead}">
        <video ref="vid" :src="f.url" preload="auto" loop playsinline>
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
    </div>

    <!-- GIFs -->
    <div class="video no-head" v-if="f.media_type === 'animation'" :class="{'has-head': hasHead}">
        <video :src="f.url" preload="auto" muted autoplay loop playsinline disablepictureinpicture>
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
    </div>

    <!-- Poll -->
    <Poll :f="pollFile" v-if="f.media_type === 'poll'"></Poll>

    <!-- Location -->
    <Location class="location no-head" :class="{'has-head': hasHead}"
              :f="locationFile" v-if="f.media_type === 'location'"></Location>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {TGFile, TGPollFile, TGLocationFile} from "@/logic/models";
import {Emit, Prop, Ref} from "vue-property-decorator";
import {durationFmt, sizeFmt} from "@/logic/formatter";
import fileDownload from "js-file-download"

@Options({components: {
    Location: defineAsyncComponent(() => import("./Location.vue")),
    Poll: defineAsyncComponent(() => import("./Poll.vue"))
}})
export default class FileView extends Vue
{
    @Prop({required: true}) f: TGFile
    @Prop({required: true}) hasHead: boolean
    @Ref("vid") vid: HTMLVideoElement

    get pollFile() { return this.f as unknown as TGPollFile }
    get locationFile() { return this.f as unknown as TGLocationFile }

    fileThumbClick()
    {
        // Is regular file, download
        if (!this.f.media_type)
            return fileDownload(this.f.url, this.f.url.split("/").slice(-1)[0])

        // Is audio, emit event
        this.play()
    }

    @Emit('play')
    play() { return this.f }

    get shouldDisplayDetail(): boolean
    {
        return !this.f.media_type || this.isAudioOrVoice || this.f.media_type == 'contact'
    }

    get isAudioOrVoice(): boolean
    {
        return this.f.media_type == 'audio_file' || this.f.media_type == 'voice_message'
    }

    get fileTitle(): string | undefined
    {
        const f = this.f
        if (!f.media_type)
            return f.original_name ?? f.url.split("/").slice(-1)[0]

        if (f.media_type == 'voice_message')
            return "Voice Message"

        if (f.media_type == "audio_file")
        {
            let ret = ""
            if (f.performer) ret += f.performer + " - "
            if (f.title) ret += f.title
            return ret
        }

        if (f.media_type == 'contact')
        {
            let name = f.first_name ?? ''
            if (f.last_name) name += ' ' + f.last_name
            return name
        }
    }

    get duration(): string { return durationFmt(this.f.duration) }
    get size(): string { return sizeFmt(this.f.size) }
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
        font-size: 1.2em
        background: rgba(0, 0, 0, 0.25)
        opacity: 0.8

.sticker
    > *
        width: 120px

.no-head.has-head
    margin-top: 0

.no-head
    margin-top: -22px

.video
    margin: -22px 0 10px
    width: 100%

    video
        max-height: 500px
        width: 100%
</style>
