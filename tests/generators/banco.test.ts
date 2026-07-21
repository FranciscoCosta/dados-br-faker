import { describe, expect, it } from 'vitest';
import { bancos } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import {
  gerarChavePix,
  gerarContaBancaria,
} from '../../src/generators/banco.js';
import { validarCpf } from '../../src/generators/cpf.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('gerarChavePix', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarChavePix(createRng(1))).toBe(gerarChavePix(createRng(1)));
  });

  it('generates a valid UUID v4 for the random key (default)', () => {
    expect(gerarChavePix(createRng(1))).toMatch(UUID_V4);
  });

  it('generates a valid CPF key', () => {
    const chave = gerarChavePix(createRng(2), { tipo: 'cpf' });
    expect(validarCpf(chave)).toBe(true);
  });

  it('generates an E.164 phone key', () => {
    expect(gerarChavePix(createRng(3), { tipo: 'telefone' })).toMatch(
      /^\+55\d{2}9\d{8}$/,
    );
  });

  it('generates an email key', () => {
    expect(gerarChavePix(createRng(4), { tipo: 'email' })).toMatch(/@/);
  });
});

describe('gerarContaBancaria', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarContaBancaria(createRng(1))).toEqual(
      gerarContaBancaria(createRng(1)),
    );
  });

  it('uses a real bank with a 3-digit COMPE code', () => {
    const codigos = new Set(bancos.map((b) => b.codigo));
    const conta = gerarContaBancaria(createRng(2));
    expect(codigos.has(conta.codigoBanco)).toBe(true);
    expect(conta.codigoBanco).toMatch(/^\d{3}$/);
  });

  it('has a 4-digit agency and a checked account number', () => {
    const conta = gerarContaBancaria(createRng(3));
    expect(conta.agencia).toMatch(/^\d{4}$/);
    expect(conta.conta).toMatch(/^\d+-\d$/);
  });
});
