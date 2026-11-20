<template>
    <div class="tgb-rich-input-wrap"
         :class="{ 'is-dragging': isDragging, 'is-disabled': readonly }"
         @dragover.prevent="onDragOver"
         @dragleave="onDragLeave"
         @drop.prevent="onDrop">
        <div v-if="isEmpty" class="tgb-rich-placeholder unselectable" aria-hidden="true">
            {{ placeholder }}
        </div>
        <div ref="editorEl"
             class="tgb-rich-input"
             :contenteditable="readonly ? 'false' : 'true'"
             role="textbox"
             aria-multiline="true"
             :aria-label="ariaLabel || placeholder"
             @beforeinput="onBeforeInput"
             @input="onEditorInput"
             @keydown="onEditorKeydown"
             @paste="onPaste"
             @contextmenu="onContextMenu"
             @pointerdown="onPointerDown"
             @pointermove="onPointerMove"
             @pointerup="onPointerUp"
             @touchend="scheduleTouchFormatterOpen"
             @focus="onFocus"
             @blur="onBlur"></div>

        <TextFormatter :open="formatterOpen"
                       :anchor="formatterAnchor"
                       :anchor-el="editorEl"
                       :active-formats="activeFormats"
                       :initial-link-open="formatterLinkOpen"
                       @toggle-format="onToggleFormat"
                       @apply-link="onApplyLink"
                       @clear-formatting="onClearFormatting"
                       @link-open-change="onLinkOpenChange"
                       @close="closeFormatter" />
    </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {sanitizeCommentHtml} from '@/logic/api'
import {buildCustomEmojiCandidates, createCustomEmojiDomManager} from '@/logic/customEmojiDom'
import {
    EditorHistoryEntry,
    EditorHistoryManager,
    getEditorSelectionOffsets,
    getNodeLogicalLength,
    restoreEditorSelectionOffsets,
    snapshotEditorHtml,
} from '@/logic/editorHistory'
import {matchLiveMarkdownRule, parseMarkdownToHtml, serializeEditorDomToMarkdown} from '@/logic/markdown'
import {isValidCustomEmojiId, resolveCustomEmojiBaseSrc} from '@/logic/reactions'
import {isSafeMediaUrl} from '@/logic/url'
import TextFormatter, {ActiveFormatState, FormatterFormatKey} from '@/views/TextFormatter.vue'

const props = withDefaults(defineProps<{
    modelValue: string
    placeholder?: string
    ariaLabel?: string
    readonly?: boolean
    maxLength?: number
    customEmojiUrls?: Record<string, string>
    epochEmojiBase?: string | null
    postsUrl?: string
}>(), {
    placeholder: '',
    maxLength: 4000,
    postsUrl: '',
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'text-length', length: number): void
    (e: 'submit'): void
    (e: 'files', files: File[]): void
    (e: 'focus'): void
    (e: 'blur'): void
}>()

const editorEl = ref<HTMLDivElement | null>(null)
const isEmpty = ref(!props.modelValue)
const isDragging = ref(false)
const formatterOpen = ref(false)
const formatterLinkOpen = ref(false)
const formatterAnchor = ref({x: 0, y: 0})
const linkControlActive = ref(false)
const activeFormats = ref<ActiveFormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    monospace: false,
    spoiler: false,
    blockquote: false,
    linkHref: undefined,
    hasFormatting: false,
})

let savedRange: Range | null = null
let lastPointerType = 'mouse'
let syncingFromModel = false
let applyingHistory = false
let touchFormatterTimer: ReturnType<typeof setTimeout> | null = null
const emojiDomManager = createCustomEmojiDomManager()
const history = new EditorHistoryManager()

function buildCandidatesForId(id: string): string[] {
    if (!isValidCustomEmojiId(id)) return []
    const primary = resolveCustomEmojiBaseSrc(
        id,
        props.customEmojiUrls ?? {},
        props.postsUrl ?? '',
        props.epochEmojiBase ?? null
    )
    return buildCustomEmojiCandidates(primary)
}

function createCustomEmojiChip(id: string, alt = '✦'): HTMLSpanElement {
    const chip = document.createElement('span')
    chip.className = 'tgb-editor-ce'
    chip.setAttribute('contenteditable', 'false')
    chip.setAttribute('data-custom-emoji-id', id)
    chip.setAttribute('data-emoji-alt', alt)
    const candidates = buildCandidatesForId(id)
    if (candidates.length) {
        emojiDomManager.mountElement(chip, candidates, alt)
    } else {
        chip.textContent = alt || '✦'
    }
    return chip
}

function mountCustomEmojisInDom() {
    if (!editorEl.value || typeof document === 'undefined') return
    emojiDomManager.pruneDetached(editorEl.value)
    const legacyNodes = Array.from(editorEl.value.querySelectorAll<HTMLElement>('i.custom-emoji[data-custom-emoji-id]'))
    for (const node of legacyNodes) {
        const id = node.getAttribute('data-custom-emoji-id')?.trim()
        if (!id || !isValidCustomEmojiId(id)) continue
        const alt = node.textContent?.trim() || '✦'
        const chip = createCustomEmojiChip(id, alt)
        node.replaceWith(chip)
    }
    const chipNodes = Array.from(editorEl.value.querySelectorAll<HTMLElement>('.tgb-editor-ce[data-custom-emoji-id]'))
    for (const chip of chipNodes) {
        const id = chip.getAttribute('data-custom-emoji-id')?.trim()
        if (!id || !isValidCustomEmojiId(id)) continue
        const alt = chip.getAttribute('data-emoji-alt') || chip.textContent?.trim() || '✦'
        const candidates = buildCandidatesForId(id)
        if (candidates.length) {
            emojiDomManager.mountElement(chip, candidates, alt)
        } else {
            chip.textContent = alt
        }
    }
}

function captureEditorSnapshot(rangeOverride?: Range | null): EditorHistoryEntry {
    const root = editorEl.value
    if (!root) {
        return {html: '', selStart: 0, selEnd: 0}
    }
    const html = snapshotEditorHtml(root)
    const range = rangeOverride ?? getEditorRange() ?? savedRange
    if (range && isNodeInsideEditor(range.commonAncestorContainer)) {
        const {start, end} = getEditorSelectionOffsets(root, range)
        return {html, selStart: start, selEnd: end}
    }
    const endOffset = getNodeLogicalLength(root, root)
    return {html, selStart: endOffset, selEnd: endOffset}
}

function recordProgrammaticEdit(mutate: () => void) {
    if (!editorEl.value) return
    const before = captureEditorSnapshot(getEditorRange() ?? savedRange)
    mutate()
    const after = captureEditorSnapshot()
    if (after.html !== before.html) {
        history.push(before)
        history.push(after)
    }
}

function applyHistoryEntry(entry: EditorHistoryEntry) {
    if (!editorEl.value || typeof document === 'undefined') return
    applyingHistory = true
    try {
        emojiDomManager.destroyAll()
        editorEl.value.innerHTML = entry.html
        mountCustomEmojisInDom()
        const restoredRange = restoreEditorSelectionOffsets(editorEl.value, entry.selStart, entry.selEnd)
        if (restoredRange) {
            setCaretRange(restoredRange)
            activeFormats.value = computeActiveFormats(restoredRange)
        } else {
            savedRange = null
        }
        isEmpty.value = computeIsEmpty()
        emit('text-length', getTextLength())
        const md = serializeEditorDomToMarkdown(editorEl.value)
        if (md !== props.modelValue) {
            emit('update:modelValue', md)
        }
    } finally {
        applyingHistory = false
    }
}

function performUndo(): boolean {
    if (props.readonly || !editorEl.value) return false
    const prev = history.undo()
    if (!prev) return false
    applyHistoryEntry(prev)
    return true
}

function performRedo(): boolean {
    if (props.readonly || !editorEl.value) return false
    const next = history.redo()
    if (!next) return false
    applyHistoryEntry(next)
    return true
}

function computeIsEmpty(): boolean {
    const root = editorEl.value
    if (!root) return true
    if (root.querySelector('[data-custom-emoji-id]')) return false
    const text = (root.textContent ?? '').replace(/[\u200B\n\r]/g, '')
    return text.length === 0
}

function syncFromDom(applyLiveRules = false) {
    if (!editorEl.value || syncingFromModel) return
    if (applyLiveRules) {
        applyLiveMarkdownAtCaret()
    }
    emojiDomManager.pruneDetached(editorEl.value)
    isEmpty.value = computeIsEmpty()
    emit('text-length', getTextLength())
    const md = serializeEditorDomToMarkdown(editorEl.value)
    if (md !== props.modelValue) {
        emit('update:modelValue', md)
    }
}

function setDomFromMarkdown(md: string) {
    if (!editorEl.value || typeof document === 'undefined') return
    syncingFromModel = true
    try {
        emojiDomManager.destroyAll()
        if (!md) {
            editorEl.value.innerHTML = ''
        } else {
            editorEl.value.innerHTML = parseMarkdownToHtml(md)
            mountCustomEmojisInDom()
        }
        isEmpty.value = computeIsEmpty()
        emit('text-length', getTextLength())
        if (!applyingHistory) {
            history.reset(captureEditorSnapshot())
        }
    } finally {
        syncingFromModel = false
    }
}

watch(() => props.modelValue, (nextVal) => {
    if (!editorEl.value) return
    const curMd = serializeEditorDomToMarkdown(editorEl.value)
    if (nextVal !== curMd) {
        setDomFromMarkdown(nextVal)
    } else {
        isEmpty.value = computeIsEmpty()
    }
})

// --- Selection helpers ---

function isNodeInsideEditor(node: Node | null): boolean {
    if (!node || !editorEl.value) return false
    return node === editorEl.value || editorEl.value.contains(node)
}

function getEditorRange(): Range | null {
    if (typeof window === 'undefined') return null
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const range = sel.getRangeAt(0)
    if (!isNodeInsideEditor(range.commonAncestorContainer)) return null
    return range
}

function saveCurrentSelection() {
    const r = getEditorRange()
    if (r) {
        savedRange = r.cloneRange()
    }
}

function restoreOrEndRange(): Range | null {
    if (typeof window === 'undefined' || !editorEl.value) return null
    const sel = window.getSelection()
    if (!sel) return null

    if (savedRange && isNodeInsideEditor(savedRange.commonAncestorContainer)) {
        sel.removeAllRanges()
        sel.addRange(savedRange)
        return savedRange
    }

    const r = document.createRange()
    r.selectNodeContents(editorEl.value)
    r.collapse(false)
    sel.removeAllRanges()
    sel.addRange(r)
    savedRange = r.cloneRange()
    return r
}

function setCaretRange(range: Range) {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(range)
    savedRange = range.cloneRange()
}

function placeCaretAfterNode(node: Node) {
    if (typeof document === 'undefined') return
    const range = document.createRange()
    range.setStartAfter(node)
    range.collapse(true)
    setCaretRange(range)
}

function findAncestorTag(node: Node | null, tags: string[]): HTMLElement | null {
    let cur: Node | null = node
    while (cur && cur !== editorEl.value) {
        if (cur.nodeType === 1) {
            const el = cur as HTMLElement
            const tag = el.tagName.toUpperCase()
            if (tags.includes(tag)) return el
        }
        cur = cur.parentNode
    }
    return null
}

function rangeContainsMatch(range: Range, predicate: (el: HTMLElement) => boolean): boolean {
    if (typeof document === 'undefined') return false
    let ancestor: Node | null = range.commonAncestorContainer
    while (ancestor && ancestor !== editorEl.value) {
        if (ancestor.nodeType === 1 && predicate(ancestor as HTMLElement)) {
            return true
        }
        ancestor = ancestor.parentNode
    }
    if (range.collapsed) return false
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT)
    let cur: Node | null
    while ((cur = walker.nextNode()) !== null) {
        const el = cur as HTMLElement
        if (range.intersectsNode(el) && predicate(el)) {
            return true
        }
    }
    return false
}

function computeActiveFormats(range: Range): ActiveFormatState {
    const bold = rangeContainsMatch(range, el => el.tagName === 'B' || el.tagName === 'STRONG')
    const italic = rangeContainsMatch(range, el => el.tagName === 'EM' || (el.tagName === 'I' && !el.hasAttribute('data-custom-emoji-id')))
    const underline = rangeContainsMatch(range, el => el.tagName === 'U')
    const strikethrough = rangeContainsMatch(range, el => el.tagName === 'DEL' || el.tagName === 'S')
    const monospace = rangeContainsMatch(range, el => el.tagName === 'CODE' || el.tagName === 'PRE')
    const spoiler = rangeContainsMatch(range, el => el.classList.contains('spoiler'))
    const blockquote = rangeContainsMatch(range, el => el.tagName === 'BLOCKQUOTE')

    let linkHref: string | undefined
    const anchor = findAncestorTag(range.commonAncestorContainer, ['A'])
    if (anchor) {
        linkHref = anchor.getAttribute('href') ?? undefined
    } else if (!range.collapsed && typeof document !== 'undefined') {
        const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT)
        let cur: Node | null
        while ((cur = walker.nextNode()) !== null) {
            const el = cur as HTMLElement
            if (el.tagName === 'A' && range.intersectsNode(el)) {
                linkHref = el.getAttribute('href') ?? undefined
                break
            }
        }
    }

    const hasFormatting = bold || italic || underline || strikethrough || monospace || spoiler || blockquote || linkHref !== undefined
    return {
        bold,
        italic,
        underline,
        strikethrough,
        monospace,
        spoiler,
        blockquote,
        linkHref,
        hasFormatting,
    }
}

// --- Live Markdown Auto-Formatting ---

function applyLiveMarkdownAtCaret(): boolean {
    const range = getEditorRange()
    if (!range || !range.collapsed) return false
    const container = range.startContainer
    if (container.nodeType !== 3) return false
    // Never auto-format inside code or pre
    if (findAncestorTag(container, ['CODE', 'PRE'])) return false

    const textNode = container as Text
    const fullText = textNode.nodeValue ?? ''
    const caretOffset = range.startOffset
    const before = fullText.slice(0, caretOffset)

    const match = matchLiveMarkdownRule(before)
    if (!match) return false

    const prefix = fullText.slice(0, match.start)
    const suffix = fullText.slice(caretOffset)

    let wrapper: HTMLElement
    if (match.format === 'bold') {
        wrapper = document.createElement('b')
    } else if (match.format === 'italic') {
        wrapper = document.createElement('em')
    } else if (match.format === 'strike') {
        wrapper = document.createElement('del')
    } else if (match.format === 'spoiler') {
        wrapper = document.createElement('span')
        wrapper.className = 'spoiler'
    } else {
        wrapper = document.createElement('code')
    }
    wrapper.textContent = match.content

    const parent = textNode.parentNode
    if (!parent) return false

    const frag = document.createDocumentFragment()
    if (prefix) {
        frag.appendChild(document.createTextNode(prefix))
    }
    frag.appendChild(wrapper)

    // Place a trailing text node so subsequent typing continues outside the formatted tag
    const afterNode = document.createTextNode(suffix || '\u200B')
    frag.appendChild(afterNode)
    parent.replaceChild(frag, textNode)

    const nextRange = document.createRange()
    nextRange.setStart(afterNode, suffix ? 0 : afterNode.length)
    nextRange.collapse(true)
    setCaretRange(nextRange)
    return true
}

// --- Formatting Mutations ---

function unwrapElement(el: HTMLElement) {
    const parent = el.parentNode
    if (!parent) return
    const frag = document.createDocumentFragment()
    while (el.firstChild) {
        frag.appendChild(el.firstChild)
    }
    parent.replaceChild(frag, el)
}

function unwrapTagsInRange(range: Range, predicate: (el: HTMLElement) => boolean) {
    const ancestorEl = findAncestorFromRange(range, predicate)
    if (ancestorEl && editorEl.value?.contains(ancestorEl)) {
        const nextRange = document.createRange()
        nextRange.selectNodeContents(ancestorEl)
        unwrapElement(ancestorEl)
        setCaretRange(nextRange)
        return
    }
    if (!editorEl.value || range.collapsed) return
    const matches: HTMLElement[] = []
    const walker = document.createTreeWalker(editorEl.value, NodeFilter.SHOW_ELEMENT)
    let cur: Node | null
    while ((cur = walker.nextNode()) !== null) {
        const el = cur as HTMLElement
        if (range.intersectsNode(el) && predicate(el)) {
            matches.push(el)
        }
    }
    for (const el of matches) {
        unwrapElement(el)
    }
}

function findAncestorFromRange(range: Range, predicate: (el: HTMLElement) => boolean): HTMLElement | null {
    let cur: Node | null = range.commonAncestorContainer
    while (cur && cur !== editorEl.value) {
        if (cur.nodeType === 1 && predicate(cur as HTMLElement)) {
            return cur as HTMLElement
        }
        cur = cur.parentNode
    }
    return null
}

function toggleInlineFormat(format: Exclude<FormatterFormatKey, 'blockquote' | 'monospace'>) {
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range || !editorEl.value) return

        const matcherMap: Record<typeof format, (el: HTMLElement) => boolean> = {
            bold: el => el.tagName === 'B' || el.tagName === 'STRONG',
            italic: el => el.tagName === 'EM' || (el.tagName === 'I' && !el.hasAttribute('data-custom-emoji-id')),
            underline: el => el.tagName === 'U',
            strikethrough: el => el.tagName === 'DEL' || el.tagName === 'S',
            spoiler: el => el.classList.contains('spoiler'),
        }
        const tagMap: Record<typeof format, () => HTMLElement> = {
            bold: () => document.createElement('b'),
            italic: () => document.createElement('em'),
            underline: () => document.createElement('u'),
            strikethrough: () => document.createElement('del'),
            spoiler: () => {
                const sp = document.createElement('span')
                sp.className = 'spoiler'
                return sp
            },
        }

        const pred = matcherMap[format]
        const isActive = rangeContainsMatch(range, pred)

        if (range.collapsed) {
            const inside = findAncestorFromRange(range, pred)
            if (inside) {
                // Exit active mark at caret
                const spacer = document.createTextNode('\u200B')
                inside.parentNode?.insertBefore(spacer, inside.nextSibling)
                const r = document.createRange()
                r.setStart(spacer, spacer.length)
                r.collapse(true)
                setCaretRange(r)
            } else {
                const wrapper = tagMap[format]()
                const innerText = document.createTextNode('\u200B')
                wrapper.appendChild(innerText)
                range.insertNode(wrapper)
                const r = document.createRange()
                r.setStart(innerText, innerText.length)
                r.collapse(true)
                setCaretRange(r)
            }
            syncFromDom()
            return
        }

        if (isActive) {
            unwrapTagsInRange(range, pred)
        } else {
            const wrapper = tagMap[format]()
            const frag = range.extractContents()
            wrapper.appendChild(frag)
            range.insertNode(wrapper)
            const nextRange = document.createRange()
            nextRange.selectNodeContents(wrapper)
            setCaretRange(nextRange)
        }
        syncFromDom()
        activeFormats.value = computeActiveFormats(getEditorRange() ?? range)
    })
}

function extractNodesTextWithEmojis(node: Node): string {
    if (node.nodeType === 3) {
        return (node.nodeValue ?? '').replace(/\u00A0/g, ' ').replace(/\u200B/g, '')
    }
    if (node.nodeType !== 1) return ''
    const el = node as HTMLElement
    const tag = el.tagName.toUpperCase()
    if (tag === 'BR') return '\n'
    if (el.hasAttribute('data-custom-emoji-id')) {
        return el.getAttribute('data-emoji-alt') || el.getAttribute('alt') || '✦'
    }
    if (tag === 'IMG' && el.classList.contains('tgb-apple-emoji')) {
        return el.getAttribute('alt') || ''
    }
    let inner = ''
    const children = Array.from(el.childNodes)
    for (const child of children) {
        inner += extractNodesTextWithEmojis(child)
    }
    if ((tag === 'DIV' || tag === 'P' || tag === 'BLOCKQUOTE' || tag === 'LI') && inner && !inner.endsWith('\n')) {
        inner += '\n'
    }
    return inner
}

function extractRangeTextWithEmojis(range: Range): string {
    const frag = range.cloneContents()
    let out = ''
    for (const child of Array.from(frag.childNodes)) {
        out += extractNodesTextWithEmojis(child)
    }
    return out.replace(/\n+$/, '')
}

function toggleMonospace() {
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range || !editorEl.value) return

        const pred = (el: HTMLElement) => el.tagName === 'CODE' || el.tagName === 'PRE'
        if (rangeContainsMatch(range, pred)) {
            unwrapTagsInRange(range, pred)
            syncFromDom()
            const next = getEditorRange()
            if (next) activeFormats.value = computeActiveFormats(next)
            return
        }

        if (range.collapsed) {
            const code = document.createElement('code')
            const txt = document.createTextNode('\u200B')
            code.appendChild(txt)
            range.insertNode(code)
            const r = document.createRange()
            r.setStart(txt, txt.length)
            r.collapse(true)
            setCaretRange(r)
            syncFromDom()
            return
        }

        const selectedText = extractRangeTextWithEmojis(range)
        if (!selectedText) return
        range.deleteContents()

        if (selectedText.includes('\n')) {
            const pre = document.createElement('pre')
            const code = document.createElement('code')
            code.textContent = selectedText
            pre.appendChild(code)
            range.insertNode(pre)
            const r = document.createRange()
            r.selectNodeContents(code)
            setCaretRange(r)
        } else {
            const code = document.createElement('code')
            code.textContent = selectedText
            range.insertNode(code)
            const r = document.createRange()
            r.selectNodeContents(code)
            setCaretRange(r)
        }

        syncFromDom()
        const next = getEditorRange()
        if (next) activeFormats.value = computeActiveFormats(next)
    })
}

function toggleBlockquote() {
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range || !editorEl.value) return

        const existingQuote = findAncestorTag(range.commonAncestorContainer, ['BLOCKQUOTE'])
        if (existingQuote) {
            const first = existingQuote.firstChild
            unwrapElement(existingQuote)
            if (first) {
                const r = document.createRange()
                r.selectNodeContents(first)
                r.collapse(false)
                setCaretRange(r)
            }
            syncFromDom()
            const next = getEditorRange()
            if (next) activeFormats.value = computeActiveFormats(next)
            return
        }

        const pred = (el: HTMLElement) => el.tagName === 'BLOCKQUOTE'
        if (rangeContainsMatch(range, pred)) {
            unwrapTagsInRange(range, pred)
            syncFromDom()
            const next = getEditorRange()
            if (next) activeFormats.value = computeActiveFormats(next)
            return
        }

        const bq = document.createElement('blockquote')
        if (range.collapsed) {
            if (isEmpty.value) {
                bq.innerHTML = '<br>'
                editorEl.value.appendChild(bq)
                const r = document.createRange()
                r.setStart(bq, 0)
                r.collapse(true)
                setCaretRange(r)
            } else {
                // Wrap the direct child of editorEl containing the caret, or inline content on current line
                let topNode: Node | null = range.startContainer
                while (topNode && topNode.parentNode !== editorEl.value) {
                    topNode = topNode.parentNode
                }
                if (topNode && topNode.parentNode === editorEl.value) {
                    editorEl.value.insertBefore(bq, topNode)
                    bq.appendChild(topNode)
                    const r = document.createRange()
                    r.selectNodeContents(bq)
                    r.collapse(false)
                    setCaretRange(r)
                }
            }
        } else {
            const frag = range.extractContents()
            bq.appendChild(frag)
            range.insertNode(bq)
            const r = document.createRange()
            r.selectNodeContents(bq)
            setCaretRange(r)
        }

        syncFromDom()
        const next = getEditorRange()
        if (next) activeFormats.value = computeActiveFormats(next)
    })
}

function onToggleFormat(format: FormatterFormatKey) {
    if (format === 'monospace') {
        toggleMonospace()
    } else if (format === 'blockquote') {
        toggleBlockquote()
    } else {
        toggleInlineFormat(format)
    }
}

function onApplyLink(url: string) {
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range || !editorEl.value) return

        if (!url) {
            unwrapTagsInRange(range, el => el.tagName === 'A')
            syncFromDom()
            const next = getEditorRange()
            if (next) activeFormats.value = computeActiveFormats(next)
            return
        }

        if (!isSafeMediaUrl(url)) return

        const existingAnchor = findAncestorTag(range.commonAncestorContainer, ['A'])
        if (existingAnchor) {
            existingAnchor.setAttribute('href', url)
            existingAnchor.setAttribute('target', '_blank')
            existingAnchor.setAttribute('rel', 'noopener noreferrer nofollow')
            syncFromDom()
            return
        }

        if (range.collapsed) return
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener noreferrer nofollow'
        a.appendChild(range.extractContents())
        range.insertNode(a)
        const nextRange = document.createRange()
        nextRange.selectNodeContents(a)
        setCaretRange(nextRange)
        syncFromDom()
        activeFormats.value = computeActiveFormats(nextRange)
    })
}

function onClearFormatting() {
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range || !editorEl.value) return
        const formatTags = new Set(['B', 'STRONG', 'EM', 'I', 'U', 'DEL', 'S', 'STRIKE', 'CODE', 'PRE', 'BLOCKQUOTE', 'A'])
        unwrapTagsInRange(range, el => {
            if (el.hasAttribute('data-custom-emoji-id')) return false
            return formatTags.has(el.tagName) || el.classList.contains('spoiler')
        })
        syncFromDom()
        const next = getEditorRange()
        if (next) activeFormats.value = computeActiveFormats(next)
    })
}

// --- Events & Triggers ---

function onBeforeInput(e: InputEvent) {
    if (e.inputType === 'historyUndo') {
        e.preventDefault()
        performUndo()
        return
    }
    if (e.inputType === 'historyRedo') {
        e.preventDefault()
        performRedo()
        return
    }
    if (props.readonly || !props.maxLength || props.maxLength <= 0) return
    if (!e.inputType || !e.inputType.startsWith('insert') || e.inputType === 'insertFromPaste') return
    const currentLen = getTextLength()
    const range = getEditorRange()
    const selectedLen = range && !range.collapsed ? extractRangeTextWithEmojis(range).length : 0
    const incomingLen = (e.data ?? '').length || (e.inputType.includes('Paragraph') || e.inputType.includes('LineBreak') ? 1 : 0)
    if (currentLen - selectedLen + incomingLen > props.maxLength) {
        e.preventDefault()
    }
}

function onEditorInput(e: Event) {
    saveCurrentSelection()
    const preLiveSnapshot = captureEditorSnapshot()
    const liveApplied = applyLiveMarkdownAtCaret()
    syncFromDom(false)
    if (liveApplied) {
        history.push(preLiveSnapshot)
        history.push(captureEditorSnapshot())
        return
    }
    const inputEvent = e as InputEvent
    const inputType = inputEvent?.inputType ?? ''
    const data = inputEvent?.data ?? ''
    let coalesceKey: string | undefined
    if (inputType === 'insertText' && data.length > 0 && !/\s/.test(data)) {
        coalesceKey = 'insert'
    } else if (inputType.startsWith('delete')) {
        coalesceKey = 'delete'
    }
    history.push(captureEditorSnapshot(), {coalesceKey})
}

function onEditorKeydown(e: KeyboardEvent) {
    if (e.isComposing) return

    const mod = e.ctrlKey || e.metaKey
    if (mod) {
        const key = e.key.toLowerCase()
        if (key === 'z' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            performUndo()
            return
        }
        if ((key === 'z' && e.shiftKey && !e.altKey) || (e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && key === 'y')) {
            e.preventDefault()
            performRedo()
            return
        }
        if (key === 'b' && !e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleInlineFormat('bold')
            return
        }
        if (key === 'i' && !e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleInlineFormat('italic')
            return
        }
        if (key === 'u' && !e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleInlineFormat('underline')
            return
        }
        if (key === 'x' && e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleInlineFormat('strikethrough')
            return
        }
        if (key === 'm' && e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleMonospace()
            return
        }
        if (key === 'p' && e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleInlineFormat('spoiler')
            return
        }
        if ((key === '.' || e.key === '>') && e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            toggleBlockquote()
            return
        }
        if (key === 'k' && !e.shiftKey) {
            e.preventDefault()
            saveCurrentSelection()
            const range = getEditorRange()
            if (range && !range.collapsed) {
                openFormatterForRange(range, undefined, true)
            }
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            emit('submit')
            return
        }
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        const range = getEditorRange()
        if (range && findAncestorTag(range.startContainer, ['PRE'])) {
            return
        }
        e.preventDefault()
        emit('submit')
    }
}

function extractImageFiles(dt: DataTransfer | null | undefined): File[] {
    if (!dt) return []
    const files: File[] = []
    if (dt.files?.length) {
        for (const f of Array.from(dt.files)) {
            if (f.type.startsWith('image/')) {
                files.push(f)
            }
        }
    } else if (dt.items?.length) {
        for (const item of Array.from(dt.items)) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (file) files.push(file)
            }
        }
    }
    return files
}

function insertHtmlAtSelection(html: string) {
    if (!editorEl.value || typeof document === 'undefined') return
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range) return
        range.deleteContents()

        const tmp = document.createElement('div')
        tmp.innerHTML = html
        hydrateCustomInContainer(tmp)

        const frag = document.createDocumentFragment()
        let lastInserted: Node | null = null
        while (tmp.firstChild) {
            lastInserted = tmp.firstChild
            frag.appendChild(lastInserted)
        }
        range.insertNode(frag)
        if (lastInserted) {
            placeCaretAfterNode(lastInserted)
        }
        syncFromDom()
    })
}

function hydrateCustomInContainer(container: HTMLElement) {
    const nodes = Array.from(container.querySelectorAll<HTMLElement>('i.custom-emoji[data-custom-emoji-id]'))
    for (const node of nodes) {
        const id = node.getAttribute('data-custom-emoji-id')?.trim()
        if (!id || !isValidCustomEmojiId(id)) continue
        const alt = node.textContent?.trim() || '✦'
        node.replaceWith(createCustomEmojiChip(id, alt))
    }
}

function onPaste(e: ClipboardEvent) {
    const images = extractImageFiles(e.clipboardData)
    if (images.length > 0) {
        e.preventDefault()
        emit('files', images)
        return
    }

    let plain = e.clipboardData?.getData('text/plain') ?? ''
    if (!plain) return

    e.preventDefault()
    if (props.maxLength > 0) {
        const range = getEditorRange()
        const selectedLen = range && !range.collapsed ? extractRangeTextWithEmojis(range).length : 0
        const remaining = Math.max(0, props.maxLength - (getTextLength() - selectedLen))
        if (remaining === 0) return
        if (plain.length > remaining) {
            plain = plain.slice(0, remaining)
        }
    }

    const hasMarkdownMarkers = /(\*\*|__|~~|\|\||`|<tg-emoji\b|\[[^\]]+\]\([^)]+\)|^> )/m.test(plain)
    if (hasMarkdownMarkers) {
        const parsed = parseMarkdownToHtml(plain)
        const safe = sanitizeCommentHtml(parsed)
        insertHtmlAtSelection(safe)
    } else {
        const escaped = plain
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\r\n?/g, '\n')
            .replace(/\n/g, '<br>')
        insertHtmlAtSelection(escaped)
    }
}

function onDragOver(e: DragEvent) {
    if (props.readonly) return
    const hasFiles = e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')
    if (hasFiles) {
        isDragging.value = true
    }
}

function onDragLeave() {
    isDragging.value = false
}

function onDrop(e: DragEvent) {
    isDragging.value = false
    if (props.readonly) return
    const images = extractImageFiles(e.dataTransfer)
    if (images.length > 0) {
        emit('files', images)
    }
}

function openFormatterForRange(range: Range, explicitPoint?: { x: number; y: number }, openLink = false) {
    savedRange = range.cloneRange()
    activeFormats.value = computeActiveFormats(range)
    if (explicitPoint) {
        formatterAnchor.value = explicitPoint
    } else {
        const rect = range.getBoundingClientRect()
        formatterAnchor.value = {
            x: rect.left + rect.width / 2,
            y: rect.top,
        }
    }
    formatterLinkOpen.value = openLink
    formatterOpen.value = true
}

function onContextMenu(e: MouseEvent) {
    if (props.readonly || e.shiftKey) return
    const range = getEditorRange()
    if (!range || range.collapsed || !range.toString().trim()) return
    e.preventDefault()
    openFormatterForRange(range, {x: e.clientX, y: e.clientY}, false)
}

function clearTouchFormatterTimer() {
    if (touchFormatterTimer) {
        clearTimeout(touchFormatterTimer)
        touchFormatterTimer = null
    }
}

function scheduleTouchFormatterOpen() {
    clearTouchFormatterTimer()
    touchFormatterTimer = setTimeout(() => {
        touchFormatterTimer = null
        const range = getEditorRange()
        if (range && !range.collapsed && range.toString().trim()) {
            openFormatterForRange(range)
        }
    }, 120)
}

function onPointerDown(e: PointerEvent) {
    lastPointerType = e.pointerType || 'mouse'
    clearTouchFormatterTimer()
}

function onPointerMove() {
    if (lastPointerType === 'touch') {
        clearTouchFormatterTimer()
    }
}

function onPointerUp(e: PointerEvent) {
    lastPointerType = e.pointerType || lastPointerType
    saveCurrentSelection()
    if (lastPointerType !== 'touch') return
    scheduleTouchFormatterOpen()
}

function onSelectionChange() {
    if (typeof document === 'undefined') return
    const range = getEditorRange()
    if (range) {
        savedRange = range.cloneRange()
        // Never open TextFormatter mid-drag during selectionchange on touch (would block selection handles);
        // only auto-dismiss if the selection collapses.
        if (formatterOpen.value && !linkControlActive.value && range.collapsed) {
            formatterOpen.value = false
        }
    }
}

function onLinkOpenChange(isOpen: boolean) {
    linkControlActive.value = isOpen
    if (!isOpen) {
        formatterLinkOpen.value = false
    }
}

function closeFormatter() {
    formatterOpen.value = false
    formatterLinkOpen.value = false
    linkControlActive.value = false
}

function onFocus() {
    saveCurrentSelection()
    emit('focus')
}

function onBlur() {
    saveCurrentSelection()
    emit('blur')
}

// --- Imperative API exposed to CommentThread / AttachmentModal ---

function focus() {
    editorEl.value?.focus()
    restoreOrEndRange()
}

function clear() {
    setDomFromMarkdown('')
    savedRange = null
    closeFormatter()
    emit('update:modelValue', '')
}

function insertEmoji(emoji: string) {
    if (!editorEl.value || !emoji) return
    editorEl.value.focus()
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range) return
        const selectedLen = range.collapsed ? 0 : extractRangeTextWithEmojis(range).length
        if (props.maxLength > 0 && getTextLength() - selectedLen + emoji.length > props.maxLength) {
            return
        }
        range.deleteContents()
        const textNode = document.createTextNode(emoji)
        range.insertNode(textNode)
        placeCaretAfterNode(textNode)
        syncFromDom()
    })
}

function insertCustomEmoji(asset: { id: string; url?: string | null; alt?: string }) {
    if (!editorEl.value || !isValidCustomEmojiId(asset.id)) return
    editorEl.value.focus()
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range) return
        const alt = asset.alt || '✦'
        const selectedLen = range.collapsed ? 0 : extractRangeTextWithEmojis(range).length
        if (props.maxLength > 0 && getTextLength() - selectedLen + alt.length > props.maxLength) {
            return
        }
        range.deleteContents()
        const chip = createCustomEmojiChip(asset.id, alt)
        range.insertNode(chip)
        placeCaretAfterNode(chip)
        syncFromDom()
    })
}

function backspaceAtSelection() {
    if (!editorEl.value) return
    editorEl.value.focus()
    recordProgrammaticEdit(() => {
        const range = restoreOrEndRange()
        if (!range) return

        if (!range.collapsed) {
            range.deleteContents()
            syncFromDom()
            return
        }

        const {startContainer, startOffset} = range
        if (startContainer.nodeType === 3) {
            const textNode = startContainer as Text
            const val = textNode.nodeValue ?? ''
            if (startOffset > 0) {
                const before = val.slice(0, startOffset)
                const chars = Array.from(before)
                const removed = chars.pop() ?? ''
                const nextBefore = before.slice(0, before.length - removed.length)
                textNode.nodeValue = nextBefore + val.slice(startOffset)
                const r = document.createRange()
                r.setStart(textNode, nextBefore.length)
                r.collapse(true)
                setCaretRange(r)
                syncFromDom()
                return
            }
        }

        // Remove previous sibling node (e.g. custom emoji chip or <br>)
        let target: Node | null = null
        if (startContainer.nodeType === 1 && startOffset > 0) {
            target = startContainer.childNodes[startOffset - 1] ?? null
        } else if (startContainer.previousSibling) {
            target = startContainer.previousSibling
        }

        if (target && isNodeInsideEditor(target)) {
            if (target.nodeType === 3) {
                const t = target as Text
                const v = t.nodeValue ?? ''
                const chars = Array.from(v)
                if (chars.length > 1) {
                    chars.pop()
                    t.nodeValue = chars.join('')
                    const r = document.createRange()
                    r.setStart(t, t.length)
                    r.collapse(true)
                    setCaretRange(r)
                    syncFromDom()
                    return
                }
            }
            const parent = target.parentNode
            if (parent) {
                const idx = Array.from(parent.childNodes).indexOf(target as ChildNode)
                parent.removeChild(target)
                const r = document.createRange()
                r.setStart(parent, Math.max(0, idx))
                r.collapse(true)
                setCaretRange(r)
                syncFromDom()
            }
        }
    })
}

function getTextLength(): number {
    if (!editorEl.value) return 0
    return extractNodesTextWithEmojis(editorEl.value).length
}

defineExpose({
    focus,
    clear,
    insertEmoji,
    insertCustomEmoji,
    backspaceAtSelection,
    getTextLength,
    undo: performUndo,
    redo: performRedo,
})

onMounted(() => {
    if (props.modelValue) {
        setDomFromMarkdown(props.modelValue)
    } else {
        history.reset(captureEditorSnapshot())
    }
    if (typeof document !== 'undefined') {
        document.addEventListener('selectionchange', onSelectionChange)
    }
})

onUnmounted(() => {
    if (typeof document !== 'undefined') {
        document.removeEventListener('selectionchange', onSelectionChange)
    }
    clearTouchFormatterTimer()
    emojiDomManager.destroyAll()
})
</script>

<style lang="sass" scoped>
@use "css/colors" as *
@use "css/global" as *

.tgb-rich-input-wrap
    position: relative
    width: 100%
    border-radius: 12px
    transition: box-shadow 0.16s ease

    &.is-dragging
        box-shadow: 0 0 0 2px $color-text-special

.tgb-rich-placeholder
    position: absolute
    top: 10px
    left: var(--tgb-rich-pad-left, 38px)
    right: var(--tgb-rich-pad-right, 76px)
    color: $color-text-light
    opacity: 0.65
    font-size: 0.94em
    line-height: 1.45
    pointer-events: none
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

.tgb-rich-input
    display: block
    width: 100%
    min-height: 40px
    max-height: 160px
    overflow-y: auto
    box-sizing: border-box
    font-family: $font
    font-size: 0.94em
    line-height: 1.45
    color: $color-text-main
    background: #fdf9f1
    border: 1px solid rgba(112, 81, 42, 0.14)
    border-radius: 12px
    padding: 9px var(--tgb-rich-pad-right, 76px) 9px var(--tgb-rich-pad-left, 38px)
    outline: none
    white-space: pre-wrap
    word-break: break-word
    overflow-wrap: anywhere
    text-align: left
    transition: border-color 0.16s ease, background-color 0.16s ease

    &:focus
        border-color: rgba(112, 81, 42, 0.28)
        background: #fffcf9

    :deep(b), :deep(strong)
        font-weight: 700

    :deep(em), :deep(i:not(.custom-emoji))
        font-style: italic

    :deep(u)
        text-decoration: underline

    :deep(del), :deep(s)
        text-decoration: line-through

    :deep(code)
        font-family: monospace
        background: rgba(112, 81, 42, 0.08)
        padding: 1px 4px
        border-radius: 4px
        font-size: 0.9em

    :deep(pre)
        margin: 4px 0
        padding: 6px 8px
        border-radius: 6px
        background: rgba(112, 81, 42, 0.08)
        overflow-x: auto

        code
            background: none
            padding: 0

    :deep(blockquote)
        margin: 3px 0
        padding: 2px 8px
        border-left: 2.5px solid $color-text-special
        border-radius: 3px 6px 6px 3px
        background: rgba(255, 131, 115, 0.1)

    :deep(a)
        color: $color-text-special
        text-decoration: underline

    :deep(.spoiler)
        position: static
        z-index: auto
        background: rgba(112, 81, 42, 0.18)
        color: $color-text-main
        border-radius: 4px
        padding: 0 3px

        > *, span, del, s, strike, u, b, strong, em, a, img, i, code
            opacity: 1

    :deep(.tgb-editor-ce)
        display: inline-flex
        align-items: center
        justify-content: center
        width: 1.25em
        height: 1.25em
        vertical-align: -0.22em
        margin: 0 1px
        user-select: all

        img, video, .tgb-tgs-host
            width: 100%
            height: 100%
            object-fit: contain
            display: block
            pointer-events: none

        .tgb-tgs-host svg
            width: 100% !important
            height: 100% !important
            display: block
</style>
