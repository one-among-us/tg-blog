<template>
    <div id="Poll">
        <div class="question">{{f.question}}</div>
        <div class="subtitle">{{subtitle}}</div>

        <div class="options" v-for="o of f.options" :class="{dominant: o.voter_count === max && max !== 0}">
            <span class="text">{{o.text}}</span>
            <span class="f-grow1"></span>
            <span class="percentage">{{percent(o)}}</span>
            <div class="bar" :style="{width: percent(o)}"></div>
        </div>

        <div class="tail">Final Results - {{f.total_voter_count}} Responses</div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {Prop} from "vue-property-decorator";
import {PollOption, TGPollFile} from "@/logic";

@Options({components: {}})
export default class Poll extends Vue
{
    @Prop({required: true}) f: TGPollFile

    get max()
    {
        return Math.max(...this.f.options.map(it => it.voter_count))
    }

    percent(o: PollOption)
    {
        if (this.f.total_voter_count == 0) return "0%"
        return (o.voter_count / this.f.total_voter_count * 100).toFixed(0) + '%'
    }

    get subtitle()
    {
        let txt = this.f.type == 'REGULAR' ? 'Poll' : 'Quiz'
        if (this.f.is_anonymous)
            txt = 'Anonymous ' + txt
        return txt
    }
}
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
            background: $color-bg-6
            border-radius: 5px

    .options.dominant
        font-weight: bold

        .bar
            background: #ffd4d0
</style>
