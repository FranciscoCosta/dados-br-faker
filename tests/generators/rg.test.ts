import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import { digitoVerificadorRg, gerarRg } from '../../src/generators/rg.js';

describe('digitoVerificadorRg (SP mod-11)', () => {
  it('computes a standard check digit', () => {
    expect(digitoVerificadorRg('24678131')).toBe('2');
  });

  it("maps remainder 0 to '0'", () => {
    expect(digitoVerificadorRg('11111111')).toBe('0');
  });

  it("maps remainder 1 to 'X'", () => {
    expect(digitoVerificadorRg('60000000')).toBe('X');
  });
});

describe('gerarRg', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarRg(createRng(1))).toBe(gerarRg(createRng(1)));
  });

  it('returns 8 digits + check digit unmasked by default', () => {
    expect(gerarRg(createRng(1))).toMatch(/^\d{8}[\dX]$/);
  });

  it('applies the SP mask when requested', () => {
    expect(gerarRg(createRng(1), { mascara: true })).toMatch(
      /^\d{2}\.\d{3}\.\d{3}-[\dX]$/,
    );
  });

  it('property: generated RGs carry a self-consistent check digit', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      const rg = gerarRg(rng);
      const base = rg.slice(0, 8);
      const dv = rg.slice(8);
      expect(dv).toBe(digitoVerificadorRg(base));
    }
  });

  it("exercises the 'X' check digit at least once", () => {
    const rng = createRng(2024);
    let sawX = false;
    for (let i = 0; i < 1000; i++) {
      if (gerarRg(rng).endsWith('X')) {
        sawX = true;
        break;
      }
    }
    expect(sawX).toBe(true);
  });
});
