import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import { gerarCpf, validarCpf } from '../../src/generators/cpf.js';

describe('validarCpf', () => {
  it('accepts a known-valid CPF (unmasked and masked)', () => {
    expect(validarCpf('52998224725')).toBe(true);
    expect(validarCpf('529.982.247-25')).toBe(true);
  });

  it('rejects a CPF with a wrong check digit', () => {
    expect(validarCpf('52998224726')).toBe(false);
  });

  it('rejects repeated-digit sequences', () => {
    expect(validarCpf('00000000000')).toBe(false);
    expect(validarCpf('11111111111')).toBe(false);
  });

  it('rejects wrong-length input', () => {
    expect(validarCpf('123')).toBe(false);
    expect(validarCpf('529982247250')).toBe(false);
  });
});

describe('gerarCpf', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarCpf(createRng(1))).toBe(gerarCpf(createRng(1)));
  });

  it('returns 11 unmasked digits by default', () => {
    expect(gerarCpf(createRng(1))).toMatch(/^\d{11}$/);
  });

  it('applies the mask when requested', () => {
    expect(gerarCpf(createRng(1), { mascara: true })).toMatch(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    );
  });

  it('property: 1000 generated CPFs are all valid', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      expect(validarCpf(gerarCpf(rng))).toBe(true);
    }
  });

  it('never generates a repeated-digit CPF', () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const cpf = gerarCpf(rng);
      expect(/^(\d)\1{10}$/.test(cpf)).toBe(false);
    }
  });
});
