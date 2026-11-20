export interface FloatingPoint {
  left: number
  top: number
}

export interface AnchorRectLike {
  left: number
  top: number
  bottom: number
  width: number
}

export interface FloatingPlacementOptions {
  desiredLeft: number
  aboveTop: number
  belowTop: number
  width: number
  height: number
  viewportWidth: number
  viewportHeight: number
  margin?: number
}

/**
 * Clamp a floating popup to the viewport, preferring placement above the anchor
 * and flipping below when there is insufficient vertical room above.
 */
export function clampFloatingPlacement(options: FloatingPlacementOptions): FloatingPoint {
  const margin = options.margin ?? 10
  const maxLeft = options.viewportWidth - options.width - margin
  const left = Math.max(margin, Math.min(options.desiredLeft, maxLeft))

  const maxTop = options.viewportHeight - options.height - margin
  let top = options.aboveTop
  if (top < margin) {
    top = Math.min(options.belowTop, maxTop)
  }
  top = Math.max(margin, Math.min(top, maxTop))

  return {
    left: Math.round(left),
    top: Math.round(top),
  }
}

/**
 * Center a floating popup inside the viewport with margin clamping.
 */
export function clampCenterPlacement(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  margin = 10
): FloatingPoint {
  return {
    left: Math.round(Math.max(margin, (viewportWidth - width) / 2)),
    top: Math.round(Math.max(margin, (viewportHeight - height) / 2)),
  }
}

/**
 * Return true if a DOM event target resides inside `container` (or is `container` itself).
 */
export function isEventInsideElement(
  event: Event | null | undefined,
  container: HTMLElement | null | undefined
): boolean {
  if (!event || !container) return false
  const target = event.target as Node | null | undefined
  if (!target) return false
  if (target === container) return true
  if (typeof container.contains === 'function' && typeof (target as { nodeType?: unknown }).nodeType === 'number') {
    return container.contains(target)
  }
  return false
}

export type FloatingPositionMode = 'fixed' | 'absolute'

export interface FloatingPositionControllerOptions {
  getFloatingEl: () => HTMLElement | null | undefined
  getAnchorEl?: () => HTMLElement | null | undefined
  positionMode?: FloatingPositionMode
  computeBasePosition: (scrollDelta: { dx: number; dy: number }) => FloatingPoint
  onPositionChange: (pos: FloatingPoint) => void
}

export interface FloatingPositionController {
  updateBase: () => void
  attach: () => void
  detach: () => void
}

/**
 * Track viewport-clamped initial placement and scroll following.
 * - `'absolute'` (default): stores document coordinates on `<body>` so window scroll
 *   is handled natively by the browser compositor with zero JS lag, only emitting
 *   updates when an inner scrollable container shifts `anchorEl` relative to the document.
 * - `'fixed'`: stores viewport coordinates and tracks window/ancestor scroll deltas in JS.
 */
export function createFloatingPositionController(
  options: FloatingPositionControllerOptions
): FloatingPositionController {
  const mode: FloatingPositionMode = options.positionMode ?? 'absolute'
  let basePos: FloatingPoint = { left: 0, top: 0 }
  let baseAnchorRect: { left: number; top: number } | null = null
  let baseAnchorDoc: { left: number; top: number } | null = null
  let baseScroll = { x: 0, y: 0 }
  let attached = false

  function getConnectedAnchorEl(): HTMLElement | null {
    const el = options.getAnchorEl?.() ?? null
    return el && el.isConnected ? el : null
  }

  function getViewportScrollDelta(): { dx: number; dy: number } {
    const anchorEl = getConnectedAnchorEl()
    if (anchorEl && baseAnchorRect) {
      const cur = anchorEl.getBoundingClientRect()
      return {
        dx: cur.left - baseAnchorRect.left,
        dy: cur.top - baseAnchorRect.top,
      }
    }
    if (typeof window !== 'undefined') {
      return {
        dx: -(window.scrollX - baseScroll.x),
        dy: -(window.scrollY - baseScroll.y),
      }
    }
    return { dx: 0, dy: 0 }
  }

  function captureBase(delta = { dx: 0, dy: 0 }): void {
    if (typeof window === 'undefined') return
    const viewportBase = options.computeBasePosition(delta)
    const sx = window.scrollX
    const sy = window.scrollY
    basePos =
      mode === 'absolute'
        ? { left: viewportBase.left + sx, top: viewportBase.top + sy }
        : { left: viewportBase.left, top: viewportBase.top }

    const anchorEl = getConnectedAnchorEl()
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      baseAnchorRect = { left: rect.left, top: rect.top }
      baseAnchorDoc = { left: rect.left + sx, top: rect.top + sy }
    } else {
      baseAnchorRect = null
      baseAnchorDoc = null
    }
    baseScroll = { x: sx, y: sy }
    options.onPositionChange({
      left: Math.round(basePos.left),
      top: Math.round(basePos.top),
    })
  }

  function updateBase(): void {
    captureBase({ dx: 0, dy: 0 })
  }

  function onResize(): void {
    const delta = getViewportScrollDelta()
    captureBase(delta)
  }

  function onScroll(event: Event): void {
    if (isEventInsideElement(event, options.getFloatingEl())) return

    if (mode === 'absolute') {
      const anchorEl = getConnectedAnchorEl()
      if (!anchorEl || !baseAnchorDoc || typeof window === 'undefined') return
      const rect = anchorEl.getBoundingClientRect()
      const dx = rect.left + window.scrollX - baseAnchorDoc.left
      const dy = rect.top + window.scrollY - baseAnchorDoc.top
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return
      options.onPositionChange({
        left: Math.round(basePos.left + dx),
        top: Math.round(basePos.top + dy),
      })
      return
    }

    const { dx, dy } = getViewportScrollDelta()
    options.onPositionChange({
      left: Math.round(basePos.left + dx),
      top: Math.round(basePos.top + dy),
    })
  }

  function attach(): void {
    if (attached || typeof window === 'undefined') return
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    attached = true
  }

  function detach(): void {
    if (!attached || typeof window === 'undefined') return
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', onScroll, true)
    attached = false
  }

  return {
    updateBase,
    attach,
    detach,
  }
}
