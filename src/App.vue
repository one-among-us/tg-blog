<template>
    <TgBlog v-if="url" :postsUrl="url" :messages="demoMessages" :translations="demoTranslations"></TgBlog>
    <div v-else class="tgb-card">
        <h2>Please specify demo path</h2>
        Available paths:
        <div><a href="/custom?url=/data/posts.json"><b>Local Test Channel (-1001564142575)</b></a></div>
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
import type {TgBlogTranslations} from "@/logic/messages";
import urlJoin from "url-join";
import {onMounted, ref} from "vue";

// Demo: Chinese UI overrides + content translation, enabled via ?zh
const useZh = new URLSearchParams(window.location.search).has('zh')
const demoMessages = useZh ? {
    searchPlaceholder: '搜索…',
    loadFailed: '加载动态失败：',
    forwardedFrom: '转发自：',
    replyTo: '回复：',
    voiceMessage: '语音消息',
    copyShareLink: '复制分享链接',
    linkCopied: '链接已复制！',
    poll: '投票',
    quiz: '测验',
    anonymousPrefix: '匿名',
    pollResults: (n: number) => `最终结果 - 共 ${n} 人参与`,
    photoIndex: (i: number, n: number) => `第 ${i} 张，共 ${n} 张`,
    dateFormat: 'YYYY年M月D日 H:mm',
} : undefined
// Demo translation: overrides the text of the newest post only (id resolved at runtime
// is unknown here, so use a fixed id from the test channel data)
const demoTranslations: TgBlogTranslations | undefined = useZh ? undefined : {
    3: {text: '<p>[Translated] Where the dream began w</p>'},
}

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
