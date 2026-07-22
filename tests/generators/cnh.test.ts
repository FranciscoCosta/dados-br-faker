import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import { gerarCnh, validarCnh } from '../../src/generators/cnh.js';

describe('validarCnh', () => {
  it('accepts known-valid CNH numbers (verified against validation-br)', () => {
    expect(validarCnh('69044271146')).toBe(true);
    expect(validarCnh('62472927637')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(validarCnh('46190476839')).toBe(false);
  });

  it('rejects repeated-digit sequences and wrong length', () => {
    expect(validarCnh('11111111111')).toBe(false);
    expect(validarCnh('123')).toBe(false);
  });
});

describe('gerarCnh', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarCnh(createRng(1))).toBe(gerarCnh(createRng(1)));
  });

  it('returns 11 digits', () => {
    expect(gerarCnh(createRng(1))).toMatch(/^\d{11}$/);
  });

  it('property: 1000 generated CNHs are all valid', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      expect(validarCnh(gerarCnh(rng))).toBe(true);
    }
  });
});
