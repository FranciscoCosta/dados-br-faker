import { describe, expect, it } from 'vitest';
import { municipios } from '../../src/data/index.js';
import { createRng } from '../../src/engine/prng.js';
import {
  gerarTelefone,
  gerarTelefoneEstruturado,
} from '../../src/generators/telefone.js';

const DDDS = new Set(municipios.flatMap((m) => m.ddds));

describe('gerarTelefone (atomic string)', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarTelefone(createRng(1))).toBe(gerarTelefone(createRng(1)));
  });

  it('returns a bare 11-digit mobile by default (DDD + 9 + 8)', () => {
    const tel = gerarTelefone(createRng(1));
    expect(tel).toMatch(/^\d{2}9\d{8}$/);
  });

  it('returns a bare 10-digit landline for tipo fixo', () => {
    const tel = gerarTelefone(createRng(1), { tipo: 'fixo' });
    expect(tel).toMatch(/^\d{2}[2-5]\d{7}$/);
  });

  it('formats a mobile when masked', () => {
    expect(gerarTelefone(createRng(1), { mascara: true })).toMatch(
      /^\(\d{2}\) 9\d{4}-\d{4}$/,
    );
  });

  it('formats a landline when masked', () => {
    expect(
      gerarTelefone(createRng(1), { mascara: true, tipo: 'fixo' }),
    ).toMatch(/^\(\d{2}\) \d{4}-\d{4}$/);
  });

  it('honors a supplied DDD', () => {
    expect(gerarTelefone(createRng(1), { ddd: '48' }).startsWith('48')).toBe(
      true,
    );
  });
});

describe('gerarTelefoneEstruturado', () => {
  it('returns a coherent structured object', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 200; i++) {
      const t = gerarTelefoneEstruturado(rng, {});
      expect(DDDS.has(t.ddd)).toBe(true);
      expect(t.formatado).toContain(`(${t.ddd})`);
      if (t.tipo === 'celular') expect(t.numero).toMatch(/^9\d{8}$/);
      else expect(t.numero).toMatch(/^[2-5]\d{7}$/);
    }
  });

  it('uses the requested DDD and tipo', () => {
    const t = gerarTelefoneEstruturado(createRng(1), {
      ddd: '11',
      tipo: 'fixo',
    });
    expect(t.ddd).toBe('11');
    expect(t.tipo).toBe('fixo');
  });
});
