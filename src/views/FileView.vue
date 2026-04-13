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
        <div @click="f.spoiler = false" :class="{clickable: f.spoiler}">
            <VideoPlayer :f="f" :class="spoilerClasses"/>
        </div>
    </div>

    <!-- GIFs -->
    <div class="video no-head" v-if="f.media_type === 'animation'" :class="{'has-head': hasHead}">
        <video :src="f.url" preload="auto" muted loop playsinline disablepictureinpicture ref="gif"
               :class="spoilerClasses" @click="f.spoiler = false; gif.play()">
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
    </div>

    <!-- Poll -->
    <Poll :f="pollFile" v-if="f.media_type === 'poll'"></Poll>

    <!-- Location -->
    <Location class="location no-head" :class="{'has-head': hasHead}"
              :f="locationFile" v-if="f.media_type === 'location'"></Location>
</template>

<script lang="ts" setup>
import {TGFile, TGLocationFile, TGPollFile} from "@/logic/models";
import {durationFmt, sizeFmt} from "@/logic/formatter";
import {computed, defineAsyncComponent, ref} from "vue";

function downloadURI(uri: string, name: string) {
  let link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const Location = defineAsyncComponent(() => import("./Location.vue"))
const Poll = defineAsyncComponent(() => import("./Poll.vue"))
const VideoPlayer = defineAsyncComponent(() => import("./VideoPlayer.vue"))

const props = defineProps<{
    f: TGFile
    hasHead: boolean
}>()
const f = computed(() => props.f)
const hasHead = computed(() => props.hasHead)

const emit = defineEmits<{
    (e: "play-file", file: TGFile): void
}>()

const gif = ref<HTMLVideoElement>()

const pollFile = computed(() => f.value as unknown as TGPollFile)
const locationFile = computed(() => f.value as unknown as TGLocationFile)
const spoilerClasses = computed(() => ({media_spoiler: f.value.spoiler, clickable: f.value.spoiler}))

function fileThumbClick()
{
    // Is regular file, download
    if (!f.value.media_type) {
      console.log(`Downloading file: ${f.value.url}`)
      return downloadURI(f.value.url, f.value.url.split("/").slice(-1)[0])
      // fileDownload downloads content directly, not URL
      // return fileDownload(this.f.url, this.f.url.split("/").slice(-1)[0])
    }
    // Is audio, emit event
    play()
}

function play() {
    emit('play-file', f.value)
}

const shouldDisplayDetail = computed((): boolean =>
{
    return !f.value.media_type || isAudioOrVoice.value || f.value.media_type == 'contact'
})

const isAudioOrVoice = computed((): boolean =>
{
    return f.value.media_type == 'audio_file' || f.value.media_type == 'voice_message'
})

const fileTitle = computed((): string | undefined =>
{
    const file = f.value
    if (!file.media_type)
        return file.original_name ?? file.url.split("/").slice(-1)[0]

    if (file.media_type == 'voice_message')
        return "Voice Message"

    if (file.media_type == "audio_file")
    {
        let ret = ""
        if (file.performer) ret += file.performer + " - "
        if (file.title) ret += file.title
        return ret
    }

    if (file.media_type == 'contact')
    {
        let name = file.first_name ?? ''
        if (file.last_name) name += ' ' + file.last_name
        return name
    }
})

const duration = computed(() => durationFmt(f.value.duration))
const size = computed(() => sizeFmt(f.value.size))
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
    display: flex
    justify-content: center

    > *
        width: 180px

.no-head.has-head
    margin-top: 0

.no-head
    margin-top: -22px

.video
    margin: -22px 0 10px
    width: 100%

    // For spoilers
    overflow-y: hidden
    background: gray

    video
        max-height: 500px
        width: 100%

    .plyr:fullscreen video
        max-height: unset
</style>
