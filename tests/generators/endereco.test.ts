import { describe, expect, it } from 'vitest';
import { estados, municipios } from '../../src/data/index.js';
import { apenasDigitos } from '../../src/engine/mascara.js';
import { createRng } from '../../src/engine/prng.js';
import { gerarEndereco } from '../../src/generators/endereco.js';

const municipioDe = (nome: string) => municipios.find((m) => m.nome === nome)!;

describe('gerarEndereco', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarEndereco(createRng(1))).toEqual(gerarEndereco(createRng(1)));
  });

  it('has a well-formed shape', () => {
    const e = gerarEndereco(createRng(2));
    expect(e.logradouro.length).toBeGreaterThan(0);
    expect(e.bairro.length).toBeGreaterThan(0);
    expect(e.cep).toMatch(/^\d{5}-\d{3}$/);
    expect(estados[e.uf]).toBe(e.estado);
  });

  it('INVARIANT: cep falls within the city CEP range', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      const e = gerarEndereco(rng);
      const m = municipioDe(e.cidade);
      const cep = Number(apenasDigitos(e.cep));
      expect(cep).toBeGreaterThanOrEqual(Number(m.cepInicio));
      expect(cep).toBeLessThanOrEqual(Number(m.cepFim));
    }
  });

  it('INVARIANT: uf/estado/regiao are mutually coherent', () => {
    const rng = createRng(99);
    for (let i = 0; i < 500; i++) {
      const e = gerarEndereco(rng);
      const m = municipioDe(e.cidade);
      expect(e.uf).toBe(m.uf);
      expect(e.regiao).toBe(m.regiao);
      expect(e.estado).toBe(estados[m.uf]);
    }
  });

  it('FILTER: { uf } constrains the city to that state', () => {
    const rng = createRng(7);
    for (let i = 0; i < 100; i++) {
      expect(gerarEndereco(rng, { uf: 'SC' }).uf).toBe('SC');
    }
  });

  it('FILTER: { cidade } fixes the city and its CEP range', () => {
    const rng = createRng(8);
    const alvo = municipioDe('Curitiba');
    for (let i = 0; i < 100; i++) {
      const e = gerarEndereco(rng, { cidade: 'Curitiba' });
      expect(e.cidade).toBe('Curitiba');
      const cep = Number(apenasDigitos(e.cep));
      expect(cep).toBeGreaterThanOrEqual(Number(alvo.cepInicio));
      expect(cep).toBeLessThanOrEqual(Number(alvo.cepFim));
    }
  });
});
