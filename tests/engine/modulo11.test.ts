import { describe, expect, it } from 'vitest';
import { dvModulo11, somaPonderada } from '../../src/engine/modulo11.js';

describe('somaPonderada', () => {
  it('multiplies each value by its weight and sums', () => {
    expect(somaPonderada([1, 2, 3], [4, 5, 6])).toBe(1 * 4 + 2 * 5 + 3 * 6);
  });

  it('throws when lengths differ', () => {
    expect(() => somaPonderada([1, 2], [1])).toThrow();
  });
});

describe('dvModulo11', () => {
  it('computes the first CPF check digit of 52998224725', () => {
    // digits 529982247, weights 10..2 → DV 2
    const dv = dvModulo11(
      [5, 2, 9, 9, 8, 2, 2, 4, 7],
      [10, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    expect(dv).toBe(2);
  });

  it('computes the second CPF check digit of 52998224725', () => {
    // digits 5299822472, weights 11..2 → DV 5
    const dv = dvModulo11(
      [5, 2, 9, 9, 8, 2, 2, 4, 7, 2],
      [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    expect(dv).toBe(5);
  });

  it('returns 0 when the remainder is < 2', () => {
    // A sum that is an exact multiple of 11 → remainder 0 → DV 0.
    expect(dvModulo11([0, 0, 11], [1, 1, 1])).toBe(0);
  });
});
