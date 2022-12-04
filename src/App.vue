<template>
    <TgBlog postsUrl="https://profile-api.hydev.org/posts.json"></TgBlog>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import TgBlog from "@/views/TgBlog.vue";

@Options({components: {TgBlog}})
export default class App extends Vue
{

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
