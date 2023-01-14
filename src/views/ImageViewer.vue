<template>
    <div id="ImageViewer" v-if="img">
        <div class="img-container">
            <img :src="img.url" alt="Photo" class="undraggable" :style="imgStyle">
        </div>
        <div class="top">
            <span class="f-grow1"></span>
            <i-ep-close class="icn close clickable" @click="close"/>
        </div>
        <div class="bottom">
            <div class="left unselectable">
                <div class="index">Photo {{index + 1}} of {{imgs.length}}</div>
                <div class="detail">
                    <span class="date" v-if="img.date">{{img.date}}</span>
                </div>
            </div>
            <div class="right">
                <i-ep-download class="icn download clickable" @click="download"/>
            </div>
            <div class="description unselectable">
                <div class="text" v-if="img.text">
                    <div v-html="textHtml"></div>
                </div>
            </div>
        </div>
        <div class="arrows">
            <i-ep-arrow-left class="icn left clickable" v-if="hasPrev" @click="updateIndex(-1)"/>
            <i-ep-arrow-right class="icn right clickable" v-if="hasNext" @click="updateIndex(1)"/>
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Emit, Prop} from "vue-property-decorator";
import * as KeyCode from 'keycode-js';
import fileDownload from "js-file-download";

export interface ViewedImage
{
    url: string
    text?: string
    date?: string
    fileName?: string
}

export interface TrackedImage extends ViewedImage
{
    postIndex: number
}

@Options({components: {}})
export default class ImageViewer extends Vue
{
    @Prop({required: true}) imgs: ViewedImage[]
    @Prop({required: true}) index: number

    ctrlDown: boolean = false
    zoom: number = 1

    get img() { if (this.imgs) return this.imgs[this.index] }
    get isOpen() { return !!this.img }
    get hasPrev() { return this.index > 0 }
    get hasNext() { return this.index + 1 < this.imgs.length }
    get textHtml() { if (this.img.text) return this.img.text }

    download() { fileDownload(this.img.url, this.img.fileName ?? this.img.url.split("/").slice(-1)[0]) }

    @Emit("close")
    close() { this._rawUpdateIndex(-1) }

    updateIndex(offset: number)
    {
        const ni = this.index + offset
        if (ni < 0 || ni >= this.imgs.length) return
        this.zoom = 1
        this._rawUpdateIndex(ni)
    }

    @Emit("update:index")
    _rawUpdateIndex(index: number) { return index }

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
    backdrop-filter: blur(2px)

    .img-container
        position: absolute
        inset: 0

        display: flex
        align-items: center
        justify-content: center

        img
            max-width: 100%
            max-height: 100%

    .icn
        font-size: 2em
        filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))

    .top, .bottom, .arrows
        color: white
        opacity: 0.8
        z-index: 1000002

    .top
        position: absolute

    .arrows
        .icn
            position: absolute
            top: calc(50% - 0.5em)
            z-index: 1000004

        .left
            left: 10px

        .right
            right: 10px

    .top
        position: absolute
        inset: 10px 10px auto 10px
        display: flex

    .bottom
        position: absolute
        inset: auto 10px 10px 10px
        display: flex

        .clickable
            z-index: 1000008

        .left, .right
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
                gap: 10px

        .right
            align-items: end

    .description
        position: absolute
        inset: auto 0 0 0

        display: flex
        justify-content: center

        .text
            max-width: 800px
            // Border box
            padding: 10px
            background: rgba(0, 0, 0, 0.7)
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

    // Mobile optimizations
    @media only screen and (max-width: 600px)
        // Put middle text block outside
        .description
            position: absolute
            bottom: 100%
            margin-bottom: 10px
</style>

<style lang="sass">
#ImageViewer
    a
        color: unset
</style>
