<template>
    <div id="ImageViewer" v-if="imgs[index]">
        <div class="abs img-container">
            <img :src="imgs[index].url" alt="Photo" class="undraggable">
        </div>
        <div class="abs controls">
            <div class="top">
                <span class="f-grow1"></span>
                <span class="icn close clickable" @click="close"><IconClose/></span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Emit, Prop} from "vue-property-decorator";

// @ts-ignore
import IconClose from '~icons/ep/close';

export interface ViewedImage
{
    url: string
    text?: string
    date?: string
}

export interface TrackedImage extends ViewedImage
{
    postIndex: number
}

@Options({components: {IconClose}})
export default class ImageViewer extends Vue
{
    @Prop({required: true}) imgs: ViewedImage[]
    @Prop({required: true}) initialIndex: number

    index: number

    created()
    {
        this.index = this.initialIndex
    }

    @Emit("close")
    close() { }
}
</script>

<style lang="sass" scoped>
#ImageViewer
    // Absolute positioning
    position: fixed
    z-index: 1000000
    inset: 0
    background: rgba(0, 0, 0, 0.64)

    .abs
        position: absolute
        inset: 0

    .img-container
        display: flex
        align-items: center
        justify-content: center

        img
            max-width: 100%
            max-height: 100%

    .controls
        display: flex
        padding: 10px
        flex-direction: column
        color: #d5d5d5

        .icn
            font-size: 2em

        .top
            display: flex
</style>
