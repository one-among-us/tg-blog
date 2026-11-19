<template>
    <div class="altcha-widget" :class="state" @click="handleClick" role="button" tabindex="0"
         @keydown.enter.prevent="handleClick" @keydown.space.prevent="handleClick"
         :aria-busy="state === 'solving'" :aria-checked="state === 'verified'">
        <span class="checkbox-box" aria-hidden="true">
            <span v-if="state === 'solving'" class="spinner"></span>
            <svg v-else-if="state === 'verified'" viewBox="0 0 16 16" class="check-icon">
                <path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
                      d="M3.2 8.4l3.1 3.1 6.5-6.8"/>
            </svg>
            <svg v-else-if="state === 'error'" viewBox="0 0 16 16" class="err-icon">
                <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      d="M4.5 4.5l7 7M11.5 4.5l-7 7"/>
            </svg>
        </span>
        <span class="label">{{ labelText }}</span>
        <span class="brand" aria-hidden="true">ALTCHA</span>
    </div>
</template>

<script lang="ts" setup>
import {computed, onUnmounted, ref, watch} from 'vue'
import {LifeApiClient} from '@/logic/api'
import {solveAltchaChallenge} from '@/logic/altcha'
import {useTgbMessages} from '@/logic/messages'

const msg = useTgbMessages()

const props = defineProps<{
    api: LifeApiClient
    modelValue?: string | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', payload: string | null): void
}>()

type WidgetState = 'idle' | 'solving' | 'verified' | 'error'
const state = ref<WidgetState>(props.modelValue ? 'verified' : 'idle')
const errorText = ref<string | null>(null)
let abortController: AbortController | null = null

watch(() => props.modelValue, (val) => {
    if (!val && state.value === 'verified') {
        state.value = 'idle'
        errorText.value = null
    }
})

const labelText = computed(() => {
    if (state.value === 'solving') return msg.altchaVerifying
    if (state.value === 'verified') return msg.altchaVerified
    if (state.value === 'error') return errorText.value || msg.altchaError
    return msg.altchaPrompt
})

async function startVerify() {
    if (state.value === 'solving' || state.value === 'verified') return
    abortController?.abort()
    const controller = new AbortController()
    abortController = controller
    state.value = 'solving'
    errorText.value = null
    emit('update:modelValue', null)

    try {
        const challenge = await props.api.getCaptchaChallenge(controller.signal)
        if (controller.signal.aborted) return
        const {payload} = await solveAltchaChallenge(challenge, controller.signal)
        if (controller.signal.aborted) return
        state.value = 'verified'
        emit('update:modelValue', payload)
    } catch (err: any) {
        if (controller.signal.aborted || err?.name === 'AbortError') return
        console.warn('[tg-blog] ALTCHA verification failed:', err)
        state.value = 'error'
        errorText.value = msg.altchaError
        emit('update:modelValue', null)
    } finally {
        if (abortController === controller) {
            abortController = null
        }
    }
}

function handleClick() {
    if (state.value === 'idle' || state.value === 'error') {
        void startVerify()
    }
}

function reset() {
    abortController?.abort()
    abortController = null
    state.value = 'idle'
    errorText.value = null
    emit('update:modelValue', null)
}

onUnmounted(() => {
    abortController?.abort()
})

defineExpose({reset, startVerify})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

.altcha-widget
    display: flex
    align-items: center
    gap: 8px
    padding: 7px 10px
    border-radius: 10px
    border: 1px solid rgba(112, 81, 42, 0.18)
    background: $color-bg-4
    color: $color-text-main
    font-size: 0.85em
    cursor: pointer
    user-select: none
    transition: border-color 0.2s ease, background-color 0.2s ease

    &:hover:not(.verified):not(.solving)
        border-color: rgba(255, 131, 115, 0.6)
        background: $color-bg-5

    &.solving
        cursor: wait
        opacity: 0.9

    &.verified
        cursor: default
        border-color: rgba(52, 168, 83, 0.45)
        background: rgba(52, 168, 83, 0.06)

    &.error
        border-color: rgba(217, 75, 75, 0.45)
        background: rgba(217, 75, 75, 0.05)

    .checkbox-box
        width: 18px
        height: 18px
        border-radius: 5px
        border: 1.5px solid rgba(112, 81, 42, 0.35)
        background: #fff
        display: inline-flex
        align-items: center
        justify-content: center
        flex-shrink: 0
        transition: all 0.2s ease

    &.verified .checkbox-box
        border-color: #2f9e44
        background: #2f9e44
        color: #fff

    &.error .checkbox-box
        border-color: #d94b4b
        color: #d94b4b

    .check-icon, .err-icon
        width: 13px
        height: 13px

    .spinner
        width: 11px
        height: 11px
        border-radius: 50%
        border: 2px solid rgba(255, 131, 115, 0.25)
        border-top-color: $color-text-special
        animation: tgb-spin 0.75s linear infinite

    .label
        flex: 1
        text-align: left
        line-height: 1.25

    .brand
        font-size: 0.72em
        letter-spacing: 0.06em
        color: $color-text-light
        opacity: 0.75
        font-weight: 600

@keyframes tgb-spin
    to
        transform: rotate(360deg)
</style>
