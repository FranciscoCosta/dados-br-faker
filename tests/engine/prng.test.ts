import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';

describe('createRng', () => {
  it('produces the same sequence for the same seed (deterministic)', () => {
    const a = createRng(123);
    const b = createRng(123);
    const seqA = [a.next(), a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it('next() returns floats in [0, 1)', () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  describe('int', () => {
    it('returns integers within [min, max] inclusive', () => {
      const rng = createRng(7);
      for (let i = 0; i < 1000; i++) {
        const v = rng.int(5, 10);
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(5);
        expect(v).toBeLessThanOrEqual(10);
      }
    });

    it('can return both boundaries', () => {
      const rng = createRng(99);
      const seen = new Set<number>();
      for (let i = 0; i < 500; i++) seen.add(rng.int(0, 1));
      expect(seen.has(0)).toBe(true);
      expect(seen.has(1)).toBe(true);
    });

    it('returns the single value when min === max', () => {
      const rng = createRng(1);
      expect(rng.int(4, 4)).toBe(4);
    });
  });

  describe('pick', () => {
    it('returns an element of the array', () => {
      const rng = createRng(3);
      const arr = ['a', 'b', 'c'] as const;
      for (let i = 0; i < 100; i++) {
        expect(arr).toContain(rng.pick(arr));
      }
    });

    it('returns the only element of a single-item array', () => {
      const rng = createRng(3);
      expect(rng.pick(['solo'])).toBe('solo');
    });

    it('throws on an empty array', () => {
      const rng = createRng(3);
      expect(() => rng.pick([])).toThrow();
    });
  });

  describe('weightedPick', () => {
    it('never picks an item with weight 0', () => {
      const rng = createRng(11);
      const items = ['never', 'always'] as const;
      const weights = [0, 1];
      for (let i = 0; i < 500; i++) {
        expect(rng.weightedPick(items, weights)).toBe('always');
      }
    });

    it('respects weight proportions approximately', () => {
      const rng = createRng(2024);
      const items = ['x', 'y'] as const;
      const weights = [9, 1];
      let xs = 0;
      const n = 5000;
      for (let i = 0; i < n; i++) {
        if (rng.weightedPick(items, weights) === 'x') xs++;
      }
      // Expect ~90% x; allow generous tolerance.
      expect(xs / n).toBeGreaterThan(0.85);
      expect(xs / n).toBeLessThan(0.95);
    });

    it('throws when lengths differ', () => {
      const rng = createRng(1);
      expect(() => rng.weightedPick(['a', 'b'], [1])).toThrow();
    });
  });

  describe('bool', () => {
    it('defaults to roughly even odds', () => {
      const rng = createRng(555);
      let trues = 0;
      const n = 5000;
      for (let i = 0; i < n; i++) if (rng.bool()) trues++;
      expect(trues / n).toBeGreaterThan(0.45);
      expect(trues / n).toBeLessThan(0.55);
    });

    it('always true at p=1 and always false at p=0', () => {
      const rng = createRng(1);
      for (let i = 0; i < 100; i++) {
        expect(rng.bool(1)).toBe(true);
        expect(rng.bool(0)).toBe(false);
      }
    });
  });
});
