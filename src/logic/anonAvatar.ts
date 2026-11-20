export const ANON_RING_PALETTE = [
  '#e05263',
  '#e87a3d',
  '#d99b26',
  '#65a32d',
  '#1ea861',
  '#14a39b',
  '#2094d8',
  '#4668d9',
  '#7b52d6',
  '#b44ac4',
  '#d94c9a',
  '#c85a32',
  '#2c8c99',
  '#5c7cfa',
  '#e0315a',
  '#38a169',
] as const

export interface AnonIdentity {
  avatarUrl: string | null
  ringColor: string
}

/**
 * Normalize legacy "Anonymous" / "Anonymous #<hex>" labels to compact "Anon" forms.
 */
export function normalizeAnonDisplayName(name?: string | null): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed || trimmed === 'Anonymous') {
    return 'Anon'
  }
  if (trimmed.startsWith('Anonymous #')) {
    return `Anon #${trimmed.slice('Anonymous #'.length)}`
  }
  return trimmed
}

function fnv1aMurmur32(input: string, seed: number): number {
  let h = seed >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  return h >>> 0
}

/**
 * Deterministically assign an avatar image and visually distinct ring color for
 * an anonymous user seed (typically normalized "Anon #<hex>") so every message
 * by that user keeps the same avatar and colliding avatars stay distinguishable.
 */
export function pickAnonIdentity(
  seed: string | null | undefined,
  avatars: readonly string[] = [],
): AnonIdentity {
  const normalized = normalizeAnonDisplayName(seed)
  const ringIndex = fnv1aMurmur32(`ring:${normalized}`, 0x9e3779b1) % ANON_RING_PALETTE.length
  const ringColor = ANON_RING_PALETTE[ringIndex]
  if (avatars.length === 0) {
    return {avatarUrl: null, ringColor}
  }
  const avatarIndex = fnv1aMurmur32(`avatar:${normalized}`, 0x811c9dc5) % avatars.length
  return {
    avatarUrl: avatars[avatarIndex] ?? null,
    ringColor,
  }
}
