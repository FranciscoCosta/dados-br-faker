import { describe, expect, it } from 'vitest';
import { municipios } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import { validarCnpj } from '../../src/generators/cnpj.js';
import { gerarEmpresa } from '../../src/generators/empresa.js';
import { validarInscricaoEstadual } from '../../src/generators/inscricao-estadual.js';

const municipioDe = (nome: string) =>
  municipios.find((m) => m.nome === nome)!;

describe('gerarEmpresa', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarEmpresa(createRng(1))).toEqual(gerarEmpresa(createRng(1)));
  });

  it('has a well-formed shape', () => {
    const e = gerarEmpresa(createRng(2));
    expect(e.razaoSocial.length).toBeGreaterThan(0);
    expect(e.nomeFantasia.length).toBeGreaterThan(0);
    expect(e.email).toContain('@');
  });

  it('INVARIANT: cnpj is valid (numeric by default)', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 200; i++) {
      const e = gerarEmpresa(rng);
      expect(e.cnpj).toMatch(/^\d{14}$/);
      expect(validarCnpj(e.cnpj)).toBe(true);
    }
  });

  it('propagates cnpjFormato alfanumerico to the entity CNPJ', () => {
    const rng = createRng(200);
    let sawLetter = false;
    for (let i = 0; i < 100; i++) {
      const e = gerarEmpresa(rng, { cnpjFormato: 'alfanumerico' });
      expect(validarCnpj(e.cnpj)).toBe(true);
      if (/[A-Z]/.test(e.cnpj)) sawLetter = true;
    }
    expect(sawLetter).toBe(true);
  });

  it('INVARIANT: inscricaoEstadual is valid for the address UF', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 200; i++) {
      const e = gerarEmpresa(rng);
      expect(validarInscricaoEstadual(e.inscricaoEstadual, e.endereco.uf)).toBe(
        true,
      );
    }
  });

  it('INVARIANT: telefone.ddd is valid for the address city', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 300; i++) {
      const e = gerarEmpresa(rng);
      expect(municipioDe(e.endereco.cidade).ddds).toContain(e.telefone.ddd);
    }
  });

  it('FILTER: { uf } propagates to address and IE', () => {
    const rng = createRng(7);
    for (let i = 0; i < 100; i++) {
      const e = gerarEmpresa(rng, { uf: 'RS' });
      expect(e.endereco.uf).toBe('RS');
      expect(validarInscricaoEstadual(e.inscricaoEstadual, 'RS')).toBe(true);
    }
  });
});
