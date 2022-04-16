<template>
    <div id="About">
        This is HyDEV's Template
        <div>for Vue 3 + Typescript + Vite + Vue Router + SASS + Element Plus + Class Components</div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';

@Options({components: {}})
export default class About extends Vue
{
}
</script>

<style lang="sass" scoped>
#About
    div
        font-size: 0.8em
</style>
