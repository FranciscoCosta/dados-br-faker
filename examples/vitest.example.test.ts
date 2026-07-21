/**
 * Deterministic test fixtures with Vitest.
 *
 * Run: `npx vitest run examples/vitest.example.test.ts`
 *
 * A seeded faker gives every test run the same coherent data, so failures are
 * reproducible and snapshots are stable.
 */
import { beforeEach, expect, test } from 'vitest';
import { createFaker, validarCpf } from 'dados-br-faker';
import type { Faker } from 'dados-br-faker';

let faker: Faker;

beforeEach(() => {
  // Re-seed before each test for isolation + reproducibility.
  faker = createFaker({ seed: 1 });
});

test('a generated person carries a valid CPF', () => {
  const pessoa = faker.pessoa();
  expect(validarCpf(pessoa.cpf)).toBe(true);
});

test('a UF filter keeps the whole address coherent', () => {
  const pessoa = faker.pessoa({ uf: 'SP' });
  expect(pessoa.endereco.uf).toBe('SP');
  expect(pessoa.endereco.estado).toBe('São Paulo');
  // The phone's DDD belongs to the generated city — coherence guaranteed.
  expect(pessoa.telefone.ddd).toMatch(/^\d{2}$/);
});

test('age is consistent with the birth date', () => {
  const { idade, dataNascimento } = faker.pessoa({
    idadeMin: 30,
    idadeMax: 40,
  });
  expect(idade).toBeGreaterThanOrEqual(30);
  expect(idade).toBeLessThanOrEqual(40);
  expect(dataNascimento).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
