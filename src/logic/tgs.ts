import {isSafeMediaUrl} from './url'

/**
 * Lightweight on-demand `.tgs` (gzipped Telegram Lottie sticker/custom-emoji) renderer.
 * Dynamically imports `lottie-web/build/player/lottie_light` ONLY when a `.tgs` asset is rendered,
 * so pages without `.tgs` assets incur zero Lottie runtime overhead.
 */

export const MAX_TGS_COMPRESSED_BYTES = 512 * 1024 // 512 KiB
export const MAX_TGS_DECOMPRESSED_BYTES = 2 * 1024 * 1024 // 2 MiB
const MAX_TGS_CACHE = 64

const tgsJsonCache = new Map<string, unknown>()
const tgsInFlight = new Map<string, Promise<unknown>>()

export function clearTgsCacheForTests(): void {
  tgsJsonCache.clear()
  tgsInFlight.clear()
}

function isGzipped(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
}

export async function decompressGzipBytesBounded(
  bytes: Uint8Array,
  maxBytes: number = MAX_TGS_DECOMPRESSED_BYTES
): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream is not supported in this browser')
  }
  const stream = new Blob([bytes as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))

  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const {done, value} = await reader.read()
      if (done) break
      if (value) {
        totalBytes += value.byteLength
        if (totalBytes > maxBytes) {
          await reader.cancel().catch(() => {})
          throw new Error(`Decompressed .tgs exceeds ${maxBytes} byte limit`)
        }
        chunks.push(value)
      }
    }
  } finally {
    reader.releaseLock()
  }

  const merged = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(merged)
}

/**
 * Fetch, validate size bounds, decompress (capped at 2 MiB), and parse a `.tgs` Lottie JSON.
 * Deduplicates concurrent fetches for the same URL without coupling the shared request to a
 * single caller's `AbortSignal`.
 */
export async function fetchTgsAnimationData(url: string): Promise<unknown> {
  if (!isSafeMediaUrl(url)) {
    throw new Error('Rejected unsafe .tgs URL')
  }

  const cached = tgsJsonCache.get(url)
  if (cached !== undefined) return cached

  const existing = tgsInFlight.get(url)
  if (existing) return existing

  const promise = (async () => {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch .tgs asset (${res.status})`)
    }
    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_TGS_COMPRESSED_BYTES) {
      throw new Error(`Compressed .tgs exceeds ${MAX_TGS_COMPRESSED_BYTES} byte limit`)
    }

    const bytes = new Uint8Array(buf)
    let jsonText: string
    if (isGzipped(bytes)) {
      jsonText = await decompressGzipBytesBounded(bytes, MAX_TGS_DECOMPRESSED_BYTES)
    } else {
      if (bytes.byteLength > MAX_TGS_DECOMPRESSED_BYTES) {
        throw new Error(`Uncompressed .tgs exceeds ${MAX_TGS_DECOMPRESSED_BYTES} byte limit`)
      }
      jsonText = new TextDecoder().decode(bytes)
    }

    const parsed = JSON.parse(jsonText)

    if (tgsJsonCache.size >= MAX_TGS_CACHE) {
      const oldestKey = tgsJsonCache.keys().next().value
      if (oldestKey !== undefined) tgsJsonCache.delete(oldestKey)
    }
    tgsJsonCache.set(url, parsed)
    return parsed
  })()

  tgsInFlight.set(url, promise)
  try {
    return await promise
  } finally {
    tgsInFlight.delete(url)
  }
}

export interface MountedTgsHandle {
  destroy: () => void
}

/**
 * Fetch, decompress, and mount an animated `.tgs` Lottie asset inside `container`.
 */
export async function mountTgsAnimation(
  container: HTMLElement,
  url: string,
  signal?: AbortSignal
): Promise<MountedTgsHandle> {
  if (signal?.aborted) {
    return {destroy: () => {}}
  }

  const [animationData, lottieMod] = await Promise.all([
    fetchTgsAnimationData(url),
    import('lottie-web/build/player/lottie_light'),
  ])

  if (signal?.aborted) {
    return {destroy: () => {}}
  }

  const lottie = (lottieMod as any).default ?? lottieMod
  container.textContent = ''
  const anim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: structuredClone ? structuredClone(animationData) : JSON.parse(JSON.stringify(animationData)),
  })

  return {
    destroy: () => {
      try {
        anim.destroy()
      } catch {
        // Ignore cleanup errors
      }
    },
  }
}
