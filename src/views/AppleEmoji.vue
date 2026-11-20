<template>
    <img v-if="currentSrc"
         class="tgb-apple-emoji"
         :src="currentSrc"
         :alt="emoji"
         draggable="false"
         loading="lazy"
         @error="tryNext" />
    <span v-else class="tgb-apple-emoji-fallback">{{ emoji }}</span>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import {getAppleEmojiCandidates, useAppleEmojiBaseUrl} from '@/logic/appleEmoji'

const injectedBaseUrl = useAppleEmojiBaseUrl()

const props = defineProps<{
    emoji: string
    baseUrl?: string
}>()

const attemptIdx = ref(0)

const effectiveBaseUrl = computed(() =>
    props.baseUrl !== undefined ? props.baseUrl : injectedBaseUrl.value
)

const candidates = computed(() =>
    getAppleEmojiCandidates(props.emoji, effectiveBaseUrl.value)
)

watch(() => [props.emoji, effectiveBaseUrl.value], () => {
    attemptIdx.value = 0
})

const currentSrc = computed(() => candidates.value[attemptIdx.value] ?? '')

function tryNext() {
    if (attemptIdx.value < candidates.value.length) {
        attemptIdx.value++
    }
}
</script>

<style lang="sass" scoped>
.tgb-apple-emoji
    display: inline-block
    width: var(--apple-emoji-size, 1.2em)
    height: var(--apple-emoji-size, 1.2em)
    vertical-align: -0.2em
    object-fit: contain
    user-select: none
    pointer-events: none

.tgb-apple-emoji-fallback
    display: inline-block
    line-height: 1
</style>
