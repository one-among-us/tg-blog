<template>
    <div id="Poll">
        <div class="question">{{f.question}}</div>
        <div class="subtitle">{{subtitle}}</div>

        <div class="options" v-for="o of f.options" :key="o.data" :class="{dominant: o.voter_count === max && max !== 0}">
            <span class="text">{{o.text}}</span>
            <span class="f-grow1"></span>
            <span class="percentage">{{percent(o)}}</span>
            <div class="bar" :style="{width: percent(o)}"></div>
        </div>

        <div class="tail">Final Results - {{f.total_voter_count}} Responses</div>
    </div>
</template>

<script lang="ts" setup>
import {PollOption, TGPollFile} from "@/logic";
import {computed} from "vue";

const props = defineProps<{
    f: TGPollFile
}>()
const f = computed(() => props.f)

const max = computed(() => Math.max(...f.value.options.map(it => it.voter_count)))

function percent(o: PollOption)
{
    if (f.value.total_voter_count == 0) return "0%"
    return (o.voter_count / f.value.total_voter_count * 100).toFixed(0) + '%'
}

const subtitle = computed(() =>
{
    let txt = f.value.type == 'REGULAR' ? 'Poll' : 'Quiz'
    if (f.value.is_anonymous)
        txt = 'Anonymous ' + txt
    return txt
})
</script>

<style lang="sass" scoped>
@import "src/css/colors"

#Poll
    margin-left: 20px
    margin-right: 20px

    .question
        font-weight: bold

    .subtitle, .tail
        color: $color-text-light
        font-size: .9em

    .subtitle
        margin-bottom: 5px

    .options
        display: flex
        margin-bottom: 5px
        position: relative
        padding: 2px 10px

        .text, .percentage
            z-index: 10

        .percentage
            display: inline-block
            width: 50px
            text-align: right

        .bar
            position: absolute
            top: 0
            left: 0
            bottom: 0
            background: #ffe6dc
            border-radius: 5px

    .options.dominant
        font-weight: bold

        .bar
            background: #ffd4d0
</style>
