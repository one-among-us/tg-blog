<template>
    <video ref="vid" :src="f.url" preload="auto" loop playsinline>
        <img v-if="f.thumb" :src="f.thumb" alt="">
    </video>
</template>

<script lang="ts" setup>
import Plyr from "plyr";
import 'plyr/dist/plyr.css'
import {TGFile} from "@/logic";
import {Ref} from "vue";

const p = defineProps<{
    f: TGFile
}>()

const vid: Ref<HTMLVideoElement> = ref()

onMounted(() => {
    new Plyr(vid.value)
})
</script>

<style lang="sass" scoped>
</style>
