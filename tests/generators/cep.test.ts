import { describe, expect, it } from 'vitest';
import { municipios } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import { gerarCep } from '../../src/generators/cep.js';

describe('gerarCep', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarCep(createRng(1))).toBe(gerarCep(createRng(1)));
  });

  it('returns 8 bare digits by default', () => {
    expect(gerarCep(createRng(1))).toMatch(/^\d{8}$/);
  });

  it('applies the mask when requested', () => {
    expect(gerarCep(createRng(1), { mascara: true })).toMatch(/^\d{5}-\d{3}$/);
  });

  it('always falls within a real municipality CEP range', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 500; i++) {
      const cep = Number(gerarCep(rng));
      const dentro = municipios.some(
        (m) => cep >= Number(m.cepInicio) && cep <= Number(m.cepFim),
      );
      expect(dentro).toBe(true);
    }
  });
});
