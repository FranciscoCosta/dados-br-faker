import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import {
  comprimentoIE,
  gerarInscricaoEstadual,
  validarInscricaoEstadual,
} from '../../src/generators/inscricao-estadual.js';
import type { UF } from '../../src/types.js';

const TODAS_UFS: UF[] = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

describe('validarInscricaoEstadual — SP (official algorithm)', () => {
  it('accepts a known-valid SP IE (masked and unmasked)', () => {
    expect(validarInscricaoEstadual('110042490114', 'SP')).toBe(true);
    expect(validarInscricaoEstadual('110.042.490.114', 'SP')).toBe(true);
  });

  it('rejects an SP IE with a wrong check digit', () => {
    expect(validarInscricaoEstadual('110042490115', 'SP')).toBe(false);
  });

  it('rejects the wrong length for SP', () => {
    expect(validarInscricaoEstadual('11004249011', 'SP')).toBe(false);
  });
});

describe('gerarInscricaoEstadual', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarInscricaoEstadual(createRng(1), 'SP')).toBe(
      gerarInscricaoEstadual(createRng(1), 'SP'),
    );
  });

  it('produces an SP IE of 12 digits that validates', () => {
    const ie = gerarInscricaoEstadual(createRng(3), 'SP');
    expect(ie).toMatch(/^\d{12}$/);
    expect(validarInscricaoEstadual(ie, 'SP')).toBe(true);
  });

  it('property: for every UF, generated IEs validate and match the UF length', () => {
    for (const uf of TODAS_UFS) {
      const rng = createRng(42);
      for (let i = 0; i < 200; i++) {
        const ie = gerarInscricaoEstadual(rng, uf);
        expect(ie).toHaveLength(comprimentoIE(uf));
        expect(validarInscricaoEstadual(ie, uf)).toBe(true);
      }
    }
  });
});
