import {MountedTgsHandle, mountTgsAnimation} from './tgs'
import {isSafeMediaUrl} from './url'

export interface CustomEmojiElementState {
  element: HTMLElement
  sig: string
  gen: number
  controller: AbortController
  handle: MountedTgsHandle | null
}

/**
 * Expand an extensionless custom emoji asset path into ordered candidate URLs,
 * or keep an already-extensioned URL as a single candidate.
 */
export function buildCustomEmojiCandidates(
  primarySrc?: string | null,
  deferExtensionlessProbe = false
): string[] {
  const primary = (primarySrc ?? '').trim()
  if (!primary || !isSafeMediaUrl(primary)) return []
  const clean = primary.split('?')[0].split('#')[0]
  const fileName = clean.split('/').pop() || ''
  if (!fileName.includes('.')) {
    if (deferExtensionlessProbe) return []
    return [
      `${primary}.webp`,
      `${primary}.webm`,
      `${primary}.apng`,
      `${primary}.tgs`,
      `${primary}.png`,
      `${primary}.gif`,
    ]
  }
  return [primary]
}

export interface MountAllCustomEmojiOptions {
  selector?: string
  resolveCandidates: (el: HTMLElement) => string[]
  getFallbackAlt?: (el: HTMLElement) => string
}

export interface CustomEmojiDomManager {
  mountElement: (el: HTMLElement, candidates: string[], fallbackAlt?: string) => void
  mountAll: (container: HTMLElement | null | undefined, options: MountAllCustomEmojiOptions) => void
  pruneDetached: (container?: HTMLElement | null) => void
  destroyAll: () => void
}

/**
 * Per-container custom emoji DOM & Lottie lifecycle manager.
 * Tracks per-element generation + AbortController so asynchronous URL upgrades
 * (e.g. when `/emojis/custom` finishes loading) cancel stale in-flight mounts cleanly.
 */
export function createCustomEmojiDomManager(): CustomEmojiDomManager {
  const elementStates = new WeakMap<HTMLElement, CustomEmojiElementState>()
  const activeRecords = new Set<CustomEmojiElementState>()

  function disposeRecord(rec: CustomEmojiElementState): void {
    rec.controller.abort()
    rec.handle?.destroy()
    rec.handle = null
    activeRecords.delete(rec)
  }

  function mountElement(el: HTMLElement, candidates: string[], fallbackAlt = '✦'): void {
    if (typeof document === 'undefined') return
    const sig = candidates.join('|')
    const prev = elementStates.get(el)
    if (prev && prev.sig === sig) {
      return
    }
    const nextGen = (prev?.gen ?? 0) + 1
    if (prev) {
      disposeRecord(prev)
    }

    const controller = new AbortController()
    const rec: CustomEmojiElementState = {
      element: el,
      sig,
      gen: nextGen,
      controller,
      handle: null,
    }
    elementStates.set(el, rec)
    activeRecords.add(rec)
    el.classList.add('init')

    let attemptIdx = 0
    const isStale = () => controller.signal.aborted || elementStates.get(el)?.gen !== nextGen

    const tryMount = () => {
      if (isStale()) return
      const src = candidates[attemptIdx]
      el.textContent = ''
      if (!src) {
        el.textContent = fallbackAlt || '✦'
        return
      }

      const cleanSrc = src.toLowerCase().split('?')[0].split('#')[0]
      if (cleanSrc.endsWith('.tgs')) {
        const host = document.createElement('span')
        host.className = 'tgb-tgs-host'
        el.appendChild(host)
        void mountTgsAnimation(host, src, controller.signal)
          .then(handle => {
            if (isStale()) {
              handle.destroy()
            } else {
              rec.handle = handle
            }
          })
          .catch(() => {
            if (!isStale()) {
              attemptIdx++
              tryMount()
            }
          })
      } else if (cleanSrc.endsWith('.webm')) {
        const video = document.createElement('video')
        video.src = src
        video.preload = 'auto'
        video.muted = true
        video.autoplay = true
        video.loop = true
        video.playsInline = true
        video.setAttribute('disablepictureinpicture', '')
        video.onerror = () => {
          if (!isStale()) {
            attemptIdx++
            tryMount()
          }
        }
        el.appendChild(video)
      } else {
        const img = document.createElement('img')
        img.src = src
        img.alt = fallbackAlt || ''
        img.loading = 'lazy'
        img.draggable = false
        img.onerror = () => {
          if (!isStale()) {
            attemptIdx++
            tryMount()
          }
        }
        el.appendChild(img)
      }
    }

    tryMount()
  }

  function pruneDetached(container?: HTMLElement | null): void {
    for (const rec of Array.from(activeRecords)) {
      const stillAttached = container
        ? container.contains(rec.element)
        : rec.element.isConnected
      if (!stillAttached) {
        disposeRecord(rec)
        elementStates.delete(rec.element)
      }
    }
  }

  function mountAll(
    container: HTMLElement | null | undefined,
    options: MountAllCustomEmojiOptions
  ): void {
    if (!container || typeof document === 'undefined') return
    pruneDetached(container)
    const nodes = container.querySelectorAll<HTMLElement>(options.selector ?? 'i.custom-emoji')
    nodes.forEach(el => {
      const candidates = options.resolveCandidates(el)
      if (!candidates.length) return
      const alt = options.getFallbackAlt?.(el) ?? (el.textContent?.trim() || '✦')
      mountElement(el, candidates, alt)
    })
  }

  function destroyAll(): void {
    for (const rec of Array.from(activeRecords)) {
      disposeRecord(rec)
      elementStates.delete(rec.element)
    }
  }

  return {
    mountElement,
    mountAll,
    pruneDetached,
    destroyAll,
  }
}
