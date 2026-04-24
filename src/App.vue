<template>
    <TgBlog v-if="url" :postsUrl="url"></TgBlog>
    <div v-else class="tgb-card">
        <h2>Please specify demo path</h2>
        Available paths:
        <div><a href="/liaotalk">无聊的话</a></div>
        <div><a href="/test">Testing Channel</a></div>
        <div><a href="/Uekawakuyuurei">秋雲</a></div>
        <div><a href="/custom?url=https%3A%2F%2Fprofile-api.hydev.org%2Fexports%2Ftest%2Fposts.json">Testing Channel (With maps)</a></div>
        <div><a href="/custom?url=https%3A%2F%2Fprofile-api.hydev.org%2Fexports%2Fhykilp%2Fposts.json">小桂桂的回忆录</a></div>
        Or type your data url (posts.json) here:
        <input v-model="keyboard">
        <button @click="switchUrl">Load</button>
    </div>
</template>

<script lang="ts" setup>
import TgBlog from "@/views/TgBlog.vue";
import urlJoin from "url-join";
import {onMounted, ref} from "vue";

const backendHost = "https://test-tg-data.hydev.org"

const url = ref<string | null>(null)
const keyboard = ref("")

function switchUrl()
{
    window.location.replace('/custom?url=' + encodeURIComponent(keyboard.value))
}

onMounted(() =>
{
    let p = window.location.pathname
    if (p == '/custom')
    {
        let params = (new URL(document.location.toString())).searchParams;
        url.value = params.get("url")
    }
    else
    {
        while (p.startsWith('/')) p = p.substring(1)
        if (p) url.value = urlJoin(backendHost, p, '/posts.json')
    }
})
</script>

<style lang="sass">
@use "css/colors" as *
@use "css/global" as *

#app
  font-family: Avenir, Helvetica, Arial, sans-serif

  max-width: 600px
  margin: auto
</style>
