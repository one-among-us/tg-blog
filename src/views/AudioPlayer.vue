<template>
    <div id="AudioPlayer">
        <div class="wrap" >
            <div class="unselectable">{{ audio.performer }} - {{ audio.title }}</div>
            <div class="control">
                <span>{{this.time}}</span>
                <span class="f-grow1"></span>
                <i class="fas fa-backward clickable" @click="prev"></i>
                <span class="play-button clickable">
                    <i v-if="playing?.paused" class="fas fa-play" @click="play"></i>
                    <i v-else class="fas fa-pause" @click="pause"></i>
                </span>
                <i class="fas fa-forward clickable" @click="next"></i>
                <span class="f-grow1"></span>
                <span>{{this.duration}}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Emit, Prop, Ref, Watch} from "vue-property-decorator";
import {TGFile} from "@/logic/models";
import {durationFmt} from "@/logic/formatter";

@Options({components: {}})
export default class AudioPlayer extends Vue
{
    @Prop({required: true}) audio: TGFile

    playing: HTMLAudioElement = null

    duration: string = "00:00"
    time: string = "00:00"

    mounted() {
        this.init()
    }

    @Emit("pause")
    pause() {
        this.playing.pause()
        this.$forceUpdate()
    }

    @Emit("play")
    play() {
        this.playing.play()
        this.$forceUpdate()
    }

    @Emit("next")
    next() {}

    @Emit("prev")
    prev() {}

    unmounted() {
        if (this.playing) this.playing.pause()
    }

    @Watch('audio')
    init() {
        if (this.playing && !this.playing.paused) this.playing.pause()

        this.playing = new Audio()
        this.playing.src = this.audio.url

        // On initial loading, initialize duration
        this.playing.onloadedmetadata = () => {
            this.duration = durationFmt(this.playing.duration)
        }

        // When time updates, update displayed time
        this.playing.ontimeupdate = () => {
            this.time = durationFmt(this.playing.currentTime)
        }

        // Ended, next song
        this.playing.onended = () => {
            this.$forceUpdate()
            this.next()
        }

        this.playing.play()
    }
}
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
