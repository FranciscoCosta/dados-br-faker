import { describe, expect, it } from 'vitest';
import { municipios } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import {
  gerarCepNaFaixa,
  selecionarMunicipio,
} from '../../src/generators/municipio.js';

describe('selecionarMunicipio', () => {
  it('is deterministic for a given seed', () => {
    expect(selecionarMunicipio(createRng(1), {}).nome).toBe(
      selecionarMunicipio(createRng(1), {}).nome,
    );
  });

  it('returns a municipality from the dataset', () => {
    const nomes = new Set(municipios.map((m) => m.nome));
    expect(nomes.has(selecionarMunicipio(createRng(2), {}).nome)).toBe(true);
  });

  it('respects a UF filter', () => {
    const rng = createRng(3);
    for (let i = 0; i < 50; i++) {
      expect(selecionarMunicipio(rng, { uf: 'PR' }).uf).toBe('PR');
    }
  });

  it('respects a região filter', () => {
    const rng = createRng(4);
    for (let i = 0; i < 50; i++) {
      expect(selecionarMunicipio(rng, { regiao: 'Sul' }).regiao).toBe('Sul');
    }
  });

  it('respects a city filter (case/accent-insensitive)', () => {
    expect(selecionarMunicipio(createRng(5), { cidade: 'curitiba' }).nome).toBe(
      'Curitiba',
    );
  });

  it('throws when no municipality matches the filter', () => {
    expect(() =>
      selecionarMunicipio(createRng(6), { cidade: 'Atlântida' }),
    ).toThrow();
  });
});

describe('gerarCepNaFaixa', () => {
  it('returns an 8-digit CEP within the inclusive range', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      const cep = gerarCepNaFaixa(rng, '80000000', '82999999');
      expect(cep).toMatch(/^\d{8}$/);
      expect(Number(cep)).toBeGreaterThanOrEqual(80000000);
      expect(Number(cep)).toBeLessThanOrEqual(82999999);
    }
  });
});
