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
        <StickerMedia :url="f.url"
                      :thumb="f.thumb"
                      :emoji="f.sticker_emoji"
                      :is-animated="Boolean((f as any).is_animated || f.mime_type === 'application/x-tgsticker' || f.url?.toLowerCase().split('?')[0].endsWith('.tgs'))"
                      :is-video="Boolean((f as any).is_video || f.mime_type === 'video/webm' || f.url?.toLowerCase().split('?')[0].endsWith('.webm'))" />
    </div>

    <!-- Videos -->
    <div class="video no-head" v-if="f.media_type === 'video_file'" :class="{'has-head': hasHead}">
        <div @click="f.spoiler = false" :class="{clickable: f.spoiler}">
            <VideoPlayer v-if="isMounted" :f="f" :class="spoilerClasses"/>
        </div>
    </div>

    <!-- GIFs -->
    <div class="video no-head" v-if="f.media_type === 'animation'" :class="{'has-head': hasHead}">
        <img v-if="f.mime_type === 'image/gif' || f.url?.toLowerCase().split('?')[0].split('#')[0].endsWith('.gif')"
             :src="f.url" alt="GIF" loading="lazy" :class="spoilerClasses" @click="f.spoiler = false" />
        <video v-else :src="f.url" preload="metadata" muted loop playsinline disablepictureinpicture ref="gif"
               :class="spoilerClasses" @click="f.spoiler = false; gif.play()">
            <img v-if="f.thumb" :src="f.thumb" alt="">
        </video>
    </div>

    <!-- Poll -->
    <Poll :f="pollFile" :interactive="interactive" :poll-state="pollState" :voting="pollVoting"
          @vote="(pollId, indices) => emit('vote-poll', pollId, indices)"
          v-if="f.media_type === 'poll'"></Poll>

    <!-- Location -->
    <Location class="location no-head" :class="{'has-head': hasHead}"
              :f="locationFile" v-if="f.media_type === 'location' && isMounted"></Location>

    <!-- Dice -->
    <div class="dice clickable" v-if="f.media_type === 'dice'" ref="diceEl" @click="replayDice" title="Click to replay">
        <img v-if="f.url && isVisible" :src="diceSrc" class="dice-anim" alt="dice" />
        <template v-else-if="!f.url">
            <span class="dice-emoji">{{ f.emoji ?? '🎲' }}</span>
            <span class="dice-val" v-if="f.value !== undefined">{{ f.value }}</span>
        </template>
    </div>

    <!-- Giveaway -->
    <div class="giveaway-card" v-if="f.media_type === 'giveaway' || f.media_type === 'giveaway_winners'">
        <div class="giveaway-icon">🎁</div>
        <div class="giveaway-detail">
            <div class="title">{{ f.media_type === 'giveaway' ? 'Giveaway' : 'Giveaway Winners' }}</div>
            <div class="file-detail">
                <span v-if="f.quantity">{{ f.quantity }} prizes</span>
                <span v-if="f.winner_count">{{ f.winner_count }} winners</span>
            </div>
        </div>
    </div>

    <!-- Story -->
    <div class="story-card" v-if="f.media_type === 'story'">
        <div class="story-icon">📖</div>
        <div class="story-detail">
            <div class="title">Telegram Story</div>
        </div>
    </div>

    <!-- WebPage Link Preview -->
    <a class="web-page"
       v-if="f.media_type === 'web_page' && safeWebPageUrl"
       :class="{ 'is-large': isLargeWebPage, 'is-small': !isLargeWebPage && !!f.thumb }"
       :href="safeWebPageUrl"
       target="_blank"
       rel="noopener noreferrer">
        <div class="wp-header">
            <div class="wp-text">
                <div class="wp-site" v-if="f.site_name || f.display_url">{{ f.site_name || f.display_url }}</div>
                <div class="wp-title" v-if="f.title">{{ f.title }}</div>
                <div class="wp-author" v-if="f.author">{{ f.author }}</div>
                <div class="wp-desc" v-if="f.description">{{ f.description }}</div>
            </div>
            <div class="wp-thumb-small" v-if="f.thumb && !isLargeWebPage">
                <img :src="f.thumb" :alt="f.title || f.site_name || 'Link preview'" loading="lazy" />
            </div>
        </div>
        <div class="wp-thumb-large" v-if="f.thumb && isLargeWebPage">
            <img :src="f.thumb" :alt="f.title || f.site_name || 'Link preview'" loading="lazy" />
        </div>
    </a>
</template>

<script lang="ts" setup>
import {MergedPoll, TGFile, TGLocationFile, TGPollFile} from "@/logic/models";
import {durationFmt, sizeFmt} from "@/logic/formatter";
import {useTgbMessages} from "@/logic/messages";
import {computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch} from "vue";

const msg = useTgbMessages()

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
import StickerMedia from "@/views/StickerMedia.vue"

const props = defineProps<{
    f: TGFile
    hasHead: boolean
    interactive?: boolean
    pollState?: MergedPoll | null
    pollVoting?: boolean
}>()
const f = computed(() => props.f)
const hasHead = computed(() => props.hasHead)

const emit = defineEmits<{
    (e: "play-file", file: TGFile): void
    (e: "vote-poll", pollId: string, optionIndices: number[]): void
}>()

const gif = ref<HTMLVideoElement>()
const diceEl = ref<HTMLElement>()
const isMounted = ref(false)
const isVisible = ref(false)
const diceSrc = ref('')
let diceObserver: IntersectionObserver | null = null

function updateDiceSrc() {
    if (f.value.url) {
        diceSrc.value = f.value.url
    }
}

function replayDice() {
    if (!f.value.url) return
    const base = f.value.url.split('?')[0]
    diceSrc.value = `${base}?t=${Date.now()}`
}

watch(() => f.value.url, () => {
    if (isVisible.value) {
        updateDiceSrc()
    }
})

onMounted(() => {
    isMounted.value = true
    if (f.value.media_type === 'dice') {
        if (typeof window === 'undefined' || !window.IntersectionObserver) {
            isVisible.value = true
            updateDiceSrc()
            return
        }
        diceObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                isVisible.value = true
                updateDiceSrc()
                diceObserver?.disconnect()
            }
        }, { threshold: 0.1 })
        if (diceEl.value) {
            diceObserver.observe(diceEl.value)
        }
    }
})

onUnmounted(() => {
    diceObserver?.disconnect()
})

const pollFile = computed(() => f.value as unknown as TGPollFile)
const locationFile = computed(() => f.value as unknown as TGLocationFile)
const spoilerClasses = computed(() => ({media_spoiler: f.value.spoiler, clickable: f.value.spoiler}))

function fileThumbClick()
{
    // Is regular file, download
    if (!f.value.media_type) {
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
        return msg.voiceMessage

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

    return undefined
})

const duration = computed(() => durationFmt(f.value.duration))
const size = computed(() => sizeFmt(f.value.size))

const safeWebPageUrl = computed((): string | null => {
    const raw = (f.value.url ?? '').trim()
    return /^https?:\/\//i.test(raw) ? raw : null
})

const isLargeWebPage = computed((): boolean => {
    if (f.value.prefer_large_media) return true
    if (f.value.prefer_small_media) return false
    return Boolean(f.value.has_large_media)
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

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
        min-height: 180px

.no-head
    margin-top: -12px

.video
    margin: -12px 0 10px
    width: 100%

    // For spoilers
    overflow-y: hidden
    background: gray

    video
        max-height: 500px
        width: 100%

    .plyr:fullscreen video
        max-height: unset

.no-head.has-head,
.video.has-head
    margin-top: 0

.dice
    display: flex
    align-items: center
    justify-content: center
    padding: 6px 20px
    cursor: pointer
    user-select: none

    .dice-anim
        width: 140px
        height: 140px
        object-fit: contain

    .dice-emoji
        font-size: 2em

    .dice-val
        font-size: 1.5em
        font-weight: bold

.giveaway-card, .story-card
    display: flex
    align-items: center
    gap: 12px
    margin: 0 20px
    padding: 10px 14px
    border-radius: 8px
    background: rgba(0, 0, 0, 0.04)

    .giveaway-icon, .story-icon
        font-size: 1.8em

    .title
        font-weight: bold

    .file-detail
        color: $color-text-light
        font-size: 0.9em

.web-page
    display: block
    margin: 0 20px
    padding: 8px 12px 9px 11px
    border-left: 3px solid $color-text-special-dark
    border-radius: 4px 8px 8px 4px
    background: rgba(112, 81, 42, 0.06)
    color: inherit
    text-decoration: none
    overflow: hidden
    transition: background 0.18s ease

    &:hover
        background: rgba(112, 81, 42, 0.11)
        text-decoration: none

    .wp-header
        display: flex
        align-items: flex-start
        gap: 10px

    .wp-text
        flex: 1
        min-width: 0

    .wp-site
        color: $color-text-special-dark
        font-size: 0.85em
        font-weight: 700
        line-height: 1.3
        overflow-wrap: anywhere

    .wp-title
        color: $color-text-main
        font-weight: 700
        font-size: 0.94em
        line-height: 1.35
        margin-top: 2px
        display: -webkit-box
        -webkit-line-clamp: 2
        -webkit-box-orient: vertical
        overflow: hidden
        overflow-wrap: anywhere

    .wp-author
        color: $color-text-light
        font-size: 0.84em
        margin-top: 1px

    .wp-desc
        color: $color-text-light
        font-size: 0.88em
        line-height: 1.4
        margin-top: 2px
        display: -webkit-box
        -webkit-line-clamp: 3
        -webkit-box-orient: vertical
        overflow: hidden
        overflow-wrap: anywhere

    .wp-thumb-small
        flex-shrink: 0
        width: 56px
        height: 56px
        border-radius: 6px
        overflow: hidden
        background: rgba(112, 81, 42, 0.08)

        img
            width: 100%
            height: 100%
            object-fit: cover
            display: block

    .wp-thumb-large
        margin-top: 8px
        border-radius: 6px
        overflow: hidden
        max-height: 300px
        background: rgba(112, 81, 42, 0.08)

        img
            width: 100%
            max-height: 300px
            object-fit: cover
            display: block
</style>
