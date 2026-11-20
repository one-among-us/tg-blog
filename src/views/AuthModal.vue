<template>
    <Teleport to="body" v-if="isClient && open">
        <div class="tgb-auth-backdrop" @click.self="close" role="dialog" aria-modal="true" :aria-label="msg.authTitle">
            <div class="tgb-auth-modal">
                <div class="modal-header">
                    <div>
                        <h3 class="modal-title">{{ msg.authTitle }}</h3>
                        <p class="modal-subtitle">{{ msg.authSubtitle }}</p>
                    </div>
                    <button type="button" class="close-btn clickable" @click="close" :aria-label="msg.authClose">
                        <i-ep-close />
                    </button>
                </div>

                <div class="modal-body">
                    <div v-if="!authLoaded" class="loading-providers">
                        <span class="loading-spinner" aria-hidden="true"></span>
                    </div>
                    <template v-else>
                        <div class="oauth-list" v-if="hasGithub || hasGoogle || hasOidc || hasTelegramWidget">
                            <a v-if="hasGithub" class="oauth-btn github" :href="githubLoginUrl">
                                <svg class="provider-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.05a9.38 9.38 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/>
                                </svg>
                                <span>{{ msg.authContinueWithGithub }}</span>
                            </a>

                            <a v-if="hasGoogle" class="oauth-btn google" :href="googleLoginUrl">
                                <svg class="provider-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.7-5.4 3.7-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"/>
                                </svg>
                                <span>{{ msg.authContinueWithGoogle }}</span>
                            </a>

                            <a v-if="hasOidc" class="oauth-btn oidc" :href="oidcLoginUrl">
                                <svg class="provider-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor" d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 4.2A2.8 2.8 0 0 1 14.8 8a2.8 2.8 0 0 1-2.8 2.8A2.8 2.8 0 0 1 9.2 8 2.8 2.8 0 0 1 12 5.2Zm0 12.6a6.4 6.4 0 0 1-5-2.4c.03-1.66 3.33-2.57 5-2.57 1.66 0 4.97.91 5 2.57a6.4 6.4 0 0 1-5 2.4Z"/>
                                </svg>
                                <span>{{ msg.authContinueWithOidc(oidcProviderName?.trim() || 'SSO') }}</span>
                            </a>

                            <div v-if="hasTelegramWidget" class="telegram-widget-wrap">
                                <div ref="tgWidgetEl" class="telegram-widget-host"></div>
                            </div>
                        </div>

                        <div class="divider" v-if="(hasGithub || hasGoogle || hasOidc || hasTelegramWidget) && hasEmail">
                            <span>{{ msg.authOrEmail }}</span>
                        </div>

                        <div v-if="hasEmail" class="magic-link-section">
                            <div v-if="magicLinkSentTo" class="sent-notice">
                                <div class="sent-icon">✉️</div>
                                <p>{{ msg.authMagicLinkSent(magicLinkSentTo) }}</p>
                            </div>
                            <form v-else class="magic-form" @submit.prevent="submitMagicLink">
                                <input v-model.trim="email" type="email" required autocomplete="email"
                                       class="field-input" :placeholder="msg.authEmailPlaceholder" :disabled="sending"/>
                                <input v-model.trim="displayName" type="text" maxlength="60" autocomplete="name"
                                       class="field-input" :placeholder="msg.authDisplayNamePlaceholder" :disabled="sending"/>
                                <AltchaWidget ref="altchaRef" :api="api" v-model="altchaPayload"/>
                                <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
                                <button type="submit" class="submit-btn"
                                        :disabled="sending || !email || !altchaPayload">
                                    {{ sending ? msg.authSendingMagicLink : msg.authSendMagicLink }}
                                </button>
                            </form>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, useId, watch} from 'vue'
import {LifeApiClient} from '@/logic/api'
import {useTgbMessages} from '@/logic/messages'
import {normalizeTelegramBotUsername} from '@/logic/url'
import AltchaWidget from '@/views/AltchaWidget.vue'

const msg = useTgbMessages()

const props = withDefaults(defineProps<{
    open: boolean
    api: LifeApiClient
    providers: string[]
    authLoaded?: boolean
    telegramBotUsername?: string | null
    oidcProviderName?: string | null
}>(), {
    authLoaded: true,
})

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'authenticated'): void
}>()

const isClient = ref(false)
const nextPath = ref('/')
const email = ref('')
const displayName = ref('')
const altchaPayload = ref<string | null>(null)
const altchaRef = ref<InstanceType<typeof AltchaWidget> | null>(null)
const sending = ref(false)
const errorMsg = ref<string | null>(null)
const magicLinkSentTo = ref<string | null>(null)
const tgWidgetEl = ref<HTMLElement | null>(null)

// Unique per-instance global callback name to prevent multi-instance collisions
const instanceUid = useId().replace(/[^a-zA-Z0-9_]/g, '_')
const tgCallbackName = `__tgbTelegramAuthCallback_${instanceUid}_${Math.random().toString(36).slice(2, 8)}`

const normalizedProviders = computed(() => props.providers.map(p => p.toLowerCase()))
const validTelegramBotUsername = computed(() => normalizeTelegramBotUsername(props.telegramBotUsername))
const hasGithub = computed(() => normalizedProviders.value.includes('github'))
const hasGoogle = computed(() => normalizedProviders.value.includes('google'))
const hasOidc = computed(() => normalizedProviders.value.includes('oidc'))
const hasEmail = computed(() =>
    props.authLoaded && (
        normalizedProviders.value.length === 0 ||
        normalizedProviders.value.includes('email') ||
        normalizedProviders.value.includes('magic_link') ||
        normalizedProviders.value.includes('magic-link')
    )
)
const hasTelegramWidget = computed(() =>
    props.authLoaded &&
    normalizedProviders.value.includes('telegram') &&
    !!validTelegramBotUsername.value
)

const githubLoginUrl = computed(() => props.api.getOAuthLoginUrl('github', nextPath.value))
const googleLoginUrl = computed(() => props.api.getOAuthLoginUrl('google', nextPath.value))
const oidcLoginUrl = computed(() => props.api.getOAuthLoginUrl('oidc', nextPath.value))

function refreshNextPath() {
    if (typeof window === 'undefined') {
        nextPath.value = '/'
        return
    }
    const rel = `${window.location.pathname}${window.location.search}${window.location.hash}`
    nextPath.value = rel && rel.startsWith('/') && !rel.startsWith('//') ? rel : '/'
}

function close() {
    emit('close')
}

function onKeydown(e: KeyboardEvent) {
    if (props.open && e.key === 'Escape') {
        close()
    }
}

async function submitMagicLink() {
    if (!email.value || !altchaPayload.value || sending.value) return
    sending.value = true
    errorMsg.value = null
    try {
        await props.api.requestMagicLink({
            email: email.value,
            display_name: displayName.value || undefined,
            altcha_payload: altchaPayload.value,
        })
        magicLinkSentTo.value = email.value
        altchaPayload.value = null
        altchaRef.value?.reset()
    } catch (err: any) {
        errorMsg.value = err?.message || 'Failed to send magic link'
        altchaPayload.value = null
        altchaRef.value?.reset()
    } finally {
        sending.value = false
    }
}

function cleanupTelegramCallback() {
    if (typeof window !== 'undefined' && (window as any)[tgCallbackName]) {
        delete (window as any)[tgCallbackName]
    }
}

function mountTelegramWidget() {
    if (typeof window === 'undefined' || !tgWidgetEl.value || !hasTelegramWidget.value || !validTelegramBotUsername.value) return
    cleanupTelegramCallback()
    tgWidgetEl.value.innerHTML = ''

    ;(window as any)[tgCallbackName] = async (tgUser: Record<string, any>) => {
        errorMsg.value = null
        try {
            await props.api.telegramCallback(tgUser)
            emit('authenticated')
            close()
        } catch (err: any) {
            errorMsg.value = err?.message || 'Telegram sign-in failed'
        }
    }

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', validTelegramBotUsername.value)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '10')
    script.setAttribute('data-onauth', `${tgCallbackName}(user)`)
    script.setAttribute('data-request-access', 'write')
    tgWidgetEl.value.appendChild(script)
}

watch(
    () => props.open,
    async (isOpen) => {
        altchaPayload.value = null
        altchaRef.value?.reset()
        errorMsg.value = null
        magicLinkSentTo.value = null
        if (isOpen) {
            refreshNextPath()
            await nextTick()
            mountTelegramWidget()
        } else {
            cleanupTelegramCallback()
        }
    }
)

watch(hasTelegramWidget, async (ready) => {
    if (props.open && ready) {
        await nextTick()
        mountTelegramWidget()
    }
})

onMounted(() => {
    isClient.value = true
    refreshNextPath()
    document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', onKeydown)
    }
    cleanupTelegramCallback()
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *
@use "css/global" as *

.tgb-auth-backdrop
    position: fixed
    inset: 0
    z-index: 1000010
    background: rgba(58, 40, 20, 0.45)
    backdrop-filter: blur(4px)
    display: flex
    align-items: center
    justify-content: center
    padding: 16px

.tgb-auth-modal
    width: 100%
    max-width: 390px
    background: $color-bg-card
    color: $color-text-main
    border-radius: 20px
    padding: 20px 22px 22px
    box-shadow: 0 18px 40px rgba(48, 30, 12, 0.22)
    box-sizing: border-box
    font-family: $font
    text-align: left

.modal-header
    display: flex
    align-items: flex-start
    justify-content: space-between
    gap: 12px
    margin-bottom: 16px

    .modal-title
        margin: 0
        font-size: 1.18em
        font-weight: 700
        color: $color-text-main

    .modal-subtitle
        margin: 4px 0 0
        font-size: 0.85em
        line-height: 1.4
        color: $color-text-light

    .close-btn
        background: transparent
        border: none
        color: $color-text-light
        padding: 4px
        border-radius: 8px
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 1.15em
        transition: background 0.15s ease, color 0.15s ease

        &:hover
            background: rgba(112, 81, 42, 0.08)
            color: $color-text-main

.loading-providers
    display: flex
    justify-content: center
    padding: 22px 0

.loading-spinner
    width: 22px
    height: 22px
    border-radius: 50%
    border: 2.5px solid rgba(255, 131, 115, 0.25)
    border-top-color: $color-text-special
    animation: tgb-auth-spin 0.75s linear infinite

@keyframes tgb-auth-spin
    to
        transform: rotate(360deg)

.oauth-list
    display: flex
    flex-direction: column
    gap: 9px

.oauth-btn
    display: flex
    align-items: center
    justify-content: center
    gap: 9px
    padding: 10px 14px
    border-radius: 12px
    border: 1px solid rgba(112, 81, 42, 0.16)
    background: $color-bg-4
    color: $color-text-main
    text-decoration: none
    font-size: 0.92em
    font-weight: 600
    transition: transform 0.12s ease, border-color 0.18s ease, background 0.18s ease

    &:hover
        border-color: rgba(255, 131, 115, 0.65)
        background: $color-bg-5
        transform: translateY(-1px)

    .provider-icon
        width: 18px
        height: 18px
        flex-shrink: 0

.telegram-widget-wrap
    display: flex
    justify-content: center
    padding-top: 2px

.divider
    display: flex
    align-items: center
    gap: 10px
    margin: 15px 0
    color: $color-text-light
    font-size: 0.8em

    &::before, &::after
        content: ""
        flex: 1
        height: 1px
        background: rgba(112, 81, 42, 0.14)

.magic-form
    display: flex
    flex-direction: column
    gap: 9px

.field-input
    width: 100%
    box-sizing: border-box
    padding: 9px 12px
    border-radius: 10px
    border: 1px solid rgba(112, 81, 42, 0.18)
    background: $color-bg-4
    color: $color-text-main
    font-size: 0.9em
    font-family: inherit
    transition: border-color 0.18s ease

    &::placeholder
        color: $color-text-light

    &:focus
        outline: none
        border-color: $color-text-special

.submit-btn
    margin-top: 2px
    padding: 10px 14px
    border-radius: 12px
    border: none
    background: $color-text-special
    color: #fff
    font-size: 0.92em
    font-weight: 600
    font-family: inherit
    cursor: pointer
    transition: opacity 0.18s ease, transform 0.12s ease

    &:hover:not(:disabled)
        opacity: 0.92
        transform: translateY(-1px)

    &:disabled
        opacity: 0.45
        cursor: not-allowed

.error-msg
    color: #c93b3b
    font-size: 0.82em
    line-height: 1.35

.sent-notice
    padding: 14px
    border-radius: 12px
    background: rgba(52, 168, 83, 0.08)
    border: 1px solid rgba(52, 168, 83, 0.25)
    text-align: center

    .sent-icon
        font-size: 1.6em
        margin-bottom: 6px

    p
        margin: 0
        font-size: 0.88em
        line-height: 1.45
        color: $color-text-main
</style>
