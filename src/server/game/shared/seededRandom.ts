// Deterministic pseudo-random selection keyed by an arbitrary string (typically
// `userId:someDateISO`). Same key always produces the same result -- used anywhere
// generation must be idempotent/reproducible without persisting anything up front
// (daily quests, weekly boss day/name selection).

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// mulberry32 -- small, fast, seedable PRNG.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(key: string): () => number {
  return mulberry32(hashStringToInt(key));
}

// Deterministically shuffles [0, poolSize) and returns the first `count` indices.
export function pickDeterministicIndices(key: string, poolSize: number, count: number): number[] {
  if (poolSize <= 0) return [];
  const rand = createRng(key);
  const indices = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(count, poolSize));
}

// Deterministically picks a single index in [0, poolSize).
export function pickDeterministicIndex(key: string, poolSize: number): number {
  return pickDeterministicIndices(key, poolSize, 1)[0] ?? 0;
}

// Deterministically picks an index in [0, weights.length) with probability
// proportional to each weight (weights need not sum to 1 -- normalized internally).
// Used for rarity rolls, where a uniform pick over the pool wouldn't respect drop odds.
export function pickWeightedIndex(key: string, weights: number[]): number {
  if (weights.length === 0) return 0;
  const total = weights.reduce((sum, w) => sum + w, 0);
  const roll = createRng(key)() * total;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) return i;
  }
  return weights.length - 1; // floating-point edge case at the very top of the range
}
