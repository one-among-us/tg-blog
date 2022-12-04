<template>
    <div id="Life" v-if="posts.length !== 0">
        <PostView :p="p" v-for="p in posts" :key="p.id"/>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import moment from "moment";
import {Prop} from "vue-property-decorator";
import {Post} from "@/logic/models";
import PostView from "@/views/PostView.vue";

@Options({components: {PostView}})
export default class TgBlog extends Vue
{
    posts: Post[] = []

    @Prop({required: true}) postsUrl: string

    created(): void
    {
        fetch(this.postsUrl).then(it => it.json()).then(it => {
            this.posts = it
            this.posts.forEach(it => it.date = moment(it.date).format('YYYY-MM-DD h:mm'))
            this.posts.reverse()
            this.posts = this.posts.filter(it => it.type !== 'service')
            console.log(it)
        })
    }
}
</script>

<style lang="sass" scoped>
@import "src/css/colors"
@import "src/css/global"

#Life
    margin: 20px auto
    font-size: 0.8em
    width: min(450px, 80vw)

    #header
        color: $color-text-light
        margin-bottom: 30px

// Phone layout
@media screen and (max-width: 570px)
    #Life
        margin: 20px 20px 0
        width: unset
</style>
