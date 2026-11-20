<template>
    <div class="post-entry" :class="{ 'has-chat': interactive && commentsOpen }">
        <div class="post-card-wrap" :class="{ 'selector-open': selectorOpen }">
            <div class="post tgb-card"
                 :id="`message-${p.id}`"
                 :class="{ 'service': p.type === 'service' }"
                 ref="el"
                 @click.capture="onCardClickCapture"
                 @contextmenu="onCardContextMenu"
                 @pointerdown="onCardPointerDown"
                 @pointermove="onCardPointerMove"
                 @pointerup="cancelLongPress"
                 @pointercancel="cancelLongPress">
                <div class="head unselectable" v-if="p.forwarded_from">
                    <div class="forward">
                        {{msg.forwardedFrom}} <a :href="fwdUrl">{{fwdName}}</a>
                    </div>
                </div>
                <div class="reply undraggable clickable" v-if="p.reply" @click="clickReply">
                    <div class="thumb-wrap" v-if="p.reply.thumb">
                        <img class="thumb" :src="p.reply.thumb" alt="">
                    </div>
                    <div class="mtext">
                        <div class="reply-to">{{msg.replyTo}}</div>
                        <div class="reply-quote" v-if="p.quote?.text" v-html="p.quote.text"></div>
                        <div class="reply-text" v-else-if="p.reply.text" v-html="p.reply.text"></div>
                    </div>
                </div>
                <div class="quote-container" v-if="p.quote && !p.reply">
                    <blockquote v-html="p.quote.text"></blockquote>
                </div>
                <div class="text" v-if="p.show_caption_above_media && text" v-html="text" @click="onTextClick"></div>
                <div class="images" v-if="p.images?.length" :class="{'has-head': p.reply || p.quote || p.forwarded_from || (p.show_caption_above_media && text)}"
                     :style="containerStyle">
                    <div class="image_container" v-for="(img, i) in p.images" :key="i" :style="getImageStyle(i)">
                        <img :src="img.thumb || img.url" alt="image"
                             class="clickable" :class="{media_spoiler: img.spoiler}" @click="clickImg(img, i)" style="inset: 0">
                    </div>
                </div>
                <div class="files" v-if="p.files">
                    <FileView v-for="(f, i) in p.files" :key="f.url ?? i" :f="f"
                              :has-head="i > 0 || !!(p.reply || p.quote || p.forwarded_from || (p.show_caption_above_media && text) || p.images?.length)"
                              :interactive="interactive"
                              :poll-state="f.media_type === 'poll' ? (interaction?.poll ?? null) : null"
                              :poll-voting="pollVoting"
                              @play-file="onPlayFile"
                              @vote-poll="onVotePoll" />
                </div>
                <div class="text" v-if="!p.show_caption_above_media && text" v-html="text" @click="onTextClick"></div>

                <!-- Interactive reactions styled after Telegram Web A ReactionButton.module.scss (no permanent + button) -->
                <div class="reactions interactive-reactions" v-if="interactive && displayReactions.length">
                    <button type="button" class="reaction reaction-btn"
                            v-for="r in displayReactions" :key="r.reaction_key"
                            :class="{ chosen: r.reacted }"
                            @click="onToggleReaction(r)">
                        <CustomEmoji v-if="r.custom_emoji_id"
                                     :id="r.custom_emoji_id"
                                     :src="customEmojiSrc(r.custom_emoji_id)"
                                     :posts-url="postsUrl" />
                        <AppleEmoji v-else-if="r.emoji" :emoji="r.emoji" class="reaction-emoji" />
                        <span class="reaction-count" v-if="r.count">{{r.count}}</span>
                    </button>
                </div>

                <!-- Static read-only reactions (100% v1.2.1 behavior when apiUrl is not provided) -->
                <div class="reactions" v-else-if="!interactive && p.reactions && p.reactions.length">
                    <span class="reaction" v-for="(r, idx) in p.reactions" :key="idx">
                        <CustomEmoji v-if="r.custom_emoji_id"
                                     :id="r.custom_emoji_id"
                                     :src="customEmojiSrc(r.custom_emoji_id)"
                                     :posts-url="postsUrl" />
                        <AppleEmoji v-else-if="r.emoji" :emoji="r.emoji" class="reaction-emoji" />
                        <span class="reaction-count" v-if="r.count">{{r.count}}</span>
                    </span>
                </div>

                <div class="info font-code unselectable" :class="{ 'has-comment-fab': interactive, 'has-comment-count': interactive && commentCount > 0 }">
                    <div class="id">
                        <span class="share clickable" @click="share" :title="shareLabel">
                            <i-fas-check v-if="shared" />
                            <i-fas-link v-else />
                        </span>
                        #{{p.id}}
                    </div>
                    <div class="f-grow1"></div>
                    <div class="author" v-if="p.author">{{p.author}}</div>
                    <div class="date">{{p.date}}</div>
                    <div class="views" v-if="displayViews">{{displayViews}} <i-fas-eye /></div>
                </div>
            </div>

            <!-- Prominent borderless round/pill replies button overlapping the bottom-right corner of .post.tgb-card -->
            <button v-if="interactive"
                    type="button"
                    class="comment-toggle clickable"
                    :class="{ active: commentsOpen, 'has-count': commentCount > 0 }"
                    :aria-expanded="commentsOpen"
                    :title="commentCount > 0 ? `${msg.reply} (${msg.commentsCount(commentCount)})` : msg.reply"
                    :aria-label="commentCount > 0 ? `${msg.reply} (${msg.commentsCount(commentCount)})` : msg.reply"
                    @click="commentsOpen = !commentsOpen">
                <svg class="comment-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M 12.00 20.13 Q 14.72 20.13 17.04 18.91 Q 19.31 17.70 20.62 15.66 Q 22.01 13.52 22.01 11.06 Q 22.01 8.60 20.62 6.49 Q 19.31 4.43 17.04 3.23 Q 14.72 1.99 12.00 1.99 Q 9.28 1.99 6.96 3.23 Q 4.69 4.43 3.38 6.49 Q 1.99 8.60 1.99 11.06 Q 1.99 13.17 2.95 14.95 Q 3.87 16.66 5.62 17.93 Q 5.77 18.05 5.86 18.45 Q 5.95 18.84 5.91 19.31 Q 5.81 19.85 5.53 20.32 Q 5.34 20.58 5.16 20.84 L 4.57 21.47 Q 4.41 21.66 4.37 21.76 Q 4.34 21.87 4.48 21.94 Q 4.62 22.01 5.06 22.01 Q 5.60 22.01 6.12 21.89 Q 6.77 21.77 7.29 21.48 Q 7.80 21.19 8.25 20.84 L 8.51 20.65 L 9.26 19.97 Q 9.42 19.83 9.54 19.88 Q 10.73 20.13 12.00 20.13 Z"/>
                </svg>
                <span v-if="commentCount > 0" class="comment-count">{{ msg.commentsCount(commentCount) }}</span>
            </button>
        </div>

        <!-- External chat area directly beneath .post.tgb-card with smooth CSS Grid 0fr <-> 1fr accordion -->
        <Transition name="tgb-chat-accordion">
            <div v-if="interactive && commentsOpen" class="chat-accordion-shell">
                <div class="chat-accordion-inner">
                    <CommentThread :post-id="p.id" :posts-url="postsUrl" />
                </div>
            </div>
        </Transition>

        <!-- Telegram Web A 2-stage floating ReactionSelector + ReactionPickerLimited -->
        <ReactionSelector v-if="interactive"
                          :open="selectorOpen"
                          :reactions="availableReactions"
                          :chosen-keys="chosenReactionKeys"
                          :posts-url="postsUrl"
                          :anchor="selectorAnchor"
                          @select="onSelectReactionChoice"
                          @close="selectorOpen = false" />
    </div>
</template>

<script lang="ts" setup>
import {Image, MergedReaction, Post, PostInteractionState, ReactionTogglePayload, TGFile} from "@/logic/models";
import FileView from "@/views/FileView.vue";
import AppleEmoji from "@/views/AppleEmoji.vue";
import CustomEmoji from "@/views/CustomEmoji.vue";
import {calculateAlbumLayout} from "@/logic/webz/calculateAlbumLayout";
import {replaceTextEmojisWithApple, useAppleEmojiBaseUrl} from "@/logic/appleEmoji";
import {buildCustomEmojiCandidates, createCustomEmojiDomManager} from "@/logic/customEmojiDom";
import {useTgbMessages} from "@/logic/messages";
import {useTgbInteractive} from "@/logic/interactive";
import {
    buildAvailableReactions,
    canonicalReactionKey,
    isValidCustomEmojiId,
    ReactionChoice,
    resolveCustomEmojiBaseSrc,
} from "@/logic/reactions";
import {resolveRelativeUrl} from "@/logic/url";
import {initSpoilers} from "@/logic/spoilers";
import {computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, onUpdated, ref, StyleValue, watch} from "vue";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const CommentThread = defineAsyncComponent(() => import("@/views/CommentThread.vue"))
const ReactionSelector = defineAsyncComponent(() => import("@/views/ReactionSelector.vue"))

const msg = useTgbMessages()
const interactiveCtx = useTgbInteractive()
const appleEmojiBaseUrl = useAppleEmojiBaseUrl()
const emojiDomManager = createCustomEmojiDomManager()

const props = defineProps<{
    p: Post
    postsUrl: string
    interactive?: boolean
    interaction?: PostInteractionState | null
    pollVoting?: boolean
}>()
const p = computed(() => props.p)

const emit = defineEmits<{
    (e: "click-reply", id: number): void
    (e: "click-img", index: number): void
    (e: "play-file", file: TGFile): void
    (e: "toggle-reaction", postId: number, payload: ReactionTogglePayload): void
    (e: "vote-poll", postId: number, pollId: string, optionIndices: number[]): void
}>()

const el = ref<HTMLDivElement>()
const sizeScale = ref(1)
const commentsOpen = ref(false)
const selectorOpen = ref(false)
const selectorAnchor = ref({x: 0, y: 0})

const channelCustomEmojis = computed(() =>
    interactiveCtx?.allCustomEmojis.value ?? interactiveCtx?.channelCustomEmojis.value ?? {}
)
const epochEmojiBase = computed(() => interactiveCtx?.epochEmojiBase.value ?? null)

function customEmojiSrc(id: string): string {
    return resolveCustomEmojiBaseSrc(id, channelCustomEmojis.value, props.postsUrl, epochEmojiBase.value)
}

const displayReactions = computed((): MergedReaction[] => {
    if (props.interaction?.reactions) {
        return props.interaction.reactions
    }
    return (p.value.reactions ?? []).map(r => ({
        reaction_key: r.custom_emoji_id ? `c:${r.custom_emoji_id}` : `e:${r.emoji ?? ''}`,
        emoji: r.emoji ?? null,
        custom_emoji_id: r.custom_emoji_id ?? null,
        tg_count: r.count,
        web_count: 0,
        count: r.count,
        reacted: false,
    }))
})

const availableReactions = computed((): ReactionChoice[] =>
    buildAvailableReactions(
        displayReactions.value,
        channelCustomEmojis.value,
        props.postsUrl,
        epochEmojiBase.value,
        interactiveCtx?.allowedReactions.value ?? null
    )
)

const chosenReactionKeys = computed((): Set<string> => {
    const keys = new Set<string>()
    for (const r of displayReactions.value) {
        if (!r.reacted) continue
        keys.add(r.reaction_key)
        const canon = canonicalReactionKey(r)
        if (canon) keys.add(canon)
    }
    return keys
})

const commentCount = computed(() => props.interaction?.comment_count ?? 0)
const displayViews = computed(() => props.interaction?.views ?? p.value.views)

function onToggleReaction(r: MergedReaction) {
    if (r.custom_emoji_id) {
        emit('toggle-reaction', p.value.id, {custom_emoji_id: r.custom_emoji_id})
    } else if (r.emoji) {
        emit('toggle-reaction', p.value.id, {emoji: r.emoji})
    }
}

function onSelectReactionChoice(choice: ReactionChoice) {
    if (choice.custom_emoji_id) {
        emit('toggle-reaction', p.value.id, {custom_emoji_id: choice.custom_emoji_id})
    } else if (choice.emoji) {
        emit('toggle-reaction', p.value.id, {emoji: choice.emoji})
    }
}

function onVotePoll(pollId: string, optionIndices: number[]) {
    emit('vote-poll', p.value.id, pollId, optionIndices)
}

const INTERACTIVE_TRIGGER_SELECTOR =
    'a, button, input, textarea, select, audio, summary, .media_spoiler, .spoiler, .plyr, #Location, blockquote[expandable], blockquote.expandable, .reaction-btn, #Poll, pre, .code-copy-btn, .reply, .share, .comment-toggle, .dice, .file .thumb'

function shouldIgnoreReactionTrigger(target: EventTarget | null): boolean {
    if (typeof window !== 'undefined' && window.getSelection()?.toString().trim()) {
        return true
    }
    if (target instanceof Element && target.closest(INTERACTIVE_TRIGGER_SELECTOR)) {
        return true
    }
    return false
}

function openSelectorAt(x: number, y: number) {
    void interactiveCtx?.ensureCustomEmojis()
    selectorAnchor.value = {x, y}
    selectorOpen.value = true
}

function onCardContextMenu(e: MouseEvent) {
    if (!props.interactive) return
    // Shift + Right-click always preserves the native browser context menu
    if (e.shiftKey) return
    if (shouldIgnoreReactionTrigger(e.target)) return
    e.preventDefault()
    openSelectorAt(e.clientX, e.clientY)
}

let longPressTimer: ReturnType<typeof setTimeout> | null = null
let ghostClickTimer: ReturnType<typeof setTimeout> | null = null
let suppressGhostClick = false
let pressStart = {x: 0, y: 0}

function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
    }
}

function clearGhostClickGuard() {
    suppressGhostClick = false
    if (ghostClickTimer) {
        clearTimeout(ghostClickTimer)
        ghostClickTimer = null
    }
}

function onCardClickCapture(e: MouseEvent) {
    if (!suppressGhostClick) return
    clearGhostClickGuard()
    e.preventDefault()
    e.stopPropagation()
}

function onCardPointerDown(e: PointerEvent) {
    if (!props.interactive) return
    // Restrict long-press strictly to touch so desktop left-click-hold never hijacks text selection
    if (e.pointerType !== 'touch') return
    if (shouldIgnoreReactionTrigger(e.target)) return

    cancelLongPress()
    pressStart = {x: e.clientX, y: e.clientY}
    longPressTimer = setTimeout(() => {
        longPressTimer = null
        if (typeof window !== 'undefined' && window.getSelection()?.toString().trim()) return
        suppressGhostClick = true
        if (ghostClickTimer) clearTimeout(ghostClickTimer)
        ghostClickTimer = setTimeout(() => {
            suppressGhostClick = false
            ghostClickTimer = null
        }, 800)
        openSelectorAt(pressStart.x, pressStart.y)
    }, 420)
}

function onCardPointerMove(e: PointerEvent) {
    if (!longPressTimer) return
    if (Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > 8) {
        cancelLongPress()
    }
}

const text = computed(() => p.value.text)
const fwdUrl = computed(() => typeof p.value.forwarded_from == 'string' ? undefined : p.value.forwarded_from.url)
const fwdName = computed(() => typeof p.value.forwarded_from == 'string' ? p.value.forwarded_from : p.value.forwarded_from.name)

const dims = computed(() =>
    p.value.images?.length ? calculateAlbumLayout(p.value.images, 450, 450) : null
)

const containerStyle = computed(() =>
{
    if (!dims.value) return {}
    const ss = sizeScale.value
    const dm = dims.value.containerStyle
    return {width: dm.width * ss + "px", height: dm.height * ss + "px"}
})

function getImageStyle(i: number): StyleValue
{
    if (!dims.value?.layout[i]) return {}
    const ss = sizeScale.value
    const dm = dims.value.layout[i].dimensions
    return {
        left: dm.x * ss + "px", top: dm.y * ss + "px",
        width: dm.width * ss + "px", height: dm.height * ss + "px"
    }
}

function onPlayFile(file: TGFile) {
    emit("play-file", file)
}

function clickReply() {
    emit("click-reply", p.value.reply.id)
}

function onTextClick(e: MouseEvent) {
    const target = (e.target as HTMLElement).closest('blockquote[expandable], blockquote.expandable') as HTMLElement | null
    if (target) {
        target.classList.toggle('expanded')
        target.toggleAttribute('open')
    }
}

const KATEX_CSS_HREF = "https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.css"

function ensureKatexStylesheet() {
    if (typeof document === 'undefined' || !document.head) return
    if (document.head.querySelector('link[data-tgb-katex="1"]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = KATEX_CSS_HREF
    link.setAttribute('data-tgb-katex', '1')
    document.head.appendChild(link)
}

async function renderMathNodes(mathNodes: HTMLElement[]) {
    try {
        const katexMod = await import("katex")
        const katex = katexMod.default ?? katexMod
        for (const node of mathNodes) {
            if (!node.isConnected) continue
            const expr = node.textContent?.trim() || ""
            if (!expr) continue
            try {
                katex.render(expr, node, { throwOnError: false, displayMode: false })
            } catch (e) {
                console.error("KaTeX render error:", e)
            }
        }
    } catch (e) {
        console.error("Failed to load KaTeX:", e)
    }
}

function initRichContent()
{
    if (!el.value) return
    // Remove empty newline text nodes around block-level elements in .text
    const textEl = el.value.querySelector(".text")
    if (textEl) {
        const isBlock = (n: ChildNode | null) =>
            n && n.nodeType === Node.ELEMENT_NODE &&
            ['P', 'FIGURE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DETAILS', 'HR', 'PRE', 'TABLE', 'UL', 'OL', 'FOOTER'].includes((n as Element).tagName)

        Array.from(textEl.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
                if (isBlock(node.previousSibling) || isBlock(node.nextSibling)) {
                    node.remove()
                }
            }
        })
    }

    // Absolutize rich photo URLs and add click to view full image
    el.value.querySelectorAll<HTMLImageElement>("figure.rich-photo img:not(.init)").forEach(img => {
        img.classList.add("init")
        const rawSrc = img.getAttribute("data-src") || img.getAttribute("src")
        if (rawSrc) {
            img.src = replaceUrl(rawSrc)
        }
        const full = img.getAttribute("data-full")
        if (full) {
            img.setAttribute("data-full", replaceUrl(full))
        }
        img.classList.add("clickable")
        img.addEventListener("click", () => {
            const targetUrl = img.getAttribute("data-full") || img.src
            window.open(targetUrl, "_blank")
        })
    })

    // Render KaTeX for math formulas lazily only when math nodes exist
    const mathNodes = Array.from(el.value.querySelectorAll<HTMLElement>("code.math:not(.katex-rendered)"))
    if (mathNodes.length > 0) {
        mathNodes.forEach(node => node.classList.add("katex-rendered"))
        ensureKatexStylesheet()
        void renderMathNodes(mathNodes)
    }

    // Syntax highlighting for code blocks
    el.value.querySelectorAll<HTMLElement>("pre:not(.hljs-rendered)").forEach(pre => {
        pre.classList.add("hljs-rendered")
        let codeEl = pre.querySelector("code")
        const rawCode = (codeEl ? codeEl.textContent : pre.textContent) || ""
        let lang = pre.getAttribute("language") || ""
        if (!lang && codeEl) {
            const classLang = Array.from(codeEl.classList).find(c => c.startsWith("language-") || c.startsWith("lang-"))
            if (classLang) {
                lang = classLang.replace(/^language-|^lang-/, "")
            }
        }

        let highlighted = ""
        let detectedLang = lang
        if (lang && hljs.getLanguage(lang)) {
            try {
                const res = hljs.highlight(rawCode, { language: lang })
                highlighted = res.value
                detectedLang = lang
            } catch (e) {
                console.warn(`Failed to highlight with language ${lang}:`, e)
            }
        }

        if (!highlighted && rawCode.trim()) {
            try {
                const res = hljs.highlightAuto(rawCode)
                highlighted = res.value
                detectedLang = res.language || lang || ""
            } catch {
                highlighted = ""
            }
        }

        if (!codeEl) {
            codeEl = document.createElement("code")
            pre.innerHTML = ""
            pre.appendChild(codeEl)
        }

        if (highlighted) {
            codeEl.innerHTML = highlighted
            codeEl.classList.add("hljs")
        } else {
            codeEl.textContent = rawCode
        }

        // Add code header with language and copy button if not already present
        if (!pre.querySelector(".code-header")) {
            const header = document.createElement("div")
            header.className = "code-header"

            const langSpan = document.createElement("span")
            langSpan.className = "code-lang"
            langSpan.textContent = detectedLang || "code"

            const copyBtn = document.createElement("button")
            copyBtn.className = "code-copy-btn"
            copyBtn.setAttribute("type", "button")
            copyBtn.setAttribute("title", "Copy code")
            copyBtn.innerHTML = `<span>Copy</span>`
            copyBtn.addEventListener("click", async (e) => {
                e.stopPropagation()
                let success = false
                if (navigator.clipboard?.writeText) {
                    try {
                        await navigator.clipboard.writeText(rawCode)
                        success = true
                    } catch {
                        success = false
                    }
                }
                if (!success) {
                    const ta = document.createElement("textarea")
                    ta.value = rawCode
                    ta.style.position = "fixed"
                    ta.style.opacity = "0"
                    document.body.appendChild(ta)
                    ta.select()
                    try {
                        success = document.execCommand("copy")
                    } catch {
                        success = false
                    }
                    document.body.removeChild(ta)
                }
                if (success) {
                    copyBtn.innerHTML = `<span>Copied!</span>`
                    copyBtn.classList.add("copied")
                    setTimeout(() => {
                        copyBtn.innerHTML = `<span>Copy</span>`
                        copyBtn.classList.remove("copied")
                    }, 2000)
                }
            })

            header.appendChild(langSpan)
            header.appendChild(copyBtn)
            pre.insertBefore(header, pre.firstChild)
        }
    })

    // Replace standard Unicode emojis inside post text, replies, & standalone quotes with Apple emoji images
    if (appleEmojiBaseUrl.value) {
        el.value.querySelectorAll<HTMLElement>(".text, .reply-text, .reply-quote, .quote-container").forEach(node => {
            replaceTextEmojisWithApple(node, appleEmojiBaseUrl.value)
        })
    }

    initSpoilers()
}

function refreshSize() {
    if (!el.value) return
    sizeScale.value = el.value.clientWidth / 450
}

function maybePrefetchCustomEmojis() {
    if (!props.interactive || !interactiveCtx) return
    const hasCustomReaction = displayReactions.value.some(r => !!r.custom_emoji_id)
    const hasCustomInline = !!p.value.text?.includes('data-custom-emoji-id')
    if (hasCustomReaction || hasCustomInline) {
        void interactiveCtx.ensureCustomEmojis()
    }
}

watch(
    () => [displayReactions.value, p.value.text] as const,
    () => {
        maybePrefetchCustomEmojis()
    }
)

watch([channelCustomEmojis, () => interactiveCtx?.customEmojiCatalogReady.value ?? true], () => {
    void nextTick(() => initEmoji())
})

onMounted(() =>
{
    maybePrefetchCustomEmojis()
    initEmoji()
    initRichContent()
    refreshSize()
    window.addEventListener('resize', refreshSize)
})

onUpdated(() =>
{
    initEmoji()
    initRichContent()
})

onUnmounted(() =>
{
    window.removeEventListener('resize', refreshSize)
    cancelLongPress()
    clearGhostClickGuard()
    emojiDomManager.destroyAll()
})

function replaceUrl(url: string): string
{
    return resolveRelativeUrl(url, props.postsUrl);
}

/**
 * Initialize custom emojis (supports both `emoji-src` and `data-custom-emoji-id` inside `.text`).
 */
function initEmoji()
{
    if (!el.value || typeof document === 'undefined') return
    emojiDomManager.mountAll(el.value, {
        selector: 'i.custom-emoji',
        resolveCandidates: (node) => {
            const rawSrc = node.getAttribute('emoji-src')
            if (rawSrc) {
                const src = replaceUrl(rawSrc)
                return src ? buildCustomEmojiCandidates(src) : []
            }
            const id = node.getAttribute('data-custom-emoji-id')?.trim()
            if (id && isValidCustomEmojiId(id)) {
                const deferProbe = !!(
                    interactiveCtx?.api.value && !interactiveCtx.customEmojiCatalogReady.value
                )
                return buildCustomEmojiCandidates(customEmojiSrc(id), deferProbe)
            }
            return []
        },
    })
}

function clickImg(img: Image, i: number)
{
    // Show spoiler if not already shown
    if (img.spoiler)
    {
        img.spoiler = false
        return
    }

    // Open image if spoiler is already shown
    emit('click-img', i)
}

const shared = ref(false)
const shareLabel = computed(() => shared.value ? msg.linkCopied : msg.copyShareLink)

function buildShareUrl(): string
{
    const url = new URL(window.location.href)
    url.searchParams.set('shared', String(p.value.id))
    url.hash = ""
    return url.toString()
}

async function share()
{
    const link = buildShareUrl()
    try
    {
        await navigator.clipboard.writeText(link)
    }
    catch
    {
        // Fallback for non-secure contexts: temporary textarea
        const ta = document.createElement('textarea')
        ta.value = link
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        try { document.execCommand('copy') } catch { /* ignore */ }
        document.body.removeChild(ta)
    }
    shared.value = true
    setTimeout(() => shared.value = false, 1500)
}
</script>

<style lang="sass" scoped>
@use "sass:color"
@use "css/global" as *
@use "css/colors" as *
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@500&family=Shadows+Into+Light&display=swap')

.font-code
    font-family: Inconsolata, Monospaced, $font

.post-entry
    width: 100%
    margin-bottom: 20px

.post-card-wrap
    position: relative
    z-index: 1

    .comment-toggle
        position: absolute
        z-index: 4
        right: -0.65rem
        bottom: -0.65rem
        min-width: 2.5rem
        height: 2.5rem
        padding: 0
        border: none
        border-radius: 999px
        background: rgba(253, 249, 241, 0.96)
        transform: translateY(-5px)
        box-shadow: 0 4px 10px #70512a33
        color: $color-text-special-dark
        cursor: pointer
        display: inline-flex
        align-items: center
        justify-content: center
        gap: 5px
        transition: transform 0.16s ease, color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease

        &.has-count
            padding: 0 12px

        .comment-icon
            width: 20px
            height: 20px
            flex-shrink: 0

        .comment-count
            font-family: Inconsolata, Monospaced, $font
            font-size: 13px
            font-weight: 700
            font-variant-numeric: tabular-nums
            line-height: 1

        &:hover
            transform: translateY(-5px) scale(1.05)
            color: $color-text-special
            background: #fffcf9
            box-shadow: 0 4px 10px #70512a33

        &:active
            transform: translateY(-5px) scale(0.95)

        &.active
            background: $color-text-special
            color: #ffffff

.chat-accordion-shell
    display: grid
    grid-template-rows: 1fr
    opacity: 1

.chat-accordion-inner
    overflow: hidden
    min-height: 0

.tgb-chat-accordion-enter-active,
.tgb-chat-accordion-leave-active
    transition: grid-template-rows 0.26s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease

.tgb-chat-accordion-enter-from,
.tgb-chat-accordion-leave-to
    grid-template-rows: 0fr
    opacity: 0

.post.service
    .id
        display: none

.post
    margin-bottom: 0
    padding: 12px 20px 8px
    text-align: left
    overflow: hidden

    > *
        margin-bottom: 10px
    > *:last-child
        margin-bottom: 0

    .forward, .forward a, .reply-to
        color: $color-text-special-dark
        font-weight: bold

    .reply
        display: flex
        gap: 10px
        padding: 4px 10px 4px 12px
        border-radius: 4px
        background: linear-gradient(45deg, $color-text-main, $color-text-main), rgba(112, 81, 42, 0.08)
        background-size: 2.8px 100%
        background-repeat: no-repeat
        transition: background 0.2s ease

        &:hover
            background: linear-gradient(45deg, $color-text-main, $color-text-main), rgba(112, 81, 42, 0.14)
            background-size: 2.8px 100%
            background-repeat: no-repeat

        .thumb-wrap
            display: flex
            align-items: center

        .thumb
            height: 2.6em
            aspect-ratio: 1
            object-fit: cover

        .mtext
            flex-grow: 1
            color: $color-text-light
            display: -webkit-box
            -webkit-box-orient: vertical
            overflow: hidden

        .reply-text
            white-space: nowrap
            overflow: hidden
            text-overflow: ellipsis

        .reply-quote
            position: relative
            font-style: italic
            display: -webkit-box
            -webkit-line-clamp: 5
            -webkit-box-orient: vertical
            overflow: hidden
            white-space: pre-wrap
            word-break: break-word
            max-height: 7.5em

    .quote-container
        margin: 6px 0

    .reactions
        display: flex
        flex-wrap: wrap
        gap: 6px
        margin-top: 6px

        .reaction
            display: inline-flex
            align-items: center
            gap: 4px
            background: rgba(0, 0, 0, 0.05)
            border-radius: 12px
            padding: 2px 8px
            font-size: 0.85em
            user-select: none

            .reaction-emoji
                font-size: 1.1em

            .reaction-count
                color: $color-text-light
                font-size: 0.9em
                font-weight: 500

        &.interactive-reactions
            gap: 0.35rem

            .reaction-btn
                --custom-emoji-size: 1.25rem
                height: 1.875rem
                padding: 0 0.5rem 0 0.375rem
                border: none
                border-radius: 1.75rem
                gap: 0.25rem
                font-family: inherit
                font-size: 0.85em
                font-weight: 600
                font-variant-numeric: tabular-nums
                line-height: 1.75rem
                white-space: nowrap
                cursor: pointer
                background: rgba(255, 131, 115, 0.12)
                color: $color-text-special-dark
                transition: background-color 150ms ease, color 150ms ease, transform 120ms ease

                .reaction-emoji
                    --apple-emoji-size: 1.2rem
                    font-size: 1.15rem
                    line-height: 1
                    vertical-align: middle !important

                .reaction-count
                    color: inherit
                    font-size: 0.86rem
                    font-weight: 600
                    margin-inline-end: 0.1rem

                &:hover
                    background: rgba(255, 131, 115, 0.2)

                &:active
                    transform: scale(0.95)

                &.chosen
                    background: $color-text-special
                    color: #ffffff

                    &:hover
                        background: color.adjust($color-text-special, $lightness: -4%)

    .images.has-head
        margin: 0 -20px 10px

    .images
        margin: -12px -20px 10px
        display: flex
        position: relative

        .image_container
            overflow: hidden
            position: absolute
            // Gray bg is needed to fix the white infix vignette effect from the spoiler blur
            background: gray

        img
            width: 100%
            height: 100%
            object-fit: cover
            transition: filter 1s ease

    .text
        white-space: pre-line
        overflow-wrap: break-word

    .info
        display: flex
        flex-wrap: wrap
        align-items: center
        color: color.adjust($color-text-main, $lightness: 40%)
        white-space: nowrap
        font-size: 0.9em
        gap: 4px 10px

        &.has-comment-fab
            padding-right: 1.05rem

            &.has-comment-count
                padding-right: 2.25rem

        .id
            display: flex
            align-items: center
            gap: 5px

        .share
            display: flex
            align-items: center

            &:hover
                color: $color-text-special

        .views
            display: flex
            align-items: center
            gap: 5px

        svg
            font-size: 0.75em

    // Files
    .files
        // Custom margin control
        margin-left: -20px
        margin-right: -20px

        // Margin between files in a file group
        > * + *
            margin-top: 10px
</style>

<style lang="sass">
@use "sass:color"
@use "css/colors" as *

.media_spoiler
    // Hide content with blur
    filter: blur(18px)

.post
    a
        color: $color-text-special
        text-decoration: none

    blockquote
        display: inline-block
        width: fit-content
        max-width: 100%
        box-sizing: border-box
        margin: 4px 0
        padding: 3px 34px 3px 12px
        position: relative
        border-radius: 4px
        background: linear-gradient(45deg, $color-text-special, $color-text-special), rgba(255, 131, 115, 0.12)
        background-size: 2.8px 100%
        background-repeat: no-repeat
        white-space: pre-wrap
        word-break: break-word
        color: inherit

        &::after
            content: ""
            position: absolute
            width: 12px
            height: 12px
            top: 6px
            right: 6px
            background: $color-text-special
            -webkit-mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M3 101q0-18 9-33t24-23.5T68.5 36t32.5 8.5T125 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T39 217l12-24q7-13 11-27-25-3-42-21.5T3 101zm163 0q0-18 9-33t24-23.5 32.5-8.5 32.5 8.5T288 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T202 217l12-24q7-13 11-27-25-3-42-21.5T166 101z'/%3E%3C/svg%3E")
            mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M3 101q0-18 9-33t24-23.5T68.5 36t32.5 8.5T125 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T39 217l12-24q7-13 11-27-25-3-42-21.5T3 101zm163 0q0-18 9-33t24-23.5 32.5-8.5 32.5 8.5T288 68t9 33v19q0 54-24 102l-12 24q-6 12-19 16t-25-2-16.5-18.5T202 217l12-24q7-13 11-27-25-3-42-21.5T166 101z'/%3E%3C/svg%3E")
            -webkit-mask-size: 100%
            mask-size: 100%

    blockquote[expandable], blockquote.expandable
        position: relative
        cursor: pointer
        transition: all 0.2s ease

        &::before
            content: ""
            position: absolute
            background: $color-text-special
            width: 16px
            height: 16px
            bottom: 4px
            right: 5px
            -webkit-mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M150 182l79-78q3-4 8.5-4t9 3.5 3.5 9-4 8.5l-87 88q-4 4-9 4t-9-4l-87-88q-4-3-4-8.5t3.5-9 9-3.5 8.5 4z'/%3E%3C/svg%3E")
            mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 366.3018'%3E%3Cpath d='M150 182l79-78q3-4 8.5-4t9 3.5 3.5 9-4 8.5l-87 88q-4 4-9 4t-9-4l-87-88q-4-3-4-8.5t3.5-9 9-3.5 8.5 4z'/%3E%3C/svg%3E")
            -webkit-mask-size: 100%
            mask-size: 100%
            transition: transform 0.2s ease

        &:not([open]):not(.expanded)
            display: -webkit-box
            -webkit-box-orient: vertical
            -webkit-line-clamp: 3
            line-clamp: 3
            max-height: 4.5em
            text-overflow: ellipsis
            overflow: hidden

        &[open]::before, &.expanded::before
            transform: rotate(180deg)

        &[open], &.expanded
            display: block
            -webkit-line-clamp: none
            line-clamp: none
            max-height: none

    p
        margin: 4px 0
        &:first-child
            margin-top: 0
        &:last-child
            margin-bottom: 0

    h1, h2, h3, h4, h5, h6
        font-family: inherit
        font-weight: bold
        margin: 0
        padding: 0.6rem 0 0.4rem 0
        line-height: 1.3
        color: inherit

    h1
        font-size: 1.25em
    h2
        font-size: 1.15em
    h3
        font-size: 1.05em
    h4, h5, h6
        font-size: 1em

    ol, ul
        margin: 6px 0
        padding-left: 24px

    li
        margin: 3px 0
        > p
            margin: 0
            display: inline

    pre
        background: rgba(0, 0, 0, 0.05)
        border-radius: 8px
        margin: 12px 0
        overflow: hidden
        font-size: 0.9em
        position: relative
        box-sizing: border-box

        .code-header
            display: flex
            justify-content: space-between
            align-items: center
            padding: 5px 12px
            background: rgba(0, 0, 0, 0.03)
            border-bottom: 1px solid rgba(0, 0, 0, 0.06)
            font-size: 0.75em
            font-weight: 600
            color: $color-text-light
            text-transform: uppercase
            letter-spacing: 0.5px
            user-select: none

            .code-lang
                font-family: inherit

            .code-copy-btn
                background: none
                border: none
                color: $color-text-light
                cursor: pointer
                font-size: 0.85em
                display: flex
                align-items: center
                gap: 4px
                padding: 2px 8px
                border-radius: 4px
                font-family: inherit
                font-weight: 600
                transition: color 0.2s ease, background 0.2s ease

                &:hover
                    color: $color-text-special
                    background: rgba(0, 0, 0, 0.06)

                &.copied
                    color: #34c759

        code
            display: block
            font-family: monospace
            padding: 10px 14px
            overflow-x: auto
            background: none
            border-radius: 0
            line-height: 1.45

        code.hljs
            background: transparent !important
            color: inherit
            padding: 10px 14px

    .rich-photo
        margin: 6px -20px 8px
        text-align: center

        &:first-child
            margin-top: -12px

        &:last-child
            margin-bottom: -8px

        img
            width: 100%
            max-width: 100%
            height: auto
            border-radius: 0
            display: block
            margin: 0 auto

        figcaption
            font-size: 0.85em
            color: $color-text-light
            text-align: center
            margin-top: 4px
            padding: 0 20px

    .rich-table
        width: 100%
        border-collapse: collapse
        margin: 12px 0
        font-size: 0.9em
        border-radius: 8px
        overflow: hidden

        caption
            font-weight: bold
            font-size: 0.95em
            padding: 6px 0
            text-align: center
            color: inherit

        th, td
            padding: 8px 12px
            text-align: left
            vertical-align: top
            overflow-wrap: anywhere

        th
            background: rgba(0, 0, 0, 0.05)
            font-weight: bold

        &.bordered
            border: 1px solid rgba(0, 0, 0, 0.1)

            th, td
                border: 1px solid rgba(0, 0, 0, 0.1)

        &.striped tbody tr:nth-child(odd)
            background: rgba(0, 0, 0, 0.02)

    ul.checklist
        list-style: none
        padding-left: 2px
        margin: 6px 0

        li.check-item
            display: flex
            align-items: center
            gap: 8px
            margin: 4px 0
            line-height: 1.4

            input[type="checkbox"]
                appearance: none
                -webkit-appearance: none
                width: 16px
                height: 16px
                border: 1.5px solid rgba(0, 0, 0, 0.25)
                border-radius: 3px
                margin: 0
                cursor: default
                position: relative
                flex-shrink: 0

                &:checked
                    background-color: $color-text-special
                    border-color: $color-text-special

                    &::after
                        content: ""
                        position: absolute
                        left: 4px
                        top: 1px
                        width: 4px
                        height: 8px
                        border: solid white
                        border-width: 0 2px 2px 0
                        transform: rotate(45deg)

            p
                margin: 0

    details
        margin: 8px 0

        summary
            cursor: pointer
            font-weight: bold
            display: flex
            align-items: center
            gap: 6px
            padding: 6px 0
            user-select: none
            list-style: none
            outline: none

            &::-webkit-details-marker
                display: none

            &::before
                content: ""
                display: inline-block
                width: 14px
                height: 14px
                background: currentColor
                -webkit-mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E")
                mask: no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E")
                -webkit-mask-size: 100%
                mask-size: 100%
                transition: transform 0.2s ease-in-out

        &[open] > summary::before
            transform: rotate(90deg)

        > *:not(summary)
            margin: 4px 0 6px 20px

    .rich-button-row
        display: flex
        gap: 8px
        margin: 8px 0
        flex-wrap: wrap

        &.align-center
            justify-content: center
        &.align-right
            justify-content: flex-end

    .rich-button
        display: inline-flex
        align-items: center
        justify-content: center
        padding: 6px 18px
        margin: 4px 6px 4px 0
        min-height: 32px
        box-sizing: border-box
        border-radius: 1000px
        font-weight: 600
        font-size: 0.88em
        text-align: center
        text-decoration: none !important
        transition: background-color 0.2s ease, opacity 0.2s ease
        line-height: 1.2

        &.default
            color: inherit
            background: rgba(0, 0, 0, 0.08)
            &:hover
                background: rgba(0, 0, 0, 0.14)

        &.primary
            background: $color-text-special
            color: white !important
            &:hover
                opacity: 0.9

        &.success
            background: rgba(47, 174, 73, 0.12)
            color: #2fae49 !important
            &:hover
                background: rgba(47, 174, 73, 0.2)

        &.danger
            background: rgba(223, 63, 64, 0.12)
            color: #df3f40 !important
            &:hover
                background: rgba(223, 63, 64, 0.2)

    .rich-footer
        font-size: 0.88em
        color: $color-text-light
        margin: 12px 0
        font-style: normal
        line-height: 1.4

    .pullquote
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        margin: 14px auto
        padding: 10px 28px
        width: fit-content
        max-width: 90%
        border-radius: 6px
        background: rgba(255, 131, 115, 0.12)
        background-size: auto
        border: none
        text-align: center
        font-style: italic
        position: relative

        &::before, &::after
            display: none

        cite
            display: block
            font-style: normal
            font-weight: bold
            font-size: 0.88em
            color: $color-text-special
            margin-top: 4px
            text-align: center

    cite
        display: block
        font-size: 0.88em
        font-weight: bold
        color: $color-text-special
        margin-top: 4px
        font-style: normal

    hr
        border: none
        height: 1px
        background: rgba(0, 0, 0, 0.12)
        width: 33.333%
        margin: 16px auto

    code.math
        background: transparent !important
        border: none
        padding: 0 2px
        font-size: 1.15em
        color: inherit

// Custom emojis
i.custom-emoji
    video, img, .tgb-tgs-host
        $size-incr: 0.3em
        display: inline-block
        width: 1em + $size-incr
        height: 1em + $size-incr
        margin-top: calc($size-incr / -2)
        margin-bottom: calc($size-incr / -2)
        vertical-align: -0.2em
        //transform: translateY(0.125em)
        transform: translateZ(1em)
        pointer-events: none
        image-rendering: optimizeQuality

    .tgb-tgs-host svg
        width: 100% !important
        height: 100% !important
        display: block
</style>
