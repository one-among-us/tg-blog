<template>
    <TgBlog v-if="this.url" :postsUrl="url"></TgBlog>
    <div v-else class="tgb-card">
        <h2>Please specify demo path</h2>
        Available paths:
        <div><a href="/liaotalk">无聊的话</a></div>
        <div><a href="/test">Testing Channel</a></div>
        <div><a href="/Uekawakuyuurei">秋雲</a></div>
        <div><a href="/custom?url=https%3A%2F%2Fprofile-api.hydev.org%2Fexports%2Fhykilp%2Fposts.json">小桂桂的回忆录</a></div>
        Or type your data url (posts.json) here:
        <input v-model="keyboard">
        <button @click="switchUrl">Load</button>
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

    keyboard: string = ""

    switchUrl()
    {
        window.location.replace('/custom?url=' + encodeURIComponent(this.keyboard))
    }

    mounted()
    {
        let p = window.location.pathname
        if (p == '/custom')
        {
            let params = (new URL(document.location.toString())).searchParams;
            this.url = params.get("url")
        }
        else
        {
            while (p.startsWith('/')) p = p.substring(1)
            if (p) this.url = urlJoin(backendHost, p, '/posts.json')
        }
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
