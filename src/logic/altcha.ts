import type {AltchaChallenge, AltchaSolution} from './models'

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

function encodeUtf8(str: string): Uint8Array {
  if (textEncoder) return textEncoder.encode(str)
  const out: number[] = []
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c < 0x80) {
      out.push(c)
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const c2 = str.charCodeAt(++i)
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff))
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      )
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
    }
  }
  return new Uint8Array(out)
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

// Compact pure-JS SHA-256 fallback for non-secure HTTP contexts where crypto.subtle is unavailable
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])

function sha256FallbackHex(input: string): string {
  const bytes = encodeUtf8(input)
  const bitLen = bytes.length * 8
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64
  const buf = new Uint8Array(paddedLen)
  buf.set(bytes)
  buf[bytes.length] = 0x80
  const view = new DataView(buf.buffer)
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false)
  view.setUint32(paddedLen - 4, bitLen >>> 0, false)

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  const w = new Uint32Array(64)

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false)
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7].map(v => v.toString(16).padStart(8, '0')).join('')
}

function normalizeAlgorithm(algorithm: string): string {
  const upper = (algorithm || 'SHA-256').toUpperCase()
  if (upper === 'SHA256') return 'SHA-256'
  if (upper === 'SHA384') return 'SHA-384'
  if (upper === 'SHA512') return 'SHA-512'
  return upper
}

async function digestHex(algorithm: string, input: string): Promise<string> {
  const algo = normalizeAlgorithm(algorithm)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = encodeUtf8(input)
    const hashBuffer = await crypto.subtle.digest(algo, data as unknown as BufferSource)
    return bytesToHex(new Uint8Array(hashBuffer))
  }
  if (algo === 'SHA-256') {
    return sha256FallbackHex(input)
  }
  throw new Error(`Web Crypto API is unavailable for ${algo}`)
}

export function encodeAltchaPayload(solution: AltchaSolution): string {
  const json = JSON.stringify(solution)
  const bytes = encodeUtf8(json)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function yieldToMain(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
}

/**
 * Solve an ALTCHA Proof-of-Work challenge in the browser using Web Crypto SHA-256.
 * Returns the Base64-encoded JSON payload expected by the backend `altcha_payload` field.
 */
export async function solveAltchaChallenge(
  challenge: AltchaChallenge,
  signal?: AbortSignal
): Promise<{ payload: string; solution: AltchaSolution }> {
  const startWall = Date.now()
  let lastYield = nowMs()
  const maxNumber = challenge.maxnumber && challenge.maxnumber > 0 ? challenge.maxnumber : 1_000_000
  const target = challenge.challenge.toLowerCase()
  const algorithm = challenge.algorithm || 'SHA-256'
  const salt = challenge.salt

  for (let n = 0; n <= maxNumber; n++) {
    if (signal?.aborted) {
      throw new DOMException('ALTCHA solving aborted', 'AbortError')
    }
    const hex = await digestHex(algorithm, `${salt}${n}`)
    if (hex === target) {
      const solution: AltchaSolution = {
        algorithm,
        challenge: challenge.challenge,
        number: n,
        salt,
        signature: challenge.signature,
        took: Math.max(1, Date.now() - startWall),
      }
      return {
        payload: encodeAltchaPayload(solution),
        solution,
      }
    }
    if (nowMs() - lastYield >= 12) {
      await yieldToMain()
      lastYield = nowMs()
    }
  }

  throw new Error('Failed to solve ALTCHA challenge within maxnumber')
}
