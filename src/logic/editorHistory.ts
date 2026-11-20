export const MAX_HISTORY = 100
const DEFAULT_COALESCE_WINDOW_MS = 800

const BLOCK_TAGS = new Set(['DIV', 'P', 'BLOCKQUOTE', 'PRE', 'LI'])

export interface EditorHistoryEntry {
  html: string
  selStart: number
  selEnd: number
}

export interface DomPosition {
  node: Node
  offset: number
}

export interface RangeLike {
  startContainer: Node
  startOffset: number
  endContainer: Node
  endOffset: number
}

export interface HistoryPushOptions {
  coalesceKey?: string
  coalesceWindowMs?: number
  now?: number
}

function isCustomEmojiChipNode(node: Node): boolean {
  if (node.nodeType !== 1) return false
  const el = node as HTMLElement
  return Boolean(
    el.classList?.contains('tgb-editor-ce') ||
      el.hasAttribute?.('data-custom-emoji-id')
  )
}

function containsNode(parent: Node, target: Node): boolean {
  if (parent === target) return true
  if (typeof (parent as HTMLElement).contains === 'function') {
    try {
      return (parent as HTMLElement).contains(target)
    } catch {
      // Fallback to recursive traversal for lightweight test mocks
    }
  }
  const children = parent.childNodes
  for (let i = 0; i < children.length; i++) {
    if (containsNode(children[i], target)) return true
  }
  return false
}

/**
 * Snapshot editor HTML while normalizing mounted `.tgb-editor-ce` chips so
 * asynchronous image/video/Lottie DOM updates do not pollute history diffs.
 */
export function snapshotEditorHtml(root: HTMLElement): string {
  if (
    typeof root.cloneNode === 'function' &&
    typeof root.querySelector === 'function' &&
    root.querySelector('.tgb-editor-ce[data-custom-emoji-id]')
  ) {
    const clone = root.cloneNode(true) as HTMLElement
    const chips = Array.from(
      clone.querySelectorAll<HTMLElement>('.tgb-editor-ce[data-custom-emoji-id]')
    )
    for (const chip of chips) {
      chip.classList.remove('init')
      chip.textContent = chip.getAttribute('data-emoji-alt') || '✦'
    }
    return clone.innerHTML
  }
  return root.innerHTML
}

/**
 * Compute the logical length of a DOM subtree inside the rich editor.
 * Text nodes use UTF-16 `.length`; custom emoji chips and `<br>` count as `1`;
 * nested block elements contribute an extra `1` on exit to disambiguate boundaries.
 */
export function getNodeLogicalLength(node: Node, root?: Node): number {
  if (node.nodeType === 3) {
    return (node.nodeValue ?? '').length
  }
  if (node.nodeType !== 1) return 0
  const el = node as HTMLElement
  const tag = (el.tagName || '').toUpperCase()
  if (node !== root && (tag === 'BR' || isCustomEmojiChipNode(el))) {
    return 1
  }
  let len = 0
  const children = el.childNodes
  for (let i = 0; i < children.length; i++) {
    len += getNodeLogicalLength(children[i], root)
  }
  if (node !== root && BLOCK_TAGS.has(tag)) {
    len += 1
  }
  return len
}

function findPointOffset(
  node: Node,
  root: Node,
  targetNode: Node,
  targetOffset: number,
  acc: { value: number }
): number | null {
  if (node === targetNode) {
    if (node.nodeType === 3) {
      const len = (node.nodeValue ?? '').length
      return acc.value + Math.max(0, Math.min(targetOffset, len))
    }
    if (node.nodeType === 1) {
      const el = node as HTMLElement
      const tag = (el.tagName || '').toUpperCase()
      if (node !== root && (tag === 'BR' || isCustomEmojiChipNode(el))) {
        return acc.value + (targetOffset > 0 ? 1 : 0)
      }
      const limit = Math.max(0, Math.min(targetOffset, el.childNodes.length))
      let sum = acc.value
      for (let i = 0; i < limit; i++) {
        sum += getNodeLogicalLength(el.childNodes[i], root)
      }
      return sum
    }
    return acc.value
  }

  if (node.nodeType === 3) {
    acc.value += (node.nodeValue ?? '').length
    return null
  }
  if (node.nodeType !== 1) return null

  const el = node as HTMLElement
  const tag = (el.tagName || '').toUpperCase()
  if (node !== root && (tag === 'BR' || isCustomEmojiChipNode(el))) {
    if (containsNode(el, targetNode)) {
      return acc.value + (targetOffset > 0 ? 1 : 0)
    }
    acc.value += 1
    return null
  }

  for (let i = 0; i < el.childNodes.length; i++) {
    const found = findPointOffset(el.childNodes[i], root, targetNode, targetOffset, acc)
    if (found !== null) return found
  }

  if (node !== root && BLOCK_TAGS.has(tag)) {
    acc.value += 1
  }
  return null
}

/**
 * Convert a DOM Range inside `root` into logical `{ start, end }` offsets.
 */
export function getEditorSelectionOffsets(
  root: Node,
  range: RangeLike
): { start: number; end: number } {
  const start =
    findPointOffset(root, root, range.startContainer, range.startOffset, { value: 0 }) ?? 0
  const end =
    findPointOffset(root, root, range.endContainer, range.endOffset, { value: 0 }) ?? start
  return start <= end ? { start, end } : { start: end, end: start }
}

function resolveInContainer(
  node: Node,
  root: Node,
  targetOffset: number,
  acc: number,
  preferForward: boolean
): DomPosition {
  const children = node.childNodes
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.nodeType === 3) {
      const len = (child.nodeValue ?? '').length
      if (targetOffset < acc + len || (targetOffset === acc + len && !preferForward)) {
        return {
          node: child,
          offset: Math.max(0, Math.min(targetOffset - acc, len)),
        }
      }
      acc += len
      continue
    }
    if (child.nodeType === 1) {
      const el = child as HTMLElement
      const tag = (el.tagName || '').toUpperCase()
      if (tag === 'BR' || isCustomEmojiChipNode(el)) {
        if (targetOffset < acc + 1 || (targetOffset === acc && preferForward)) {
          return { node, offset: i }
        }
        acc += 1
        if (targetOffset === acc && !preferForward) {
          return { node, offset: i + 1 }
        }
        continue
      }

      const childLen = getNodeLogicalLength(el, root)
      if (targetOffset < acc + childLen || (targetOffset === acc + childLen && !preferForward)) {
        if (BLOCK_TAGS.has(tag) && targetOffset === acc + childLen) {
          return { node, offset: i + 1 }
        }
        return resolveInContainer(el, root, targetOffset, acc, preferForward)
      }
      acc += childLen
    }
  }

  return {
    node,
    offset: node.nodeType === 1 ? children.length : 0,
  }
}

/**
 * Resolve a logical character/unit offset back into a concrete DOM `{ node, offset }`
 * inside `root`, clamping cleanly if the offset exceeds document length.
 */
export function resolveEditorDomPosition(
  root: Node,
  targetOffset: number,
  preferForward = false
): DomPosition {
  const clamped = Math.max(0, targetOffset)
  return resolveInContainer(root, root, clamped, 0, preferForward)
}

/**
 * Restore a DOM Range inside `root` from logical `(start, end)` offsets.
 */
export function restoreEditorSelectionOffsets(
  root: Node,
  start: number,
  end: number,
  doc: Document | undefined = typeof document !== 'undefined' ? document : undefined
): Range | null {
  if (!doc || typeof doc.createRange !== 'function') return null
  const lo = Math.max(0, Math.min(start, end))
  const hi = Math.max(0, Math.max(start, end))
  const startPos = resolveEditorDomPosition(root, lo, lo < hi)
  const endPos = resolveEditorDomPosition(root, hi, false)

  const range = doc.createRange()
  range.setStart(startPos.node, startPos.offset)
  range.setEnd(endPos.node, endPos.offset)
  return range
}

/**
 * Bounded undo/redo stack for rich-text editor HTML + logical selection snapshots,
 * supporting adjacent deduplication and optional coalescing of typing bursts.
 */
export class EditorHistoryManager {
  private entries: EditorHistoryEntry[] = []
  private index = -1
  private readonly maxSize: number
  private lastCoalesceKey: string | null = null
  private lastCoalesceTime = 0

  constructor(maxSize = MAX_HISTORY) {
    this.maxSize = Math.max(1, maxSize)
  }

  reset(initialEntry?: EditorHistoryEntry): void {
    this.lastCoalesceKey = null
    this.lastCoalesceTime = 0
    if (initialEntry) {
      this.entries = [{ ...initialEntry }]
      this.index = 0
    } else {
      this.entries = []
      this.index = -1
    }
  }

  current(): EditorHistoryEntry | null {
    if (this.index < 0 || this.index >= this.entries.length) return null
    return { ...this.entries[this.index] }
  }

  canUndo(): boolean {
    return this.index > 0
  }

  canRedo(): boolean {
    return this.index >= 0 && this.index < this.entries.length - 1
  }

  size(): number {
    return this.entries.length
  }

  getIndex(): number {
    return this.index
  }

  push(entry: EditorHistoryEntry, options?: HistoryPushOptions): boolean {
    const next: EditorHistoryEntry = {
      html: entry.html,
      selStart: entry.selStart,
      selEnd: entry.selEnd,
    }
    const cur = this.index >= 0 ? this.entries[this.index] : null

    if (cur && cur.html === next.html) {
      if (cur.selStart === next.selStart && cur.selEnd === next.selEnd) {
        return false
      }
      // Keep selection accurate on the active entry without creating a no-op undo step
      cur.selStart = next.selStart
      cur.selEnd = next.selEnd
      return false
    }

    if (this.index < this.entries.length - 1) {
      this.entries = this.entries.slice(0, this.index + 1)
    }

    const now = options?.now ?? Date.now()
    const windowMs = options?.coalesceWindowMs ?? DEFAULT_COALESCE_WINDOW_MS
    const coalesceKey = options?.coalesceKey ?? null

    if (
      coalesceKey &&
      this.lastCoalesceKey === coalesceKey &&
      this.index > 0 &&
      now - this.lastCoalesceTime <= windowMs
    ) {
      this.entries[this.index] = next
      this.lastCoalesceTime = now
      return true
    }

    this.entries.push(next)
    this.index = this.entries.length - 1
    while (this.entries.length > this.maxSize) {
      this.entries.shift()
      this.index--
    }

    if (coalesceKey) {
      this.lastCoalesceKey = coalesceKey
      this.lastCoalesceTime = now
    } else {
      this.lastCoalesceKey = null
      this.lastCoalesceTime = 0
    }
    return true
  }

  undo(): EditorHistoryEntry | null {
    if (!this.canUndo()) return null
    this.index--
    this.lastCoalesceKey = null
    this.lastCoalesceTime = 0
    return { ...this.entries[this.index] }
  }

  redo(): EditorHistoryEntry | null {
    if (!this.canRedo()) return null
    this.index++
    this.lastCoalesceKey = null
    this.lastCoalesceTime = 0
    return { ...this.entries[this.index] }
  }
}
