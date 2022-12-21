<template>
    <div id="ImageViewer" v-if="img">
        <div class="abs img-container">
            <img :src="img.url" alt="Photo" class="undraggable" :style="imgStyle">
        </div>
        <div class="abs controls">
            <div class="top">
                <span class="f-grow1"></span>
                <IconClose class="icn close clickable" @click="close"/>
            </div>
            <div class="f-grow1"></div>
            <div class="center">
                <IconArrowLeft class="icn left clickable" v-if="hasPrev" @click="updateIndex(-1)"/>
                <div class="f-grow1"></div>
                <IconArrowRight class="icn right clickable" v-if="hasNext" @click="updateIndex(1)"/>
            </div>
            <div class="f-grow1"></div>
            <div class="bottom">
                <div class="left">
                    <div class="index">Photo {{index + 1}} of {{imgs.length}}</div>
                    <div class="detail">
                        <span class="author" v-if="img.author">{{img.author}}</span>
                        <span class="date" v-if="img.date">{{img.date}}</span>
                    </div>
                </div>
                <div class="middle">
                    <div class="text" v-if="img.text">
                        <div v-html="textHtml"></div>
                    </div>
                </div>
                <div class="right">
                    <IconDownload class="icn download clickable" @click="download"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Emit, Prop} from "vue-property-decorator";
import * as KeyCode from 'keycode-js';
import fileDownload from "js-file-download";

// @ts-ignore
import IconClose from '~icons/ep/close';
// @ts-ignore
import IconArrowLeft from '~icons/ep/arrow-left';
// @ts-ignore
import IconArrowRight from '~icons/ep/arrow-right';
// @ts-ignore
import IconDownload from '~icons/ep/download';
import {mdParseInline} from "@/logic";

export interface ViewedImage
{
    url: string
    text?: string
    author?: string
    date?: string
    fileName?: string
}

export interface TrackedImage extends ViewedImage
{
    postIndex: number
}

@Options({components: {IconClose, IconArrowLeft, IconArrowRight, IconDownload}})
export default class ImageViewer extends Vue
{
    @Prop({required: true}) imgs: ViewedImage[]
    @Prop({required: true}) index: number

    ctrlDown: boolean = false
    zoom: number = 1

    get img() { if (this.imgs) return this.imgs[this.index] }
    get isOpen() { return !!this.img }
    get hasPrev() { return this.index > 0 }
    get hasNext() { return this.index <= this.imgs.length }
    get textHtml() { if (this.img.text) return mdParseInline(this.img.text) }

    download() { fileDownload(this.img.url, this.img.fileName ?? this.img.url.split("/").slice(-1)[0]) }

    @Emit("close")
    close() { }

    @Emit("update:index")
    updateIndex(offset: number)
    {
        const ni = this.index + offset
        if (ni < 0 || ni >= this.imgs.length) return this.index
        this.zoom = 1
        return ni
    }

    keydown(e: KeyboardEvent)
    {
        if (!this.isOpen) return
        if (e.code === KeyCode.CODE_ESCAPE) return this.close()
        if (e.code === KeyCode.CODE_LEFT) return this.updateIndex(-1)
        if (e.code === KeyCode.CODE_RIGHT) return this.updateIndex(1)
        if (e.key == KeyCode.VALUE_CONTROL || e.key === KeyCode.VALUE_META) return this.ctrlDown = true
    }

    keyup(e: KeyboardEvent)
    {
        if (e.key == KeyCode.VALUE_CONTROL || e.key === KeyCode.VALUE_META) return this.ctrlDown = false
    }

    wheel(e: WheelEvent)
    {
        if (!this.isOpen) return

        // Prevent page scroll
        e.preventDefault()

        // Get scroll direction
        const dir = Math.sign(e.deltaY)

        // Regular scroll: switch photos, Ctrl scroll: zoom
        if (!this.ctrlDown) this.updateIndex(dir)
        else this.zoom = Math.min(Math.max(this.zoom *= 1 + (dir * -0.1), 0.1), 5.0)
    }

    get imgStyle()
    {
        return {transform: `scale(${this.zoom.toFixed(2)})`}
    }

    mounted()
    {
        document.addEventListener('keydown', this.keydown)
        document.addEventListener('keyup', this.keyup)
        document.addEventListener("wheel", this.wheel, { passive: false })
    }

    unmounted()
    {
        document.removeEventListener('keydown', this.keydown)
        document.removeEventListener('keyup', this.keyup)
        document.removeEventListener("wheel", this.wheel)
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
            gap: 20px

            .left, .middle, .right
                // Align contents inside info box to the bottom
                display: flex
                flex-direction: column
                justify-content: end

            .left, .right
                flex-grow: 1
                flex-shrink: 0

            .left
                // Align the info box
                text-align: left

                display: flex
                flex-direction: column
                justify-content: end

                .index
                    font-weight: bold

                .detail
                    display: flex
                    gap: 20px

            .middle
                max-width: 800px

                .text
                    // Border box
                    padding: 10px
                    background: rgba(0, 0, 0, 0.5)
                    border-radius: 10px

                    // Text
                    font-size: 0.8em
                    text-align: left
                    white-space: pre-line

                    // Limit content to 10 lines
                    > div
                        overflow: hidden
                        text-overflow: ellipsis
                        display: -webkit-box
                        -webkit-line-clamp: 10
                        line-clamp: 10
                        -webkit-box-orient: vertical

            .right
                text-align: right
</style>
