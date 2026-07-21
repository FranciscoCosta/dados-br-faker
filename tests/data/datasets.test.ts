import { describe, expect, it } from 'vitest';
import {
  bairros,
  municipios,
  nomesFemininos,
  nomesLogradouro,
  nomesMasculinos,
  sobrenomes,
  tiposLogradouro,
} from '../../src/data/index.js';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];
const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

describe('weighted name datasets', () => {
  it('are non-empty with positive integer weights', () => {
    for (const list of [nomesMasculinos, nomesFemininos, sobrenomes]) {
      expect(list.length).toBeGreaterThan(0);
      for (const item of list) {
        expect(item.nome.length).toBeGreaterThan(0);
        expect(item.peso).toBeGreaterThan(0);
      }
    }
  });

  it('have no duplicate names within a list', () => {
    for (const list of [nomesMasculinos, nomesFemininos, sobrenomes]) {
      const nomes = list.map((i) => i.nome);
      expect(new Set(nomes).size).toBe(nomes.length);
    }
  });
});

describe('municipios dataset', () => {
  it('has consistent, well-formed entries', () => {
    for (const m of municipios) {
      expect(UFS).toContain(m.uf);
      expect(REGIOES).toContain(m.regiao);
      expect(m.cepInicio).toMatch(/^\d{8}$/);
      expect(m.cepFim).toMatch(/^\d{8}$/);
      expect(Number(m.cepInicio)).toBeLessThanOrEqual(Number(m.cepFim));
      expect(m.ddds.length).toBeGreaterThan(0);
      for (const ddd of m.ddds) expect(ddd).toMatch(/^\d{2}$/);
      expect(m.populacao).toBeGreaterThan(0);
    }
  });

  it('has no duplicate municipality names', () => {
    const nomes = municipios.map((m) => m.nome);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it('covers all 27 federative units', () => {
    const cobertas = new Set<string>(municipios.map((m) => m.uf));
    for (const uf of UFS) expect(cobertas.has(uf)).toBe(true);
  });
});

describe('address component datasets', () => {
  it('provide street types, street names, and neighborhoods', () => {
    expect(tiposLogradouro.length).toBeGreaterThan(0);
    for (const t of tiposLogradouro) expect(t.peso).toBeGreaterThan(0);
    expect(nomesLogradouro.length).toBeGreaterThan(0);
    expect(bairros.length).toBeGreaterThan(0);
  });
});
