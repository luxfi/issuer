// Deterministic content hash for the append-only audit trail. FNV-1a (64-bit,
// via BigInt) over the canonical event payload chained with the previous hash —
// a genuine tamper-evident chain: mutating any earlier event breaks every hash
// after it. Zero-dependency and synchronous so the ledger renders inline.
const FNV_OFFSET = 0xcbf29ce484222325n
const FNV_PRIME = 0x100000001b3n
const MASK64 = (1n << 64n) - 1n

export function fnv1a64(input: string): string {
  let h = FNV_OFFSET
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i))
    h = (h * FNV_PRIME) & MASK64
  }
  return h.toString(16).padStart(16, '0')
}

export const GENESIS_HASH = '0'.repeat(16)

// hash_n = FNV1a( hash_{n-1} | canonical(event_n) )
export function chainHash(prevHash: string, payload: string): string {
  return fnv1a64(`${prevHash}|${payload}`)
}
