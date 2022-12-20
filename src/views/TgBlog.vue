<template>
    <div class="error tgb-card" v-if="fail">
        <h2>Failed loading posts from: <br>{{postsUrl}}</h2>
        {{fail}}
    </div>
    <div v-infinite-scroll="infiniteScroll" id="Life" v-if="posts.length !== 0">
        <PostView :p="posts[i]" :postsUrl="postsUrl" v-for="(n, i) in count" :key="i" @play="a => audio = a" />
    </div>
    <AudioPlayer :audio="audio" v-if="audio"
                 @prev="audioNext(-1)" @next="audioNext(1)"/>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import moment from "moment";
import {Prop} from "vue-property-decorator";
import {Post, TGFile} from "@/logic/models";
import PostView from "@/views/PostView.vue";
import { initSpoilers } from '@/logic/spoilers';
import AudioPlayer from "@/views/AudioPlayer.vue";

@Options({components: {AudioPlayer, PostView}})
export default class TgBlog extends Vue
{
    posts: Post[] = []
    count = 20

    @Prop({required: true}) postsUrl: string

    audio?: TGFile = null

    fail: string = null

    get audios(): TGFile[]
    {
        return this.posts.filter(p => p.files?.at(0)?.media_type == "audio_file").flatMap(p => p.files)
    }

    audioNext(off: number)
    {
        this.audio = this.audios.at(this.audios.indexOf(this.audio) + off)
    }
    
    replaceUrl(url: string): string
    {
        return new URL(url, this.postsUrl).toString();
    }

    infiniteScroll()
    {
        this.count += 10
    }

    created(): void
    {
        fetch(this.postsUrl).then(it => it.json()).then(it => {
            this.posts = it
            this.posts.forEach(it => it.date = moment(it.date).format('YYYY-MM-DD h:mm'))
            this.posts.reverse()
            this.posts = this.posts.filter(it => it.type !== 'service')
            // Replace URLs
            this.posts.forEach(it =>
            {
                it.images?.forEach(img => img.url = this.replaceUrl(img.url))
                if (it.reply?.thumb) it.reply.thumb = this.replaceUrl(it.reply.thumb)
                it.files?.forEach(f =>
                {
                    f.url = this.replaceUrl(f.url)
                    if (f.thumb) f.thumb = this.replaceUrl(f.thumb)
                })
            })

            // // TODO: Remove this
            // this.audio = this.audios[0]
            // console.log(this.audios)

            console.log(it)
            setTimeout(() => initSpoilers(), 100);
        }).catch(it => {
            this.fail = it
        })
    }

    updated(): void
    {
        initSpoilers()
    }
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"
@import "src/css/global"

#Life
    margin: 20px auto
    font-size: 1em
    width: min(450px, 80vw)
    color: $color-text-main

    #header
        color: $color-text-light
        margin-bottom: 30px

// Phone layout
@media screen and (max-width: 570px)
    #Life
        margin: 20px 20px 0
        width: unset

*
    transition: all .25s ease
</style>
