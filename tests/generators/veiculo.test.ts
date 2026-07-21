import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import {
  gerarPlaca,
  gerarRenavam,
  gerarVeiculo,
  validarRenavam,
} from '../../src/generators/veiculo.js';

describe('validarRenavam', () => {
  it('accepts a known-valid RENAVAM (with and without separators)', () => {
    expect(validarRenavam('54088307874')).toBe(true);
    expect(validarRenavam('5408830787-4')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(validarRenavam('54088307875')).toBe(false);
  });

  it('rejects repeated-digit sequences and over-length input', () => {
    expect(validarRenavam('00000000000')).toBe(false);
    expect(validarRenavam('123456789012')).toBe(false);
  });
});

describe('gerarRenavam', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarRenavam(createRng(1))).toBe(gerarRenavam(createRng(1)));
  });

  it('property: 1000 generated RENAVAMs are all valid 11-digit strings', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      const r = gerarRenavam(rng);
      expect(r).toMatch(/^\d{11}$/);
      expect(validarRenavam(r)).toBe(true);
    }
  });
});

describe('gerarPlaca', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarPlaca(createRng(1))).toBe(gerarPlaca(createRng(1)));
  });

  it('generates a Mercosul plate by default (LLLNLNN)', () => {
    expect(gerarPlaca(createRng(1))).toMatch(/^[A-Z]{3}\d[A-Z]\d{2}$/);
  });

  it('generates the old format when requested (LLL-NNNN)', () => {
    expect(gerarPlaca(createRng(1), { formato: 'antiga' })).toMatch(
      /^[A-Z]{3}-\d{4}$/,
    );
  });
});

describe('gerarVeiculo', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarVeiculo(createRng(1))).toEqual(gerarVeiculo(createRng(1)));
  });

  it('produces a coherent vehicle with a valid RENAVAM', () => {
    const v = gerarVeiculo(createRng(5));
    expect(v.marca.length).toBeGreaterThan(0);
    expect(v.modelo.length).toBeGreaterThan(0);
    expect(v.cor.length).toBeGreaterThan(0);
    expect(v.ano).toBeGreaterThanOrEqual(1990);
    expect(v.ano).toBeLessThanOrEqual(new Date().getFullYear());
    expect(validarRenavam(v.renavam)).toBe(true);
    expect(v.placa).toMatch(/^[A-Z]{3}\d[A-Z]\d{2}$/);
  });
});
