/**
 * Deterministic pseudo-random number generator and sampling primitives.
 *
 * The generator is `mulberry32`: a tiny, fast, dependency-free 32-bit PRNG.
 * Its statistical quality is more than sufficient for fake-data generation,
 * and — crucially — it is fully reproducible from a numeric seed, which is
 * what powers `createFaker({ seed })`.
 */

/** Sampling surface exposed to generators. Backed by a single seeded stream. */
export interface Rng {
  /** Next float in the half-open interval [0, 1). */
  next(): number;
  /** Integer in the inclusive range [min, max]. */
  int(min: number, max: number): number;
  /** Boolean that is `true` with probability `p` (default 0.5). */
  bool(p?: number): boolean;
  /** Uniformly pick one element of a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** Pick one element with probability proportional to its weight. */
  weightedPick<T>(items: readonly T[], weights: readonly number[]): T;
}

/** Create a `mulberry32` step function seeded by `seed`. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build the sampling surface on top of any `next(): number` source. */
function buildRng(next: () => number): Rng {
  const int = (min: number, max: number): number => {
    return min + Math.floor(next() * (max - min + 1));
  };

  const bool = (p = 0.5): boolean => next() < p;

  const pick = <T>(arr: readonly T[]): T => {
    if (arr.length === 0) {
      throw new Error('pick: cannot pick from an empty array');
    }
    return arr[int(0, arr.length - 1)] as T;
  };

  const weightedPick = <T>(
    items: readonly T[],
    weights: readonly number[],
  ): T => {
    if (items.length !== weights.length) {
      throw new Error(
        'weightedPick: items and weights must be the same length',
      );
    }
    if (items.length === 0) {
      throw new Error('weightedPick: cannot pick from an empty array');
    }
    let total = 0;
    for (const w of weights) total += w;
    let threshold = next() * total;
    for (let i = 0; i < items.length; i++) {
      threshold -= weights[i] as number;
      if (threshold < 0) return items[i] as T;
    }
    return items[items.length - 1] as T;
  };

  return { next, int, bool, pick, weightedPick };
}

/** Build a deterministic {@link Rng} from a numeric seed. */
export function createRng(seed: number): Rng {
  return buildRng(mulberry32(seed));
}

/**
 * Build a non-deterministic {@link Rng} backed by `Math.random`. Used by the
 * standalone tree-shakeable generators, which are always random by design.
 */
export function createRandomRng(): Rng {
  return buildRng(Math.random);
}
