<template>
    <div ref="blogRootEl" class="tg-blog" :class="{margins: margins}">
        <slot :is-owner="isInteractive && me?.role === 'owner'"
              :pending-review-count="pendingReviewCount"
              :open-moderation="openModerationModal"></slot>

        <div class="search">
            <input v-model="search" ref="searchEl" :placeholder="msg.searchPlaceholder">
            <i-ic-round-search />
        </div>

        <div class="error tgb-card" v-if="fail">
            <h2>{{msg.loadFailed}} <br>{{purl}}</h2>
            {{fail}}
        </div>

        <div v-infinite-scroll="loadBelow" :infinite-scroll-distance="50"
             :infinite-scroll-disabled="endIdx >= searchedPosts.length"
             v-if="posts.length !== 0">
            <div ref="topSentinel" class="top-sentinel" v-if="startIdx > 0"></div>
            <PostView :p="post" :postsUrl="purl"
                      :interactive="isInteractive"
                      :interaction="isInteractive ? interactionsMap[post.id] : undefined"
                      :poll-voting="isInteractive ? !!pollVotingMap[post.id] : false"
                      v-for="(post, i) in visiblePosts" :key="post.id"
                      @play-file="a => audio = a" @click-img="ii => openImage(post, ii)"
                      @click-reply="clickReply"
                      @toggle-reaction="onToggleReaction"
                      @vote-poll="onVotePoll"
                      :class="{shake: replyShake.includes(startIdx + i)}" />
        </div>

        <AudioPlayer :audio="audio" v-if="audio"
                     @prev="audioNext(-1)" @next="audioNext(1)"/>
        <ImageViewer :imgs="viewerImgs" v-model:index="viewerImgIndex" />
        <AuthModal v-if="isInteractive && apiClient"
                   :open="authModalOpen"
                   :api="apiClient"
                   :providers="authProviders"
                   :auth-loaded="authLoaded"
                   :telegram-bot-username="resolvedTelegramBotUsername"
                   :telegram-client-id="apiTelegramClientId"
                   :oidc-provider-name="oidcProviderName"
                   :initial-error="authModalError"
                   @close="authModalOpen = false; authModalError = null"
                   @authenticated="authModalError = null; refreshAuthAndInteractions()" />
        <ModerationModal v-if="isInteractive && apiClient && me?.role === 'owner'"
                         :open="modModalOpen"
                         :api="apiClient"
                         :focus-comment-id="reviewFocusCommentId"
                         @close="modModalOpen = false"
                         @updated="n => pendingReviewCount = n"
                         @jump-post="onModJumpPost" />
    </div>
</template>

<script lang="ts" setup>
import {
    AllowedReactionItem,
    CommentDTO,
    CustomEmojiAsset,
    MergedReaction,
    Post,
    PostInteractionState,
    ReactionTogglePayload,
    StickerPack,
    StreamAllowedReactionsUpdatedEvent,
    StreamCommentDeletedEvent,
    StreamCommentReactionUpdatedEvent,
    StreamPollUpdatedEvent,
    StreamPostDeletedEvent,
    StreamPostViewsUpdatedEvent,
    StreamReactionUpdatedEvent,
    TGFile,
    UpdateProfilePayload,
    UserDTO,
} from "@/logic/models";
import {LifeApiClient, LifeStreamClient} from "@/logic/api";
import {DEFAULT_APPLE_EMOJI_BASE_URL, tgbAppleEmojiKey} from "@/logic/appleEmoji";
import {extractCustomEmojiAssets, inferEpochEmojiBase} from "@/logic/reactions";
import {
    applyOptimisticReactionToggle,
    formatPostDate,
    mergePostsWithLive,
    mergePublicPoll,
    mergePublicReactions,
    removeDeletedPost,
    shouldIncrementCommentCount,
} from "@/logic/state";
import {CommentStreamListener, TgBlogInteractiveContext, tgbInteractiveKey} from "@/logic/interactive";
import {resolveApiAssetUrl, resolvePostsUrl, resolveRelativeUrl} from "@/logic/url";
import PostView from "@/views/PostView.vue";
import {initSpoilers} from '@/logic/spoilers';
import ImageViewer, {TrackedImage, ViewedImage} from "@/views/ImageViewer.vue";
import {applyTranslations, createMessages, TgBlogMessages, TgBlogTranslations, tgbMessagesKey} from "@/logic/messages";
import {computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, onUpdated, provide, reactive, ref, watch} from "vue";

const AudioPlayer = defineAsyncComponent(() => import("./AudioPlayer.vue"))
const AuthModal = defineAsyncComponent(() => import("./AuthModal.vue"))
const ModerationModal = defineAsyncComponent(() => import("./ModerationModal.vue"))

// Post URL for loading the posts
const props = withDefaults(defineProps<{
    postsUrl: string
    postsData?: Post[]
    margins?: boolean
    /** UI string overrides; unprovided keys fall back to English defaults */
    messages?: Partial<TgBlogMessages>
    /** Per-post content translations keyed by post id; missing ids show the original text */
    translations?: TgBlogTranslations
    /** Optional Life v2 API base URL (e.g. '/api/life'). When omitted, tg-blog runs in 100% static read-only mode. */
    apiUrl?: string
    /** Optional Telegram bot username for the Telegram Login Widget inside AuthModal */
    telegramBotUsername?: string
    /** Optional reactive ?shared= post id override (useful in SSR routers like Nuxt 4 that defer query restoration until after hydration) */
    sharedId?: number | null
    /** Base URL for Apple emoji PNGs (e.g. jsdelivr emoji-datasource-apple). Set to "" to disable and use native emojis. */
    appleEmojiBaseUrl?: string
    /** Optional list of default avatar URLs rotated deterministically for anonymous commenters */
    anonAvatars?: string[]
}>(), {
    margins: true,
    appleEmojiBaseUrl: DEFAULT_APPLE_EMOJI_BASE_URL,
})
const margins = computed(() => props.margins)
const isInteractive = computed(() => !!props.apiUrl)
provide(tgbAppleEmojiKey, computed(() => props.appleEmojiBaseUrl ?? ''))

const msg = createMessages(undefined)
provide(tgbMessagesKey, msg)
// Initialized here, applied via watch registered after rebuildPosts is defined below
let pendingMessages = props.messages

const blogRootEl = ref<HTMLElement | null>(null)
const searchEl = ref<HTMLInputElement>()
const purl = computed(() => resolvePostsUrl(props.postsUrl))

const search = ref("")

// Loaded posts
const posts = ref<Post[]>([])

// Constants: imgList and postImgIndex are computed based on posts
const imgList = ref<TrackedImage[]>([])
const postImgIndex = ref<number[]>([])

// Bi-directional infinite scroll window over searchedPosts: [startIdx, endIdx)
const PAGE_SIZE = 20
const LOAD_STEP = 10
const startIdx = ref(0)
const endIdx = ref(PAGE_SIZE)

// Sentinel for upward scroll
const topSentinel = ref<HTMLElement | null>(null)
let topObserver: IntersectionObserver | null = null
// Suppress upward-load observer until initial scroll (e.g. for ?shared) settles.
const upwardScrollReady = ref(false)

// Audio player will be open when audio != null, and image viewer will be open when img != -1
const audio = ref<TGFile | null>(null)
const img = ref(-1)
const standaloneImgs = ref<ViewedImage[] | null>(null)
const standaloneImgIdx = ref(-1)

// The indicies of the post that's currently shaking
const replyShake = ref<number[]>([])
const replyLoading = ref(false)

// Whether loading failed
const fail = ref<string | null>(null)

// --- Interactive state (only active when apiUrl is provided) ---
const apiClient = computed(() => (props.apiUrl ? new LifeApiClient(props.apiUrl) : null))
const interactionsMap = reactive<Record<number, PostInteractionState>>({})
const pollVotingMap = reactive<Record<number, boolean>>({})
const me = ref<UserDTO | null>(null)
const authProviders = ref<string[]>([])
const apiTelegramBotUsername = ref<string | null>(null)
const apiTelegramClientId = ref<string | null>(null)
const oidcProviderName = ref<string | null>(null)
const allowAnonComments = ref(false)
const allowedReactions = ref<AllowedReactionItem[] | null>(null)
const customEmojiCatalog = ref<CustomEmojiAsset[]>([])
const customEmojiCatalogLoading = ref(false)
const customEmojiCatalogReady = ref(false)
const stickerPacks = ref<StickerPack[]>([])
const stickersLoading = ref(false)
const authLoaded = ref(false)
const authModalOpen = ref(false)
const authModalError = ref<string | null>(null)
const modModalOpen = ref(false)
const pendingReviewCount = ref(0)
const reviewFocusCommentId = ref<number | null>(null)
let reviewQueryHandled = false

const resolvedTelegramBotUsername = computed(
    () => props.telegramBotUsername || apiTelegramBotUsername.value || null
)

const channelCustomEmojis = computed(() => extractCustomEmojiAssets(posts.value, purl.value))
const allCustomEmojis = computed((): Record<string, string> => {
    const merged: Record<string, string> = {...channelCustomEmojis.value}
    for (const ce of customEmojiCatalog.value) {
        if (ce.id && ce.url && !merged[ce.id]) {
            merged[ce.id] = ce.url
        }
    }
    return merged
})
const epochEmojiBase = computed(() => inferEpochEmojiBase(posts.value, purl.value))

const hydratedIds = new Set<number>()
const hydratingIds = new Set<number>()
const postHydratedAt = new Map<number, number>()
const seenCommentIds = new Set<number>()
const deletedCommentIds = new Set<number>()
const reactionSeqMap = new Map<number, number>()
const reactionInFlightMap = new Map<number, number>()
const commentSubscribers = new Map<number, Set<CommentStreamListener>>()
const sseCreatedPosts = new Map<number, Post>()
const deletedPostIds = new Set<number>()
const viewedPostIds = new Set<number>()
const queuedViewIds = new Set<number>()
const pendingViewTimers = new Map<number, ReturnType<typeof setTimeout>>()
let viewObserver: IntersectionObserver | null = null
let viewFlushTimer: ReturnType<typeof setTimeout> | null = null
let customEmojisLoaded = false
let customEmojisPromise: Promise<CustomEmojiAsset[]> | null = null
let stickersLoaded = false
let stickersPromise: Promise<StickerPack[]> | null = null
let streamClient: LifeStreamClient | null = null
let isClientMounted = false
let sharedHandled = false
let upwardReadyTimer: ReturnType<typeof setTimeout> | null = null

const visiblePosts = computed((): Post[] => {
    const list = searchedPosts.value
    const s = Math.max(0, Math.min(startIdx.value, list.length))
    const e = Math.max(s, Math.min(endIdx.value, list.length))
    return list.slice(s, e)
})

const visiblePostIds = computed((): number[] => visiblePosts.value.map(p => p.id))

function ensurePostInteraction(postId: number): PostInteractionState {
    if (!interactionsMap[postId]) {
        const post = posts.value.find(p => p.id === postId)
        interactionsMap[postId] = {
            reactions: (post?.reactions ?? []).map(r => ({
                reaction_key: r.custom_emoji_id ? `c:${r.custom_emoji_id}` : `e:${r.emoji ?? ''}`,
                emoji: r.emoji ?? null,
                custom_emoji_id: r.custom_emoji_id ?? null,
                tg_count: r.count,
                web_count: 0,
                count: r.count,
                reacted: false,
            })),
            poll: null,
            comment_count: 0,
        }
    }
    return interactionsMap[postId]
}

async function hydrateInteractions(ids: number[], force = false): Promise<void> {
    const client = apiClient.value
    if (!isInteractive.value || !client || typeof window === 'undefined') return
    const toFetch = ids.filter(id =>
        Number.isFinite(id) &&
        !hydratingIds.has(id) &&
        (force || !hydratedIds.has(id))
    )
    if (!toFetch.length) return

    toFetch.forEach(id => hydratingIds.add(id))
    try {
        // Chunk by 50 IDs to keep query URLs compact
        for (let i = 0; i < toFetch.length; i += 50) {
            const chunk = toFetch.slice(i, i + 50)
            const snapshotAt = Date.now()
            const res = await client.getInteractions(chunk)
            // Ignore stale response if apiUrl changed mid-flight
            if (apiClient.value !== client) return
            allowAnonComments.value = !!res.allow_anon_comments
            me.value = res.me ?? null
            if (me.value?.role === 'owner') {
                void refreshModerationCount()
            } else {
                pendingReviewCount.value = 0
            }
            if (Array.isArray(res.allowed_reactions)) {
                allowedReactions.value = res.allowed_reactions
            }
            if (res.posts) {
                for (const [idStr, state] of Object.entries(res.posts)) {
                    const pid = Number(idStr)
                    if (Number.isFinite(pid)) {
                        interactionsMap[pid] = state
                        postHydratedAt.set(pid, snapshotAt)
                    }
                }
            }
            chunk.forEach(id => {
                hydratedIds.add(id)
                if (!postHydratedAt.has(id)) postHydratedAt.set(id, snapshotAt)
            })
        }
    } catch (err) {
        console.warn('[tg-blog] Failed to hydrate interactions:', err)
    } finally {
        toFetch.forEach(id => hydratingIds.delete(id))
    }
}

async function ensureAuthInfo(force = false): Promise<void> {
    const client = apiClient.value
    if (!client || typeof window === 'undefined') return
    if (authLoaded.value && !force) return
    try {
        const res = await client.getAuthMe()
        if (apiClient.value !== client) return
        me.value = res.user ?? null
        authProviders.value = res.providers ?? []
        allowAnonComments.value = !!res.allow_anon_comments
        apiTelegramBotUsername.value = res.telegram_bot_username ?? null
        apiTelegramClientId.value = res.telegram_client_id ?? null
        oidcProviderName.value = res.oidc_provider_name ?? null
        authLoaded.value = true
    } catch (err) {
        console.warn('[tg-blog] Failed to load auth info:', err)
    }
}

async function refreshModerationCount(): Promise<void> {
    const client = apiClient.value
    if (!client || me.value?.role !== 'owner') {
        pendingReviewCount.value = 0
        return
    }
    try {
        const res = await client.getModerationQueue()
        if (apiClient.value !== client) return
        pendingReviewCount.value = res.pending_count ?? 0
    } catch {
        // Non-fatal background count check
    }
}

function openModerationModal(focusId?: number | null): void {
    if (focusId !== undefined) reviewFocusCommentId.value = focusId
    modModalOpen.value = true
}

function onModJumpPost(postId: number): void {
    modModalOpen.value = false
    clickReply(postId)
}

function handleReviewQueryOnLoad(): void {
    if (reviewQueryHandled || typeof window === 'undefined' || !isInteractive.value) return
    const raw = new URL(window.location.href).searchParams.get('review')
    if (raw === null) return
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
        reviewFocusCommentId.value = parsed
    }
    if (me.value?.role === 'owner') {
        reviewQueryHandled = true
        modModalOpen.value = true
    } else if (!me.value) {
        openAuthModal()
    }
}

async function refreshAuthAndInteractions(): Promise<void> {
    await ensureAuthInfo(true)
    hydratedIds.clear()
    await hydrateInteractions(visiblePostIds.value, true)
    if (reviewFocusCommentId.value !== null && me.value?.role === 'owner' && !reviewQueryHandled) {
        reviewQueryHandled = true
        modModalOpen.value = true
    }
    commentSubscribers.forEach(set => {
        set.forEach(listener => listener.onAuthChanged())
    })
}

async function handleLogout(): Promise<void> {
    const client = apiClient.value
    if (!client) return
    try {
        await client.logout()
    } catch (err) {
        console.warn('[tg-blog] Logout request failed:', err)
    } finally {
        me.value = null
        await refreshAuthAndInteractions()
    }
}

async function handleUpdateProfile(payload: UpdateProfilePayload): Promise<void> {
    const client = apiClient.value
    if (!client) return
    const updated = await client.updateMe(payload)
    me.value = updated
}

function formatAuthProviderName(rawProvider: string | null): string {
    switch ((rawProvider || '').trim().toLowerCase()) {
        case 'google':
            return 'Google'
        case 'github':
            return 'GitHub'
        case 'oidc':
            return oidcProviderName.value?.trim() || 'SSO'
        default:
            return ''
    }
}

function handleAuthErrorQueryOnLoad(): void {
    if (typeof window === 'undefined' || !isInteractive.value) return
    const url = new URL(window.location.href)
    const errCode = url.searchParams.get('auth_error')
    if (!errCode) return
    const providerName = formatAuthProviderName(url.searchParams.get('auth_provider'))
    url.searchParams.delete('auth_error')
    url.searchParams.delete('auth_provider')
    const cleaned = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState(window.history.state, '', cleaned)

    let message: string
    if (errCode === 'cancelled') {
        message = msg.authErrorCancelled(providerName)
    } else if (errCode === 'state_expired') {
        message = msg.authErrorStateExpired
    } else {
        message = msg.authErrorFailed(providerName)
    }
    authModalError.value = message
    openAuthModal()
}

function openAuthModal(): void {
    authModalOpen.value = true
    void ensureAuthInfo()
}

function subscribeComments(postId: number, listener: CommentStreamListener): () => void {
    let set = commentSubscribers.get(postId)
    if (!set) {
        set = new Set()
        commentSubscribers.set(postId, set)
    }
    set.add(listener)
    return () => {
        set?.delete(listener)
        if (set && set.size === 0) {
            commentSubscribers.delete(postId)
        }
    }
}

function markCommentsSeen(_postId: number, commentIds: number[]): void {
    for (const id of commentIds) {
        seenCommentIds.add(id)
    }
}

function notifyLocalCommentCreated(comment: CommentDTO): void {
    if (seenCommentIds.has(comment.id)) return
    seenCommentIds.add(comment.id)
    const state = ensurePostInteraction(comment.post_id)
    state.comment_count = (state.comment_count ?? 0) + 1
}

function notifyLocalCommentDeleted(postId: number, commentId: number): void {
    if (deletedCommentIds.has(commentId)) return
    deletedCommentIds.add(commentId)
    const state = interactionsMap[postId]
    if (state) {
        state.comment_count = Math.max(0, (state.comment_count ?? 0) - 1)
    }
}

async function ensureCustomEmojis(force = false): Promise<CustomEmojiAsset[]> {
    const client = apiClient.value
    if (!client || typeof window === 'undefined') return customEmojiCatalog.value
    if (customEmojisLoaded && !force) return customEmojiCatalog.value
    if (customEmojisPromise && !force) return customEmojisPromise

    customEmojiCatalogLoading.value = true
    const req = (async () => {
        try {
            const res = await client.getCustomEmojis()
            if (apiClient.value !== client) return customEmojiCatalog.value
            const list = Array.isArray(res?.emojis) ? res.emojis : []
            customEmojiCatalog.value = list.map(item => ({
                ...item,
                url: item.url ? resolveApiAssetUrl(item.url, props.apiUrl, purl.value) : item.url,
            }))
            customEmojisLoaded = true
            return customEmojiCatalog.value
        } catch (err) {
            console.warn('[tg-blog] Failed to load custom emojis:', err)
            return customEmojiCatalog.value
        } finally {
            customEmojiCatalogLoading.value = false
            customEmojiCatalogReady.value = true
            if (customEmojisPromise === req) customEmojisPromise = null
        }
    })()
    customEmojisPromise = req
    return req
}

async function ensureStickers(force = false): Promise<StickerPack[]> {
    const client = apiClient.value
    if (!client || typeof window === 'undefined') return stickerPacks.value
    if (stickersLoaded && !force) return stickerPacks.value
    if (stickersPromise && !force) return stickersPromise

    stickersLoading.value = true
    const req = (async () => {
        try {
            const res = await client.getStickers()
            if (apiClient.value !== client) return stickerPacks.value
            const packs = Array.isArray(res?.packs) ? res.packs : []
            stickerPacks.value = packs.map(pack => ({
                ...pack,
                stickers: (pack.stickers ?? []).map(st => ({
                    ...st,
                    url: st.url ? resolveApiAssetUrl(st.url, props.apiUrl, purl.value) : st.url,
                    thumb: st.thumb ? resolveApiAssetUrl(st.thumb, props.apiUrl, purl.value) : st.thumb,
                })),
            }))
            stickersLoaded = true
            return stickerPacks.value
        } catch (err) {
            console.warn('[tg-blog] Failed to load stickers:', err)
            return stickerPacks.value
        } finally {
            stickersLoading.value = false
            if (stickersPromise === req) stickersPromise = null
        }
    })()
    stickersPromise = req
    return req
}

function openMediaViewer(imgs: ViewedImage[], index = 0): void {
    if (!imgs.length) return
    standaloneImgs.value = imgs
    standaloneImgIdx.value = Math.max(0, Math.min(index, imgs.length - 1))
}

// Always provide a reactive interactive context so dynamic apiUrl changes work seamlessly
const interactiveCtx: TgBlogInteractiveContext = {
    api: apiClient,
    me,
    providers: authProviders,
    telegramBotUsername: resolvedTelegramBotUsername,
    telegramClientId: apiTelegramClientId,
    allowAnonComments,
    authLoaded,
    channelCustomEmojis,
    customEmojiCatalog,
    customEmojiCatalogLoading,
    customEmojiCatalogReady,
    allCustomEmojis,
    stickerPacks,
    stickersLoading,
    epochEmojiBase,
    allowedReactions,
    anonAvatars: computed(() => props.anonAvatars ?? []),
    openAuthModal,
    ensureAuthInfo: () => ensureAuthInfo(false),
    ensureCustomEmojis,
    ensureStickers,
    openMediaViewer,
    refreshAuthAndInteractions,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    subscribeComments,
    markCommentsSeen,
    notifyLocalCommentCreated,
    notifyLocalCommentDeleted,
}
provide(tgbInteractiveKey, interactiveCtx)

async function onToggleReaction(postId: number, payload: ReactionTogglePayload): Promise<void> {
    const client = apiClient.value
    if (!isInteractive.value || !client) return
    const state = ensurePostInteraction(postId)
    const prevSnapshot: MergedReaction[] = state.reactions.map(r => ({...r}))

    const seq = (reactionSeqMap.get(postId) ?? 0) + 1
    reactionSeqMap.set(postId, seq)
    reactionInFlightMap.set(postId, (reactionInFlightMap.get(postId) ?? 0) + 1)

    // Optimistic UI update
    state.reactions = applyOptimisticReactionToggle(state.reactions, payload)

    try {
        const res = await client.toggleReaction(postId, payload)
        // Ignore out-of-order HTTP responses if a newer toggle was triggered
        if (apiClient.value === client && reactionSeqMap.get(postId) === seq) {
            ensurePostInteraction(postId).reactions = res.reactions
        }
    } catch (err) {
        console.warn('[tg-blog] Reaction toggle failed:', err)
        const remaining = (reactionInFlightMap.get(postId) ?? 1) - 1
        if (apiClient.value === client) {
            if (reactionSeqMap.get(postId) === seq && remaining === 0) {
                // Safe to rollback directly: no newer mutation occurred
                ensurePostInteraction(postId).reactions = prevSnapshot
            } else {
                // Concurrent/newer toggles were interleaved; resync authoritative server state
                void hydrateInteractions([postId], true)
            }
        }
    } finally {
        const nextInFlight = Math.max(0, (reactionInFlightMap.get(postId) ?? 1) - 1)
        if (nextInFlight === 0) {
            reactionInFlightMap.delete(postId)
        } else {
            reactionInFlightMap.set(postId, nextInFlight)
        }
    }
}

async function onVotePoll(postId: number, pollId: string, optionIndices: number[]): Promise<void> {
    const client = apiClient.value
    if (!isInteractive.value || !client) return
    if (pollVotingMap[postId]) return
    pollVotingMap[postId] = true
    try {
        const res = await client.votePoll(pollId, optionIndices)
        if (apiClient.value === client) {
            ensurePostInteraction(postId).poll = res.poll
        }
    } catch (err) {
        console.warn('[tg-blog] Poll vote failed, resyncing poll state:', err)
        if (apiClient.value === client) {
            void hydrateInteractions([postId], true)
        }
    } finally {
        pollVotingMap[postId] = false
    }
}

function handleStreamReactionUpdated(ev: StreamReactionUpdatedEvent): void {
    // Skip SSE updates while an optimistic toggle is in flight for this post to prevent flicker/races
    if ((reactionInFlightMap.get(ev.post_id) ?? 0) > 0) return
    const state = ensurePostInteraction(ev.post_id)
    state.reactions = mergePublicReactions(state.reactions, ev.reactions)
}

function handleStreamPollUpdated(ev: StreamPollUpdatedEvent): void {
    const state = ensurePostInteraction(ev.post_id)
    state.poll = mergePublicPoll(state.poll, ev.poll)
}

function handleStreamCommentCreated(comment: CommentDTO): void {
    const shouldInc = shouldIncrementCommentCount(
        seenCommentIds,
        postHydratedAt.get(comment.post_id),
        comment
    )
    seenCommentIds.add(comment.id)
    if (shouldInc) {
        const state = ensurePostInteraction(comment.post_id)
        state.comment_count = (state.comment_count ?? 0) + 1
    }
    const subs = commentSubscribers.get(comment.post_id)
    subs?.forEach(listener => listener.onCreated(comment))
}

function handleStreamCommentDeleted(ev: StreamCommentDeletedEvent): void {
    if (!deletedCommentIds.has(ev.comment_id)) {
        deletedCommentIds.add(ev.comment_id)
        const state = interactionsMap[ev.post_id]
        if (state) {
            state.comment_count = Math.max(0, (state.comment_count ?? 0) - 1)
        }
    }
    const subs = commentSubscribers.get(ev.post_id)
    subs?.forEach(listener => listener.onDeleted(ev))
}

function handleStreamCommentReactionUpdated(ev: StreamCommentReactionUpdatedEvent): void {
    const subs = commentSubscribers.get(ev.post_id)
    subs?.forEach(listener => listener.onReactionUpdated?.(ev))
}

function clampWindow(len: number): void {
    if (len <= 0) {
        startIdx.value = 0
        endIdx.value = 0
        return
    }
    startIdx.value = Math.max(0, Math.min(startIdx.value, len - 1))
    endIdx.value = Math.max(startIdx.value, Math.min(endIdx.value, len))
}

function handleStreamPostCreated(post: Post): void {
    if (post.type === 'service') return
    deletedPostIds.delete(post.id)
    if (rawPosts.some(p => p.id === post.id)) {
        handleStreamPostUpdated(post)
        return
    }
    const cloned = clonePost(post)
    replacePostUrls([cloned])
    sseCreatedPosts.set(cloned.id, cloned)
    // rawPosts is reverse-chronological (newest first)
    const insertIdx = rawPosts.findIndex(p => p.id < cloned.id)
    if (insertIdx < 0) rawPosts.push(cloned)
    else rawPosts.splice(insertIdx, 0, cloned)
    rebuildPosts()

    const list = searchedPosts.value
    const foundIdx = list.findIndex(p => p.id === cloned.id)
    if (foundIdx >= 0) {
        if (startIdx.value === 0) {
            endIdx.value = Math.min(Math.max(endIdx.value + 1, PAGE_SIZE), list.length)
        } else if (foundIdx <= startIdx.value) {
            startIdx.value = Math.min(startIdx.value + 1, list.length - 1)
            endIdx.value = Math.min(endIdx.value + 1, list.length)
        }
    }
    clampWindow(list.length)
    void hydrateInteractions([cloned.id])
}

function handleStreamPostUpdated(post: Post): void {
    if (post.type === 'service') return
    const cloned = clonePost(post)
    replacePostUrls([cloned])
    if (sseCreatedPosts.has(cloned.id)) {
        sseCreatedPosts.set(cloned.id, cloned)
    }
    const idx = rawPosts.findIndex(p => p.id === cloned.id)
    if (idx >= 0) {
        rawPosts.splice(idx, 1, cloned)
        rebuildPosts()
    }
}

function handleStreamPostDeleted(ev: StreamPostDeletedEvent): void {
    deletedPostIds.add(ev.post_id)
    sseCreatedPosts.delete(ev.post_id)
    hydratedIds.delete(ev.post_id)
    postHydratedAt.delete(ev.post_id)
    delete interactionsMap[ev.post_id]
    delete pollVotingMap[ev.post_id]

    const nextRaw = removeDeletedPost(rawPosts, ev.post_id)
    if (nextRaw !== rawPosts) {
        rawPosts = nextRaw
        rebuildPosts()
        clampWindow(searchedPosts.value.length)
    }
}

function handleStreamPostViewsUpdated(ev: StreamPostViewsUpdatedEvent): void {
    if (!ev?.views) return
    for (const [idStr, viewsStr] of Object.entries(ev.views)) {
        const pid = Number(idStr)
        if (Number.isFinite(pid) && typeof viewsStr === 'string') {
            ensurePostInteraction(pid).views = viewsStr
        }
    }
}

function clearViewTrackingTimers(): void {
    for (const timer of pendingViewTimers.values()) {
        clearTimeout(timer)
    }
    pendingViewTimers.clear()
    if (viewFlushTimer) {
        clearTimeout(viewFlushTimer)
        viewFlushTimer = null
    }
}

function scheduleViewFlush(): void {
    if (viewFlushTimer || !isInteractive.value || typeof window === 'undefined') return
    viewFlushTimer = setTimeout(() => {
        viewFlushTimer = null
        void flushQueuedViews()
    }, 500)
}

async function flushQueuedViews(): Promise<void> {
    const client = apiClient.value
    if (!client || !isInteractive.value || typeof window === 'undefined') return
    if (queuedViewIds.size === 0) return

    const allIds = Array.from(queuedViewIds)
    queuedViewIds.clear()

    for (let i = 0; i < allIds.length; i += 50) {
        const chunk = allIds.slice(i, i + 50)
        try {
            const res = await client.recordViews(chunk)
            if (apiClient.value !== client) return
            if (res?.views) {
                for (const [idStr, viewsStr] of Object.entries(res.views)) {
                    const pid = Number(idStr)
                    if (Number.isFinite(pid) && typeof viewsStr === 'string') {
                        ensurePostInteraction(pid).views = viewsStr
                    }
                }
            }
        } catch (err) {
            console.warn('[tg-blog] Failed to record post views:', err)
        }
    }
}

function setupViewObserver(): void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    if (!isInteractive.value || !blogRootEl.value) {
        viewObserver?.disconnect()
        viewObserver = null
        return
    }
    if (!viewObserver) {
        viewObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const rawId = (entry.target as HTMLElement).id || ''
                const match = /^message-(\d+)$/.exec(rawId)
                if (!match) continue
                const pid = Number(match[1])
                if (!Number.isFinite(pid) || viewedPostIds.has(pid)) continue

                if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                    if (!pendingViewTimers.has(pid)) {
                        const timer = setTimeout(() => {
                            pendingViewTimers.delete(pid)
                            if (viewedPostIds.has(pid)) return
                            viewedPostIds.add(pid)
                            queuedViewIds.add(pid)
                            scheduleViewFlush()
                        }, 300)
                        pendingViewTimers.set(pid, timer)
                    }
                } else {
                    const existing = pendingViewTimers.get(pid)
                    if (existing) {
                        clearTimeout(existing)
                        pendingViewTimers.delete(pid)
                    }
                }
            }
        }, {threshold: [0.35]})
    } else {
        viewObserver.disconnect()
    }

    const postEls = blogRootEl.value.querySelectorAll<HTMLElement>('.post[id^="message-"]')
    postEls.forEach(node => {
        const match = /^message-(\d+)$/.exec(node.id)
        if (!match) return
        const pid = Number(match[1])
        if (!viewedPostIds.has(pid)) {
            viewObserver?.observe(node)
        }
    })
}

function startStream(): void {
    if (!isInteractive.value || !props.apiUrl || typeof window === 'undefined') return
    streamClient?.close()
    streamClient = new LifeStreamClient(
        props.apiUrl,
        {
            onPostCreated: handleStreamPostCreated,
            onPostUpdated: handleStreamPostUpdated,
            onPostDeleted: handleStreamPostDeleted,
            onPostViewsUpdated: handleStreamPostViewsUpdated,
            onReactionUpdated: handleStreamReactionUpdated,
            onPollUpdated: handleStreamPollUpdated,
            onCommentCreated: handleStreamCommentCreated,
            onCommentDeleted: handleStreamCommentDeleted,
            onCommentReactionUpdated: handleStreamCommentReactionUpdated,
            onAllowedReactionsUpdated: (ev: StreamAllowedReactionsUpdatedEvent) => {
                if (Array.isArray(ev?.allowed_reactions)) {
                    allowedReactions.value = ev.allowed_reactions
                }
            },
            onReconnect: () => {
                void hydrateInteractions(visiblePostIds.value, true)
            },
        },
        visiblePostIds.value
    )
    streamClient.connect()
}

function resetInteractiveCaches(): void {
    streamClient?.close()
    streamClient = null
    clearViewTrackingTimers()
    viewObserver?.disconnect()
    viewObserver = null
    viewedPostIds.clear()
    queuedViewIds.clear()
    hydratedIds.clear()
    hydratingIds.clear()
    postHydratedAt.clear()
    seenCommentIds.clear()
    deletedCommentIds.clear()
    reactionSeqMap.clear()
    reactionInFlightMap.clear()
    for (const key of Object.keys(interactionsMap)) {
        delete interactionsMap[Number(key)]
    }
    for (const key of Object.keys(pollVotingMap)) {
        delete pollVotingMap[Number(key)]
    }
    me.value = null
    authProviders.value = []
    apiTelegramBotUsername.value = null
    apiTelegramClientId.value = null
    oidcProviderName.value = null
    allowAnonComments.value = false
    allowedReactions.value = null
    customEmojiCatalog.value = []
    customEmojiCatalogLoading.value = false
    customEmojiCatalogReady.value = false
    customEmojisLoaded = false
    customEmojisPromise = null
    stickerPacks.value = []
    stickersLoaded = false
    stickersPromise = null
    authLoaded.value = false
    authModalOpen.value = false
}

watch(() => props.apiUrl, (nextUrl, prevUrl) => {
    if (nextUrl === prevUrl) return
    resetInteractiveCaches()
    if (isClientMounted && nextUrl) {
        void ensureCustomEmojis()
        if (visiblePostIds.value.length) {
            void hydrateInteractions(visiblePostIds.value, true)
        }
        startStream()
        void nextTick(() => setupViewObserver())
    }
})

const audios = computed((): TGFile[] =>
{
    return posts.value.filter(p => p.files?.at(0)?.media_type == "audio_file").flatMap(p => p.files)
})

function audioNext(off: number)
{
    audio.value = audios.value.at(audios.value.indexOf(audio.value) + off)
}

const searchedPosts = computed((): Post[] =>
{
    let q = search.value.toLowerCase()
    if (!q) return posts.value
    let res = posts.value

    function take(len: number): string
    {
        let tk: string
        [tk, q] = q.split(" ", 2)
        return tk.substring(len)
    }

    // Take all specific queries
    while (q)
    {
        if (q.startsWith("id:"))
        {
            let id = take(3)
            res = res.filter(p => p.id + "" == id)
            continue
        }

        if (q.startsWith("author:"))
        {
            let author = take(7)
            res = res.filter(p => p.author?.toLowerCase().startsWith(author))
            continue
        }

        if (q.startsWith("date:"))
        {
            let date = take(5)
            res = res.filter(p => p.date.includes(date))
            continue
        }

        break
    }

    if (!q) return res
    return res.filter(p => p.text && p.text.toLowerCase().includes(q))
})

// Clamp render window whenever searchedPosts length changes
watch(() => searchedPosts.value.length, (len) =>
{
    clampWindow(len)
})

// Reset window when the searched query changes (e.g., user types in search box).
watch(search, () =>
{
    startIdx.value = 0
    endIdx.value = Math.min(PAGE_SIZE, searchedPosts.value.length)
})

watch(visiblePostIds, (ids) =>
{
    if (!isClientMounted || !isInteractive.value) return
    if (ids.length) {
        void hydrateInteractions(ids)
        streamClient?.updatePostIds(ids)
    }
    void nextTick(() => setupViewObserver())
})

const globalPostImgIndexById = computed((): {[postId: number]: number} =>
{
    return Object.fromEntries(posts.value.map((post, i) => [post.id, postImgIndex.value[i]]))
})

const searchedImageContext = computed((): {imgs: TrackedImage[], postImgIndexById: {[postId: number]: number}} =>
{
    if (!search.value) return {imgs: imgList.value, postImgIndexById: globalPostImgIndexById.value}

    const imgs: TrackedImage[] = []
    const filteredPostImgIndexById: {[postId: number]: number} = {}
    searchedPosts.value.forEach(post =>
    {
        if (!post.images?.length) return
        const pi = postIdIndex.value[post.id]
        if (pi === undefined) return
        const start = postImgIndex.value[pi]
        if (start === undefined) return
        filteredPostImgIndexById[post.id] = imgs.length
        imgs.push(...imgList.value.slice(start, start + post.images.length))
    })
    return {imgs, postImgIndexById: filteredPostImgIndexById}
})

const activeImgList = computed(() => searchedImageContext.value.imgs)

const viewerImgs = computed((): ViewedImage[] => standaloneImgs.value ?? activeImgList.value)
const viewerImgIndex = computed({
    get: () => (standaloneImgs.value ? standaloneImgIdx.value : img.value),
    set: (val: number) => {
        if (standaloneImgs.value) {
            standaloneImgIdx.value = val
            if (val < 0) standaloneImgs.value = null
        } else {
            img.value = val
        }
    },
})

watch(activeImgList, (newImgs, oldImgs) =>
{
    if (img.value < 0) return
    const current = oldImgs?.[img.value]
    if (!current)
    {
        img.value = -1
        return
    }
    const nextIndex = newImgs.findIndex(it => it.url === current.url)
    img.value = nextIndex < 0 ? -1 : nextIndex
})

function openImage(post: Post, imageOffset: number)
{
    standaloneImgs.value = null
    standaloneImgIdx.value = -1
    const start = searchedImageContext.value.postImgIndexById[post.id]
    if (start === undefined) return
    img.value = start + imageOffset
}

function onKey(e: KeyboardEvent)
{
    // Ctrl+F to search
    if ((e.ctrlKey || e.metaKey) && e.code == 'KeyF')
    {
        if (!searchEl.value) return
        searchEl.value.focus()
        searchEl.value.scrollIntoView({block: 'center'})

        e.stopPropagation()
        e.preventDefault()
    }
}

function onHashChange(e: HashChangeEvent)
{
    const h = window.location.hash

    if (!h) return;

    // Search for hashtag
    search.value = decodeURIComponent(h)
    window.location.hash = ""
    searchEl.value?.scrollIntoView({block: 'center'})
    e.preventDefault()
    e.stopPropagation()
}

function replaceUrl(url: string): string
{
    return resolveRelativeUrl(url, purl.value);
}

function parseSharedId(): number | null
{
    // Guard on isClientMounted so initial client setup matches SSR identically
    if (!isClientMounted || typeof window === 'undefined') return null
    if (props.sharedId !== undefined)
    {
        return props.sharedId !== null && Number.isFinite(props.sharedId) ? props.sharedId : null
    }
    const raw = new URL(window.location.href).searchParams.get('shared')
    if (raw === null) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
}

function loadBelow()
{
    const n = searchedPosts.value.length
    if (endIdx.value >= n) return
    endIdx.value = Math.min(endIdx.value + LOAD_STEP, n)
}

function loadAbove()
{
    if (!upwardScrollReady.value) return
    if (startIdx.value <= 0) return

    // Preserve scroll position when prepending posts above the viewport.
    // Anchor on the first post currently rendered: record its viewport offset
    // before, then scroll so it lands at the same offset after the prepend.
    const anchorPost = searchedPosts.value[startIdx.value]
    const anchorEl = anchorPost ? document.getElementById(`message-${anchorPost.id}`) : null
    const beforeTop = anchorEl ? anchorEl.getBoundingClientRect().top : 0

    startIdx.value = Math.max(0, startIdx.value - LOAD_STEP)

    nextTick(() =>
    {
        if (!anchorEl) return
        const afterTop = anchorEl.getBoundingClientRect().top
        window.scrollBy({top: afterTop - beforeTop, behavior: 'auto'})
    })
}

function setupTopObserver()
{
    topObserver?.disconnect()
    if (!topSentinel.value || typeof IntersectionObserver === 'undefined') return
    topObserver = new IntersectionObserver(entries =>
    {
        if (entries.some(e => e.isIntersecting)) loadAbove()
    }, {rootMargin: '200px 0px 0px 0px'})
    topObserver.observe(topSentinel.value)
}

watch(topSentinel, () => setupTopObserver())

const postIdIndex = computed((): {[index: number]: number} =>
{
    // Mapping of post id to post index in the array
    return Object.fromEntries(posts.value.map((it, i) => [it.id, i]))
})

function clickReply(id: number)
{
    if (replyLoading.value) return

    const list = searchedPosts.value
    const index = list.findIndex(p => p.id === id)
    if (index < 0) return

    // If the target is outside the rendered window, extend the window toward it.
    if (index < startIdx.value)
    {
        replyLoading.value = true
        startIdx.value = Math.max(0, index - LOAD_STEP)
    }
    else if (index >= endIdx.value)
    {
        replyLoading.value = true
        endIdx.value = Math.min(list.length, index + LOAD_STEP)
    }

    jumpToReply(id, index)
}

function jumpToReply(id: number, index: number)
{
    if (typeof document === 'undefined') return
    // Did it load yet?
    const el = document.getElementById(`message-${id}`)
    if (!el)
    {
        // No, wait for another 50ms
        return setTimeout(() => jumpToReply(id, index), 50)
    }
    // Yes, jump
    el.scrollIntoView({behavior: 'smooth', block: 'center'})
    replyLoading.value = false

    // Try to listen to scroll end and shake posts when scrolling is done
    const shake = () => {
        // Shake the post
        replyShake.value = [...replyShake.value, index]
        setTimeout(() => replyShake.value = replyShake.value.filter(it => it != index), 1500)
    }

    // The below code doesn't work when the post is already at the scrolled position.
    // So we have to set another timeout: If nothing moves in 1 second, shake it
    let scrollHandler: (e: Event) => void;
    const fallback = setTimeout(() => {
        shake()
        window.removeEventListener('scroll', scrollHandler)
    }, 1000)

    // Try to listen to scroll events
    let scrollTimeout: ReturnType<typeof setTimeout>;
    scrollHandler = () => {
        // Still scrolling, reset the timeout to 100ms
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            clearTimeout(fallback)
            // Done scrolling
            shake()

            // Remove listener
            window.removeEventListener('scroll', scrollHandler)
        }, 100);
    }
    window.addEventListener('scroll', scrollHandler);
}

// Canonical fetched posts, kept immutable so translations can be re-applied on
// locale change without refetching (switching en→zh must restore original text).
let rawPosts: Post[] = []
let postsInitialized = false

function clonePost(p: Post): Post
{
    return {
        ...p,
        reply: p.reply ? {...p.reply} : undefined,
        images: p.images ? p.images.map(img => ({...img})) : undefined,
        files: p.files ? p.files.map(f => ({...f})) : undefined,
        reactions: p.reactions ? p.reactions.map(r => ({...r})) : undefined,
    }
}

function replacePostUrls(list: Post[]): void
{
    list.forEach(it =>
    {
        it.images?.forEach(img =>
        {
            img.url = replaceUrl(img.url)
            if (img.thumb) img.thumb = replaceUrl(img.thumb)
            if (img.original_url) img.original_url = replaceUrl(img.original_url)
        })
        if (it.reply?.thumb) it.reply.thumb = replaceUrl(it.reply.thumb)
        it.files?.forEach(f =>
        {
            if (f.url) f.url = replaceUrl(f.url)
            if (f.thumb) f.thumb = replaceUrl(f.thumb)
        })
    })
}

function rebuildImgIndex(): void
{
    imgList.value = posts.value.flatMap((post, pi) => (post.images ?? []).map(img => ({
        url: img.url,
        text: post.text,
        author: post.author ?? (typeof post.forwarded_from == 'string' ? post.forwarded_from : post.forwarded_from?.name),
        date: post.date,
        originalUrl: img.original_url,
        originalSize: img.original_size,
        originalName: img.original_name,
        postIndex: pi
    })))
    postImgIndex.value = new Array(posts.value.length).fill(null)
    imgList.value.forEach((img, i) => {
        if (postImgIndex.value[img.postIndex] === null)
            postImgIndex.value[img.postIndex] = i
    })
}

function rebuildPosts(): void
{
    // Copy before formatting so rawPosts always keeps canonical ISO dates —
    // otherwise a second rebuild would re-parse the previously formatted string.
    // Use deterministic UTC formatting during SSR & initial client hydration,
    // then local timezone after onMounted to prevent cross-timezone hydration mismatches.
    const merged = applyTranslations(rawPosts, props.translations).map(it => ({...it}))
    merged.forEach(it => it.date = formatPostDate(it.date, msg.dateFormat, isClientMounted))
    posts.value = merged
    rebuildImgIndex()
}

function applyInitialWindow(): void
{
    const sharedId = parseSharedId()
    let anchor = -1
    if (sharedId !== null) anchor = posts.value.findIndex(p => p.id === sharedId)

    if (anchor >= 0)
    {
        const half = Math.floor(PAGE_SIZE / 2)
        startIdx.value = Math.max(0, anchor - half)
        endIdx.value = Math.min(posts.value.length, anchor + half)
    }
    else
    {
        startIdx.value = 0
        endIdx.value = Math.min(PAGE_SIZE, posts.value.length)
    }
}

function focusSharedPost(allowFallbackUpwardReady: boolean): boolean
{
    const sid = parseSharedId()
    if (sid === null)
    {
        sharedHandled = true
        upwardScrollReady.value = true
        return false
    }
    if (sharedHandled) return true

    const idx = posts.value.findIndex(p => p.id === sid)
    if (idx >= 0)
    {
        sharedHandled = true
        upwardScrollReady.value = false
        if (upwardReadyTimer) clearTimeout(upwardReadyTimer)

        const half = Math.floor(PAGE_SIZE / 2)
        startIdx.value = Math.max(0, idx - half)
        endIdx.value = Math.min(posts.value.length, idx + half)

        // Wait for DOM to render the windowed posts before scrolling.
        setTimeout(() => jumpToReply(sid, idx), 50)
        // Allow upward loading once the user has had a moment to land at
        // the shared post — otherwise the observer fires immediately and
        // prepends posts before the scroll-to-shared completes.
        upwardReadyTimer = setTimeout(() => {
            upwardReadyTimer = null
            upwardScrollReady.value = true
        }, 1500)
        return true
    }

    if (allowFallbackUpwardReady)
    {
        upwardScrollReady.value = true
    }
    return false
}

function ingestRawPosts(source: Post[], preserveWindow = false): void
{
    const clonedSource = source
        .filter(it => it.type !== 'service' && !deletedPostIds.has(it.id))
        .map(clonePost)
    replacePostUrls(clonedSource)

    // Retain any SSE post.created posts not yet present in the fetched postsData snapshot
    rawPosts = mergePostsWithLive(clonedSource, Array.from(sseCreatedPosts.values()), deletedPostIds)
    rebuildPosts()

    if (preserveWindow && postsInitialized)
    {
        const len = searchedPosts.value.length
        if (len <= 0)
        {
            startIdx.value = 0
            endIdx.value = 0
        }
        else
        {
            startIdx.value = Math.max(0, Math.min(startIdx.value, len - 1))
            endIdx.value = Math.min(len, Math.max(endIdx.value, startIdx.value + PAGE_SIZE))
        }
    }
    else
    {
        applyInitialWindow()
    }
    postsInitialized = true
}

watch(() => props.translations, () => rebuildPosts(), {deep: true})

// Apply initial overrides and react to later ones. Registered after rebuildPosts
// is defined so the immediate call can't hit the TDZ.
Object.assign(msg, createMessages(pendingMessages))
watch(() => props.messages, (overrides, prev) =>
{
    Object.assign(msg, createMessages(overrides))
    // Timestamps are pre-rendered strings; re-format them when the format changes
    if (rawPosts.length && overrides?.dateFormat !== prev?.dateFormat) rebuildPosts()
}, {deep: true})

// Synchronously initialize when postsData is provided so SSR prerenders the feed cleanly.
if (props.postsData)
{
    ingestRawPosts(props.postsData, false)
}

watch(() => props.postsData, (nextData) =>
{
    if (nextData) {
        const hadPosts = postsInitialized
        ingestRawPosts(nextData, hadPosts)
        if (isClientMounted) {
            if (!sharedHandled) {
                // Full postsData upgrade arrived while a ?shared= jump was still pending
                focusSharedPost(true)
            }
            if (isInteractive.value && visiblePostIds.value.length) {
                void hydrateInteractions(visiblePostIds.value)
                streamClient?.updatePostIds(visiblePostIds.value)
            }
        }
    }
})

watch(() => props.sharedId, (nextId, prevId) =>
{
    if (nextId === prevId || !isClientMounted) return
    sharedHandled = false
    focusSharedPost(false)
})

onMounted(async () =>
{
    isClientMounted = true
    document.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHashChange)
    if (isInteractive.value)
    {
        void ensureCustomEmojis()
    }

    try
    {
        const fetchedFromUrl = !postsInitialized && !props.postsData
        if (!postsInitialized)
        {
            if (props.postsData)
            {
                ingestRawPosts(props.postsData, false)
            }
            else
            {
                const fetched = await (await fetch(purl.value)).json()
                ingestRawPosts(fetched, false)
            }
        }
        else
        {
            // Re-format SSR UTC timestamps into the visitor's local timezone after hydration
            rebuildPosts()
        }

        setTimeout(() => initSpoilers(), 100);

        // Handle ?shared={id} after hydration. When postsData was pre-provided (e.g. 20-post
        // SSR preview), keep upwardScrollReady false if the target isn't in the preview yet
        // so the upcoming full postsData upgrade can jump cleanly without runaway topObserver loads.
        focusSharedPost(fetchedFromUrl)

        // Interactive hydration & live SSE (only when apiUrl is provided)
        if (isInteractive.value)
        {
            if (visiblePostIds.value.length)
            {
                await hydrateInteractions(visiblePostIds.value)
            }
            handleAuthErrorQueryOnLoad()
            handleReviewQueryOnLoad()
            startStream()
            await nextTick()
            setupViewObserver()
        }
    }
    catch (e)
    {
        console.error(e)
        fail.value = String(e)
    }
})

onUnmounted(() =>
{
    if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey)
    if (typeof window !== 'undefined') window.removeEventListener('hashchange', onHashChange)
    if (upwardReadyTimer) clearTimeout(upwardReadyTimer)
    clearViewTrackingTimers()
    viewObserver?.disconnect()
    viewObserver = null
    topObserver?.disconnect()
    streamClient?.close()
    streamClient = null
})

onUpdated((): void =>
{
    initSpoilers()
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *
@use "css/global" as *

.search
    width: 100%
    margin-bottom: 20px
    padding: 0.5em 1em
    box-sizing: border-box

    display: flex
    align-items: center

    border-radius: 999px
    background: $color-bg-card
    box-shadow: var(--tgb-shadow)
    overflow: hidden

    input
        flex: 1
        border: none
        background: transparent
        color: inherit

    input::placeholder
        color: $color-text-light

    input:focus-visible
        outline: none

.top-sentinel
    height: 1px
    width: 100%

.tg-blog.margins
    margin-top: 20px
    margin-bottom: 20px

.tg-blog
    margin-left: auto
    margin-right: auto
    width: 450px
    color: $color-text-main

    text-align: center
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale

    // Phone layout
    @media screen and (max-width: 490px)
        margin: 20px 20px 0
        width: unset

    *
        transition: all .25s ease

// Animations
.shake
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both
    transform: translate3d(0, 0, 0)

@keyframes shake
    10%, 90%
        transform: translate3d(-1px, 0, 0)

    20%, 80%
        transform: translate3d(2px, 0, 0)

    30%, 50%, 70%
        transform: translate3d(-4px, 0, 0)

    40%, 60%
        transform: translate3d(4px, 0, 0)
</style>
