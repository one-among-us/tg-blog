<template>
    <div id="ImageViewer" v-if="imgs[index]">
        <div class="abs img-container">
            <img :src="imgs[index].url" alt="Photo" class="undraggable">
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Emit, Prop} from "vue-property-decorator";

export interface ViewedImage
{
    url: string
    text?: string
    date?: string
}

@Options({components: {}})
export default class ImageViewer extends Vue
{
    @Prop({required: true}) imgs: ViewedImage[]
    @Prop({required: true}) initialIndex: number

    index: number

    created()
    {
        this.index = this.initialIndex
    }
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
</style>
