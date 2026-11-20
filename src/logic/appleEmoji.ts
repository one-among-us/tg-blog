import emojiRegex from 'emoji-regex'
import type {ComputedRef, InjectionKey} from 'vue'
import {computed, inject} from 'vue'
import {isSafeMediaUrl} from './url'

export const DEFAULT_APPLE_EMOJI_BASE_URL =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@16.0.0/img/apple/64/'

export const tgbAppleEmojiKey: InjectionKey<ComputedRef<string>> = Symbol('tgb-apple-emoji-base-url')

const defaultAppleEmojiRef = computed(() => DEFAULT_APPLE_EMOJI_BASE_URL)

export function useAppleEmojiBaseUrl(): ComputedRef<string> {
  return inject(tgbAppleEmojiKey, defaultAppleEmojiRef)
}

/**
 * Override table for non-qualified Telegram emojis and known emoji-datasource-apple filenames.
 */
export const APPLE_EMOJI_OVERRIDES: Record<string, string> = {
  '\u2764': '2764-fe0f.png', // ❤
  '\u2764\ufe0f': '2764-fe0f.png', // ❤️
  '\u2764\u200d\ud83d\udd25': '2764-fe0f-200d-1f525.png', // ❤‍🔥
  '\u2764\ufe0f\u200d\ud83d\udd25': '2764-fe0f-200d-1f525.png', // ❤️‍🔥
  '\u2764\u200d\ud83e\ude79': '2764-fe0f-200d-1fa79.png', // ❤‍🩹
  '\u2764\ufe0f\u200d\ud83e\ude79': '2764-fe0f-200d-1fa79.png', // ❤️‍🩹
  '\ud83d\udd4a': '1f54a-fe0f.png', // 🕊
  '\u270d': '270d-fe0f.png', // ✍
  '\u2603': '2603-fe0f.png', // ☃
  '\u270c': '270c-fe0f.png', // ✌
  '\u2600': '2600-fe0f.png', // ☀
  '\u2601': '2601-fe0f.png', // ☁
  '\u2614': '2614.png', // ☔
  '\u2728': '2728.png', // ✨
  '\u26a1': '26a1.png', // ⚡
  '\u203c': '203c-fe0f.png', // ‼
  '\u2049': '2049-fe0f.png', // ⁉
  '\u2139': '2139-fe0f.png', // ℹ
  '\u2665': '2665-fe0f.png', // ♥
  '\u263a': '263a-fe0f.png', // ☺
  '\u2744': '2744-fe0f.png', // ❄
  '\u2b50': '2b50.png', // ⭐
  '\u2757': '2757.png', // ❗
  '\u2753': '2753.png', // ❓
}

function emojiCodepointParts(emoji: string): string[] {
  const parts: string[] = []
  for (const ch of Array.from(emoji)) {
    const cp = ch.codePointAt(0)
    if (cp !== undefined) {
      parts.push(cp.toString(16).padStart(4, '0'))
    }
  }
  return parts
}

/**
 * Compute ordered candidate PNG URLs for a standard Unicode emoji from `emoji-datasource-apple`.
 * Returns an empty array if `baseUrl` is empty (Apple emoji replacement disabled).
 */
export function getAppleEmojiCandidates(emoji: string, baseUrl: string): string[] {
  const trimmedBase = (baseUrl || '').trim()
  if (!emoji || !trimmedBase || !isSafeMediaUrl(trimmedBase)) return []
  const base = trimmedBase.endsWith('/') ? trimmedBase : `${trimmedBase}/`

  const fileNames: string[] = []
  const pushUnique = (name: string) => {
    if (name && !fileNames.includes(name)) {
      fileNames.push(name)
    }
  }

  const override = APPLE_EMOJI_OVERRIDES[emoji]
  if (override) {
    pushUnique(override)
  }

  const parts = emojiCodepointParts(emoji)
  if (parts.length > 0) {
    const rawName = `${parts.join('-')}.png`
    pushUnique(rawName)

    if (!parts.includes('fe0f')) {
      const withFe0f = [parts[0], 'fe0f', ...parts.slice(1)].join('-') + '.png'
      pushUnique(withFe0f)
    } else {
      const withoutFe0f = parts.filter(p => p !== 'fe0f').join('-')
      if (withoutFe0f) {
        pushUnique(`${withoutFe0f}.png`)
      }
    }
  }

  return fileNames.map(name => `${base}${name}`)
}

const SKIP_TAGS = new Set(['PRE', 'CODE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION'])

function shouldSkipTextNode(node: Text): boolean {
  let el: HTMLElement | null = node.parentElement
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true
    if (
      el.classList.contains('custom-emoji') ||
      el.classList.contains('tgb-apple-emoji') ||
      el.classList.contains('tgb-custom-emoji') ||
      el.classList.contains('katex')
    ) {
      return true
    }
    el = el.parentElement
  }
  return false
}

/**
 * Walk text nodes inside `rootEl` (skipping code/pre/style/script/custom-emoji/apple-emoji)
 * and replace matched Unicode emojis with crisp Apple emoji `<img>` elements with graceful fallback.
 */
export function replaceTextEmojisWithApple(rootEl: HTMLElement | null | undefined, baseUrl: string): void {
  if (!rootEl || !baseUrl || typeof document === 'undefined' || typeof NodeFilter === 'undefined') {
    return
  }

  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT)
  const matchingNodes: Text[] = []
  let current: Node | null
  while ((current = walker.nextNode()) !== null) {
    const textNode = current as Text
    const value = textNode.nodeValue
    if (!value || !value.trim()) continue
    if (shouldSkipTextNode(textNode)) continue
    const testRe = emojiRegex()
    if (testRe.test(value)) {
      matchingNodes.push(textNode)
    }
  }

  for (const textNode of matchingNodes) {
    const parent = textNode.parentNode
    if (!parent) continue
    const value = textNode.nodeValue || ''
    const re = emojiRegex()
    const frag = document.createDocumentFragment()
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = re.exec(value)) !== null) {
      const emoji = match[0]
      const start = match.index
      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(value.slice(lastIndex, start)))
      }

      const candidates = getAppleEmojiCandidates(emoji, baseUrl)
      if (!candidates.length) {
        frag.appendChild(document.createTextNode(emoji))
      } else {
        const img = document.createElement('img')
        img.className = 'tgb-apple-emoji'
        img.draggable = false
        img.loading = 'lazy'
        img.alt = emoji
        let attempt = 0
        img.src = candidates[0]
        img.onerror = () => {
          attempt++
          if (attempt < candidates.length) {
            img.src = candidates[attempt]
          } else {
            img.replaceWith(document.createTextNode(emoji))
          }
        }
        frag.appendChild(img)
      }

      lastIndex = start + emoji.length
    }

    if (lastIndex < value.length) {
      frag.appendChild(document.createTextNode(value.slice(lastIndex)))
    }

    parent.replaceChild(frag, textNode)
  }
}
