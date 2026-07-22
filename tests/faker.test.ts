import { describe, expect, it } from 'vitest';
import { createFaker } from '../src/faker.js';
import { cpf as cpfStandalone, validarCpf } from '../src/index.js';

const METODOS = [
  'cpf',
  'cnpj',
  'rg',
  'cnh',
  'cep',
  'telefone',
  'nome',
  'email',
  'endereco',
  'pessoa',
  'empresa',
  'placa',
  'renavam',
  'veiculo',
  'chavePix',
  'contaBancaria',
  'boleto',
] as const;

describe('createFaker determinism', () => {
  it('produces identical sequences for the same seed across every generator', () => {
    const a = createFaker({ seed: 42 });
    const b = createFaker({ seed: 42 });
    for (const metodo of METODOS) {
      for (let i = 0; i < 5; i++) {
        expect(a[metodo]()).toEqual(b[metodo]());
      }
    }
  });

  it('advances the shared stream (successive calls differ)', () => {
    const f = createFaker({ seed: 1 });
    expect(f.cpf()).not.toBe(f.cpf());
  });

  it('seed() resets the sequence deterministically', () => {
    const f = createFaker({ seed: 7 });
    const first = f.cpf();
    f.seed(7);
    expect(f.cpf()).toBe(first);
  });

  it('different seeds diverge', () => {
    expect(createFaker({ seed: 1 }).cpf()).not.toBe(
      createFaker({ seed: 2 }).cpf(),
    );
  });
});

describe('standalone exports', () => {
  it('generate valid, random data', () => {
    expect(validarCpf(cpfStandalone())).toBe(true);
  });
});
