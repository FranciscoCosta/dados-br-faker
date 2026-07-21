import { describe, expect, it } from 'vitest';
import { nomesFemininos, nomesMasculinos } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import {
  escolherGenero,
  gerarNome,
  primeiroNome,
} from '../../src/generators/nome.js';

const MASC = new Set(nomesMasculinos.map((n) => n.nome));
const FEM = new Set(nomesFemininos.map((n) => n.nome));

describe('escolherGenero', () => {
  it('returns M or F', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      expect(['M', 'F']).toContain(escolherGenero(rng));
    }
  });
});

describe('primeiroNome', () => {
  it('draws from the dataset matching the requested gender', () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      expect(MASC.has(primeiroNome(rng, 'M'))).toBe(true);
      expect(FEM.has(primeiroNome(rng, 'F'))).toBe(true);
    }
  });
});

describe('gerarNome', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarNome(createRng(1))).toBe(gerarNome(createRng(1)));
  });

  it('includes a first name and at least one surname by default', () => {
    const nome = gerarNome(createRng(5));
    expect(nome.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('returns only a known first name when sobrenome is false', () => {
    const rng = createRng(7);
    for (let i = 0; i < 50; i++) {
      const nome = gerarNome(rng, { sobrenome: false });
      expect(MASC.has(nome) || FEM.has(nome)).toBe(true);
    }
  });

  it('respects the gender filter', () => {
    const rng = createRng(9);
    for (let i = 0; i < 50; i++) {
      const primeiro = gerarNome(rng, { genero: 'F', sobrenome: false });
      expect(FEM.has(primeiro)).toBe(true);
    }
  });
});
