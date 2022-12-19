<template>
    <div id="Poll">
        <div class="question">{{f.question}}</div>
        <div class="subtitle">{{subtitle}}</div>

        <div class="options" v-for="o of f.options">
            <span class="text">{{o.text}}</span>
            <span class="f-grow1"></span>
            <span class="percentage">{{percent(o)}}</span>
            <div class="bar" :style="{width: percent(o)}"></div>
        </div>
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

    percent(o: PollOption)
    {
        return (o.voter_count / this.f.total_voter_count * 100).toFixed(0) + '%'
    }

    get subtitle()
    {
        let txt = this.f.type == 'REGULAR' ? 'Poll' : 'Quiz'
        if (this.f.is_anonymous)
            txt = 'Anonymous ' + txt
        return txt + " (Closed)"
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

    .subtitle
        color: $color-text-light
        font-size: .9em
        margin-bottom: 5px

    .options
        display: flex
        margin-bottom: 5px
        position: relative

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
            height: 1.5em
            background: $color-bg-6
            border-radius: 5px

</style>
