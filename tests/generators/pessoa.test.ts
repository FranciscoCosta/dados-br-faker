import { describe, expect, it } from 'vitest';
import { municipios } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import { validarCpf } from '../../src/generators/cpf.js';
import { calcularIdade, gerarPessoa } from '../../src/generators/pessoa.js';

const municipioDe = (nome: string) =>
  municipios.find((m) => m.nome === nome)!;

describe('gerarPessoa', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarPessoa(createRng(1))).toEqual(gerarPessoa(createRng(1)));
  });

  it('produces valid documents', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 200; i++) {
      expect(validarCpf(gerarPessoa(rng).cpf)).toBe(true);
    }
  });

  it('INVARIANT: telefone.ddd is valid for the address city', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 500; i++) {
      const p = gerarPessoa(rng);
      const m = municipioDe(p.endereco.cidade);
      expect(m.ddds).toContain(p.telefone.ddd);
    }
  });

  it('INVARIANT: idade matches dataNascimento', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 500; i++) {
      const p = gerarPessoa(rng);
      const nascimento = new Date(`${p.dataNascimento}T00:00:00`);
      expect(p.idade).toBe(calcularIdade(nascimento, new Date()));
      expect(p.dataNascimento).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('INVARIANT: email is derived from the name (accent-stripped)', () => {
    const p = gerarPessoa(createRng(3), { genero: 'F' });
    const primeiro = p.nome
      .split(' ')[0]!
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
    expect(p.email.split('@')[0]).toContain(primeiro);
  });

  it('respects idade bounds', () => {
    const rng = createRng(5);
    for (let i = 0; i < 300; i++) {
      const p = gerarPessoa(rng, { idadeMin: 25, idadeMax: 30 });
      expect(p.idade).toBeGreaterThanOrEqual(25);
      expect(p.idade).toBeLessThanOrEqual(30);
    }
  });

  it('FILTER: { uf } propagates to address (and thus DDD)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 100; i++) {
      const p = gerarPessoa(rng, { uf: 'PR' });
      expect(p.endereco.uf).toBe('PR');
      const m = municipioDe(p.endereco.cidade);
      expect(m.ddds).toContain(p.telefone.ddd);
    }
  });
});

describe('calcularIdade', () => {
  it('counts full years, accounting for the birthday', () => {
    const ref = new Date('2026-07-20T00:00:00');
    expect(calcularIdade(new Date('2000-07-20T00:00:00'), ref)).toBe(26);
    expect(calcularIdade(new Date('2000-07-21T00:00:00'), ref)).toBe(25);
    expect(calcularIdade(new Date('2000-01-01T00:00:00'), ref)).toBe(26);
  });
});
