<template>
    <div id="Poll" :class="{ interactive: isInteractive, locked: isLocked }">
        <div class="question">{{ question }}</div>
        <div class="subtitle">
            <span>{{ subtitle }}</span>
            <span v-if="isInteractive && isClosed" class="closed-tag">· {{ msg.pollClosed }}</span>
            <span v-else-if="isInteractive && allowMultiple && !isLocked" class="multi-hint">· {{ msg.pollMultipleChoice }}</span>
        </div>

        <template v-if="isInteractive && pollState">
            <div v-for="o in pollState.options" :key="o.idx"
                 class="options interactive-opt"
                 :class="optionClasses(o.idx, o.voter_count)"
                 :role="isLocked ? undefined : 'button'"
                 :tabindex="isLocked ? undefined : 0"
                 @click="onOptionClick(o.idx)"
                 @keydown.enter.prevent="onOptionClick(o.idx)"
                 @keydown.space.prevent="onOptionClick(o.idx)">
                <span v-if="allowMultiple && !isLocked" class="opt-check" :class="{ checked: isPendingSelected(o.idx) }" aria-hidden="true">
                    <svg v-if="isPendingSelected(o.idx)" viewBox="0 0 16 16">
                        <path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M3.2 8.4l3.1 3.1 6.5-6.8"/>
                    </svg>
                </span>
                <span v-else-if="isQuiz && showQuizAnswer && pollState.correct_option_idx === o.idx" class="opt-badge correct" aria-hidden="true">✓</span>
                <span v-else-if="isQuiz && showQuizAnswer && isVoted(o.idx) && pollState.correct_option_idx !== o.idx" class="opt-badge wrong" aria-hidden="true">✕</span>
                <span v-else-if="isVoted(o.idx)" class="opt-badge selected" aria-hidden="true">●</span>

                <span class="text">{{ o.text }}</span>
                <span class="f-grow1"></span>
                <span class="percentage" v-if="showResults">{{ percentCount(o.voter_count, totalVoters) }}</span>
                <div class="bar" :style="{ width: showResults ? percentCount(o.voter_count, totalVoters) : '0%' }"></div>
            </div>

            <div v-if="isQuiz && showQuizAnswer && pollState.explanation" class="quiz-explanation">
                <div class="exp-title">{{ msg.pollExplanation }}</div>
                <div class="exp-body">{{ pollState.explanation }}</div>
            </div>

            <div v-if="allowMultiple && !isLocked" class="multi-actions">
                <button type="button" class="vote-submit-btn"
                        :disabled="voting || !canSubmitMultiple"
                        @click="submitMultiple">
                    {{ msg.pollVote }}
                </button>
            </div>

            <div class="tail tail-row">
                <span>{{ msg.pollResults(totalVoters) }}</span>
                <button v-if="canRetract" type="button" class="retract-btn" :disabled="voting" @click="retractVote">
                    {{ msg.pollRetractVote }}
                </button>
            </div>
        </template>

        <!-- 100% static read-only fallback (v1.2.1 behavior) -->
        <template v-else>
            <div class="options" v-for="o of f.options" :key="o.data" :class="{dominant: o.voter_count === max && max !== 0}">
                <span class="text">{{ o.text }}</span>
                <span class="f-grow1"></span>
                <span class="percentage">{{ percent(o) }}</span>
                <div class="bar" :style="{width: percent(o)}"></div>
            </div>

            <div class="tail">{{ msg.pollResults(f.total_voter_count ?? 0) }}</div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {MergedPoll, PollOption, TGPollFile} from "@/logic";
import {useTgbMessages} from "@/logic/messages";
import {sortedNumberArraysEqual} from "@/logic/state";
import {computed, ref, watch} from "vue";

const msg = useTgbMessages()

const props = defineProps<{
    f: TGPollFile
    interactive?: boolean
    pollState?: MergedPoll | null
    voting?: boolean
}>()

const emit = defineEmits<{
    (e: 'vote', pollId: string, optionIndices: number[]): void
}>()

const f = computed(() => props.f)
const isInteractive = computed(() => !!props.interactive && !!props.pollState)

// Static mode helpers
const max = computed(() => Math.max(0, ...(f.value.options ?? []).map(it => it.voter_count)))

function percent(o: PollOption) {
    if (!f.value.total_voter_count) return "0%"
    return (o.voter_count / f.value.total_voter_count * 100).toFixed(0) + '%'
}

// Interactive mode helpers
const pollState = computed(() => props.pollState ?? null)
const question = computed(() => pollState.value?.question ?? f.value.question)
const pollType = computed(() => pollState.value?.type ?? f.value.type)
const isAnonymous = computed(() => pollState.value ? pollState.value.is_anonymous : !!f.value.is_anonymous)
const isClosed = computed(() => pollState.value ? pollState.value.is_closed : !!f.value.is_closed)
const isQuiz = computed(() => pollType.value === 'QUIZ')
const allowMultiple = computed(() => pollState.value ? pollState.value.allow_multiple_answers : !!f.value.allow_multiple_answers)
const totalVoters = computed(() => pollState.value?.total_voter_count ?? f.value.total_voter_count ?? 0)
const myVotes = computed(() => pollState.value?.my_votes ?? [])
const hasVoted = computed(() => myVotes.value.length > 0)
const isLocked = computed(() => isClosed.value || (isQuiz.value && hasVoted.value))
const showQuizAnswer = computed(() => isQuiz.value && (hasVoted.value || isClosed.value))
const showResults = computed(() => !isQuiz.value || hasVoted.value || isClosed.value)
const interactiveMax = computed(() => Math.max(0, ...(pollState.value?.options ?? []).map(o => o.voter_count)))
const canRetract = computed(() => isInteractive.value && hasVoted.value && !isClosed.value && !isQuiz.value)

const pendingSelection = ref<number[]>([])

watch(myVotes, (votes, prev) => {
    if (prev !== undefined && sortedNumberArraysEqual(votes, prev)) return
    pendingSelection.value = [...votes].sort((a, b) => a - b)
}, {immediate: true})

const selectionChanged = computed(() => {
    const a = [...pendingSelection.value].sort((x, y) => x - y)
    const b = [...myVotes.value].sort((x, y) => x - y)
    return a.length !== b.length || a.some((v, i) => v !== b[i])
})

const canSubmitMultiple = computed(() => {
    if (!selectionChanged.value) return false
    if (!hasVoted.value && pendingSelection.value.length === 0) return false
    if (isQuiz.value && pendingSelection.value.length === 0) return false
    return true
})

function isVoted(idx: number): boolean {
    return myVotes.value.includes(idx)
}

function isPendingSelected(idx: number): boolean {
    return pendingSelection.value.includes(idx)
}

function percentCount(count: number, total: number): string {
    if (!total) return '0%'
    return `${Math.round((count / total) * 100)}%`
}

function optionClasses(idx: number, count: number): Record<string, boolean> {
    const correctIdx = pollState.value?.correct_option_idx
    const isCorrect = showQuizAnswer.value && correctIdx !== null && correctIdx !== undefined && correctIdx === idx
    const isWrongSelected = showQuizAnswer.value && correctIdx !== null && correctIdx !== undefined && isVoted(idx) && correctIdx !== idx
    return {
        dominant: showResults.value && count === interactiveMax.value && interactiveMax.value !== 0,
        clickable: !isLocked.value && !props.voting,
        selected: allowMultiple.value && !isLocked.value ? isPendingSelected(idx) : isVoted(idx),
        correct: isCorrect,
        wrong: isWrongSelected,
    }
}

function onOptionClick(idx: number) {
    if (!isInteractive.value || !pollState.value || isLocked.value || props.voting) return

    if (allowMultiple.value) {
        if (pendingSelection.value.includes(idx)) {
            pendingSelection.value = pendingSelection.value.filter(v => v !== idx)
        } else {
            pendingSelection.value = [...pendingSelection.value, idx].sort((a, b) => a - b)
        }
        return
    }

    // Single-choice
    if (!isQuiz.value && isVoted(idx)) {
        emit('vote', pollState.value.id, [])
    } else {
        emit('vote', pollState.value.id, [idx])
    }
}

function submitMultiple() {
    if (!pollState.value || !canSubmitMultiple.value || props.voting) return
    emit('vote', pollState.value.id, [...pendingSelection.value])
}

function retractVote() {
    if (!pollState.value || !canRetract.value || props.voting) return
    emit('vote', pollState.value.id, [])
}

const subtitle = computed(() => {
    let txt = pollType.value == 'REGULAR' ? msg.poll : msg.quiz
    if (isAnonymous.value)
        txt = msg.anonymousPrefix + txt
    return txt
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *

#Poll
    margin-left: 20px
    margin-right: 20px

    .question
        font-weight: bold

    .subtitle, .tail
        color: $color-text-light
        font-size: .9em

    .subtitle
        margin-bottom: 6px
        display: flex
        flex-wrap: wrap
        gap: 5px
        align-items: center

    .options
        display: flex
        align-items: center
        gap: 6px
        margin-bottom: 5px
        position: relative
        padding: 4px 10px
        border-radius: 6px
        overflow: hidden

        .text, .percentage, .opt-check, .opt-badge
            z-index: 10

        .percentage
            display: inline-block
            min-width: 44px
            text-align: right
            font-variant-numeric: tabular-nums

        .bar
            position: absolute
            top: 0
            left: 0
            bottom: 0
            background: #ffe6dc
            border-radius: 5px
            transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.25s ease

    .options.interactive-opt
        border: 1px solid rgba(112, 81, 42, 0.12)
        background: rgba(255, 255, 255, 0.45)
        transition: border-color 0.18s ease, background-color 0.18s ease

        &.clickable:hover
            border-color: rgba(255, 131, 115, 0.6)

        &.selected
            border-color: $color-text-special

        &.correct
            border-color: #2f9e44
            .bar
                background: rgba(47, 158, 68, 0.2)

        &.wrong
            border-color: #d94b4b
            .bar
                background: rgba(217, 75, 75, 0.18)

    .options.dominant
        font-weight: bold

        .bar
            background: #ffd4d0

    .opt-check
        width: 15px
        height: 15px
        border-radius: 4px
        border: 1.5px solid rgba(112, 81, 42, 0.38)
        background: #fff
        display: inline-flex
        align-items: center
        justify-content: center
        flex-shrink: 0

        svg
            width: 11px
            height: 11px

        &.checked
            border-color: $color-text-special
            background: $color-text-special
            color: #fff

    .opt-badge
        font-size: 0.8em
        font-weight: 700
        flex-shrink: 0
        line-height: 1

        &.selected
            color: $color-text-special

        &.correct
            color: #2b8a3e

        &.wrong
            color: #c93b3b

    .quiz-explanation
        margin: 8px 0
        padding: 8px 10px
        border-radius: 8px
        background: rgba(255, 131, 115, 0.1)
        border-left: 3px solid $color-text-special
        font-size: 0.88em

        .exp-title
            font-weight: 700
            color: $color-text-special-dark
            margin-bottom: 2px

        .exp-body
            color: $color-text-main
            line-height: 1.4

    .multi-actions
        margin: 6px 0

    .vote-submit-btn
        background: $color-text-special
        color: #fff
        border: none
        border-radius: 999px
        padding: 4px 14px
        font-size: 0.85em
        font-weight: 600
        font-family: inherit
        cursor: pointer
        transition: opacity 0.15s ease

        &:hover:not(:disabled)
            opacity: 0.9

        &:disabled
            opacity: 0.45
            cursor: not-allowed

    .tail-row
        display: flex
        align-items: center
        justify-content: space-between
        gap: 8px
        margin-top: 4px

    .retract-btn
        background: none
        border: none
        padding: 0
        color: $color-text-light
        font-size: 0.92em
        font-family: inherit
        cursor: pointer
        text-decoration: underline

        &:hover:not(:disabled)
            color: $color-text-special

        &:disabled
            opacity: 0.5
            cursor: wait
</style>
