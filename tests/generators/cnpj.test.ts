import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import { gerarCnpj, validarCnpj } from '../../src/generators/cnpj.js';

describe('validarCnpj — numeric', () => {
  it('accepts a known-valid numeric CNPJ (masked and unmasked)', () => {
    expect(validarCnpj('11222333000181')).toBe(true);
    expect(validarCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('rejects a numeric CNPJ with a wrong check digit', () => {
    expect(validarCnpj('11222333000182')).toBe(false);
  });

  it('rejects repeated-digit sequences and wrong length', () => {
    expect(validarCnpj('00000000000000')).toBe(false);
    expect(validarCnpj('112223330001')).toBe(false);
  });
});

describe('validarCnpj — alphanumeric (IN RFB nº 2.229/2024)', () => {
  it('accepts the reference alphanumeric CNPJ 12.ABC.345/01DE-35', () => {
    expect(validarCnpj('12ABC34501DE35')).toBe(true);
    expect(validarCnpj('12.ABC.345/01DE-35')).toBe(true);
  });

  it('rejects an alphanumeric CNPJ with a wrong check digit', () => {
    expect(validarCnpj('12ABC34501DE34')).toBe(false);
  });

  it('rejects non-numeric check digits (positions 13-14 must be digits)', () => {
    expect(validarCnpj('12ABC34501DE3X')).toBe(false);
  });

  it('accepts lowercase input by normalizing case', () => {
    expect(validarCnpj('12abc34501de35')).toBe(true);
  });
});

describe('gerarCnpj — numeric (default)', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarCnpj(createRng(1))).toBe(gerarCnpj(createRng(1)));
  });

  it('returns 14 unmasked digits by default', () => {
    expect(gerarCnpj(createRng(1))).toMatch(/^\d{14}$/);
  });

  it('applies the mask when requested', () => {
    expect(gerarCnpj(createRng(1), { mascara: true })).toMatch(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    );
  });

  it('property: 1000 numeric CNPJs are all valid', () => {
    const rng = createRng(100);
    for (let i = 0; i < 1000; i++) {
      expect(validarCnpj(gerarCnpj(rng))).toBe(true);
    }
  });
});

describe('gerarCnpj — alphanumeric', () => {
  it('root/order are alphanumeric and check digits are numeric', () => {
    const cnpj = gerarCnpj(createRng(5), { formato: 'alfanumerico' });
    expect(cnpj).toMatch(/^[0-9A-Z]{12}\d{2}$/);
  });

  it('applies the same display mask', () => {
    const cnpj = gerarCnpj(createRng(5), {
      formato: 'alfanumerico',
      mascara: true,
    });
    expect(cnpj).toMatch(/^[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-\d{2}$/);
  });

  it('property: 1000 alphanumeric CNPJs are all valid', () => {
    const rng = createRng(200);
    for (let i = 0; i < 1000; i++) {
      expect(validarCnpj(gerarCnpj(rng, { formato: 'alfanumerico' }))).toBe(
        true,
      );
    }
  });

  it('generates at least one CNPJ containing a letter over many draws', () => {
    const rng = createRng(300);
    let sawLetter = false;
    for (let i = 0; i < 50; i++) {
      if (/[A-Z]/.test(gerarCnpj(rng, { formato: 'alfanumerico' }))) {
        sawLetter = true;
        break;
      }
    }
    expect(sawLetter).toBe(true);
  });
});
