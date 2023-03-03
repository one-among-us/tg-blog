<template>
    <div id="vid" v-if="src">
        <video ref="ply" playsinline controls>
            <source :src="src"/>
        </video>
    </div>
</template>

<script lang="ts" setup>
import 'plyr/dist/plyr.css'
import Plyr from "plyr";
import {Ref} from "vue";

const p = defineProps<{
    src: string
}>()

const emit = defineEmits<{
    (e: 'update:src', value: string): void
}>()

const ply: Ref<HTMLVideoElement> = ref();
let player: Plyr

onUpdated(() => {
    if (!p.src) return

    console.log("Setting up plyr")
    console.log(ply.value)
    player = new Plyr(ply.value)
})
</script>

<style lang="sass" scoped>
#vid
    position: fixed
    inset: 0
    z-index: 100

    //video
    //    height: 100%
    //    width: 100%
    //    background: transparent
</style>

<style lang="sass">
#vid
    .plyr
        max-height: 100%

        video
            max-height: 100vh
</style>
