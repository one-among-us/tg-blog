<template>
    <div id="Home">
        <div class="title">Meow~</div>

        <el-button class="btn" @click="addFood">Add food</el-button>

        <div class="foods">{{foods.join('')}}</div>
        <div class="cats">{{cats.join('')}}</div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';

const possibleFoods = Array.from('🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🫐🥝🍅🫒🥥🥑🍆🥔🥕🌽🌶️🫑🥒🥬🥦🧄🧅🍄🥜🌰🍞🥐🥖🫓🥨🥯🥞🧇🧀🍖🍗🥩🥓🍔🍟🍕🌭🥪🌮🌯🫔🥙🧆🥚🍳🥘🍲🥣🥗🍿🧈🧂🥫🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🥮🍡🥟🥠🥡🦀🦞🦐🦑🦪🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯')

function randomChoice<T>(arr: T[]): T
{
    const i = Math.floor(Math.random() * arr.length)
    return arr[i]
}

@Options({components: {}})
export default class Home extends Vue
{
    foods = []
    cats = []

    addFood()
    {
        this.foods.push(randomChoice(possibleFoods))
        setTimeout(this.catComes, Math.random() * 500 + 1000)
    }

    catComes()
    {
        this.foods.shift()
        this.cats.push('🐱')
        setTimeout(this.catWalk, Math.random() * 500 + 1000)
    }

    catWalk()
    {
        this.cats[this.cats.indexOf('🐱')] = '🐈'
        setTimeout(this.catDisappear, Math.random() * 500 + 1000)
    }

    catDisappear()
    {
        this.cats.shift()
    }


}
</script>

<style lang="sass" scoped>
#Home > * + *
    margin-top: 10px

.title
    font-size: 1.5em

.cats, .foods
    font-size: 1.5em
    min-height: 20px
</style>
