<template>
    <div id="AudioPlayer">
        <div class="wrap" >
            <div class="unselectable">{{ audio.performer }} - {{ audio.title }}</div>
            <div class="control">
                <span>{{ time }}</span>
                <span class="f-grow1"></span>
                <i-fas-backward class="clickable" @click="prev" />

                <i-fas-play v-if="isPlayerPaused" @click="play" />
                <i-fas-pause v-else @click="pause" />

                <i-fas-forward class="clickable" @click="next" />
                <span class="f-grow1"></span>
                <span>{{ duration }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {TGFile} from "@/logic/models";
import {durationFmt} from "@/logic/formatter";
import {computed, onUnmounted, ref, watch} from "vue";

const props = defineProps<{
    audio: TGFile
}>()

const emit = defineEmits<{
    (e: "pause"): void
    (e: "play"): void
    (e: "next"): void
    (e: "prev"): void
}>()

const playing = ref<HTMLAudioElement | null>(null)
const duration = ref("00:00")
const time = ref("00:00")
const playbackTick = ref(0)
const isPlayerPaused = computed(() => {
    void playbackTick.value
    return playing.value?.paused ?? true
})

function pause() {
    if (!playing.value) return
    playing.value.pause()
    playbackTick.value++
    emit("pause")
}

function play() {
    if (!playing.value) return
    void playing.value.play()
    playbackTick.value++
    emit("play")
}

function next() {
    emit("next")
}

function prev() {
    emit("prev")
}

function init() {
    if (playing.value && !playing.value.paused) playing.value.pause()

    const player = new Audio()
    player.src = props.audio.url
    playing.value = player
    duration.value = "00:00"
    time.value = "00:00"
    playbackTick.value++

    // On initial loading, initialize duration
    player.onloadedmetadata = () => {
        duration.value = durationFmt(player.duration)
    }

    // When time updates, update displayed time
    player.ontimeupdate = () => {
        time.value = durationFmt(player.currentTime)
    }

    player.onplay = () => {
        playbackTick.value++
    }

    player.onpause = () => {
        playbackTick.value++
    }

    // Ended, next song
    player.onended = () => {
        playbackTick.value++
        next()
    }

    void player.play()
}

watch(() => props.audio, init, {immediate: true})

onUnmounted(() => {
    if (playing.value) playing.value.pause()
})
</script>

<style lang="sass" scoped>
@import "src/css/colors"

#AudioPlayer
    position: fixed
    bottom: 0
    left: 0
    width: 100%
    font-weight: bold

    .wrap
        max-width: 600px
        margin: 0 auto 20px

        padding: 10px 20px
        box-sizing: border-box

        border-radius: 50px

        background: rgba(107, 59, 11, 0.4)
        backdrop-filter: blur(2px)
        color: white

    .control
        display: flex
        gap: 50px
        align-items: center
        justify-content: center

</style>
