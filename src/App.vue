<template>
    <TgBlog v-if="this.url" :postsUrl="url"></TgBlog>
    <div v-else class="card">
        <h2>Please specify demo path</h2>
        Available paths:
        <div><a href="/liaotalk">无聊的话</a></div>
        <div><a href="/test">Testing Channel</a></div>
        <div><a href="/Uekawakuyuurei">秋雲</a></div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import TgBlog from "@/views/TgBlog.vue";
import urlJoin from "url-join";

const backendHost = "https://test-tg-data.hydev.org"

@Options({components: {TgBlog}})
export default class App extends Vue
{
    url: string = null

    mounted()
    {
        let p = window.location.pathname
        while (p.startsWith('/')) p = p.substring(1)
        if (p) this.url = urlJoin(backendHost, p, '/posts.json')
    }
}
</script>

<style lang="sass">
@import "css/colors"
@import "css/global"

#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50

  .rlink
    color: hotpink
    text-decoration: none

  max-width: 600px
  margin: auto
</style>
