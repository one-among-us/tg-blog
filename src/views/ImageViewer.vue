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
                <div class="icn left clickable" v-if="index > 0" @click="updateIndex(-1)"><IconArrowLeft/></div>
                <div class="f-grow1"></div>
                <div class="icn right clickable" v-if="index < imgs.length - 1" @click="updateIndex(1)"><IconArrowRight/></div>
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
import * as KeyCode from 'keycode-js';

// @ts-ignore
import IconClose from '~icons/ep/close';
// @ts-ignore
import IconArrowLeft from '~icons/ep/arrow-left';
// @ts-ignore
import IconArrowRight from '~icons/ep/arrow-right';

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

@Options({components: {IconClose, IconArrowLeft, IconArrowRight}})
export default class ImageViewer extends Vue
{
    @Prop({required: true}) imgs: ViewedImage[]
    @Prop({required: true}) index: number

    get img() { if (this.imgs) return this.imgs[this.index] }

    @Emit("close")
    close() { }

    @Emit("update:index")
    updateIndex(offset: number)
    {
        return this.index + offset
    }

    key(e: KeyboardEvent)
    {
        if (e.code === KeyCode.CODE_ESCAPE)
        {
            this.close()
        }
    }

    mounted()
    {
        document.addEventListener('keydown', this.key)
    }

    unmounted()
    {
        document.removeEventListener('keydown', this.key)
    }
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
        z-index: 1000002
        flex-direction: column
        color: rgba(255, 255, 255)
        opacity: 0.75

        .icn
            font-size: 2em
            filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))

        .top
            display: flex

        .center
            display: flex
            flex-direction: row

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
