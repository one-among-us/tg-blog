<template>
    <div id="ImageViewer" v-if="img">
        <div class="abs img-container">
            <img :src="img.url" alt="Photo" class="undraggable">
        </div>
        <div class="abs controls">
            <div class="top">
                <span class="f-grow1"></span>
                <span class="icn close clickable" @click="close"><IconClose/></span>
            </div>
            <div class="f-grow1"></div>
            <div class="center">

            </div>
            <div class="f-grow1"></div>
            <div class="bottom">
                <div class="info">
                    <div class="index">Photo {{index + 1}} of {{imgs.length}}</div>
                    <div class="detail">
                        <span class="author" v-if="img.author">{{img.author}}</span>
                        <span class="date" v-if="img.date">{{img.date}}</span>
                    </div>
                </div>
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
    author?: string
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

    get img() { if (this.imgs) return this.imgs[this.index] }

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
    background: rgba(0, 0, 0, 0.8)

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

        .bottom
            display: flex

        .info
            text-align: left

            .index
                font-weight: bold

            .detail
                display: flex
                gap: 10px
</style>
