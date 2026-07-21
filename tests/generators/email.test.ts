import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import { gerarEmail } from '../../src/generators/email.js';

const EMAIL_RE = /^[a-z0-9._]+@[a-z0-9.]+\.[a-z]{2,}$/;

describe('gerarEmail', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarEmail(createRng(1))).toBe(gerarEmail(createRng(1)));
  });

  it('always produces a syntactically valid email', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 500; i++) {
      expect(gerarEmail(rng)).toMatch(EMAIL_RE);
    }
  });

  it('derives the local part from a provided name, stripped of accents', () => {
    const email = gerarEmail(createRng(3), { nome: 'José da Silva' });
    const local = email.split('@')[0]!;
    expect(local).toContain('jose');
    expect(local).toContain('silva');
    // No accented characters survive normalization.
    expect(local).toMatch(/^[a-z0-9._]+$/);
  });

  it('drops connective particles like "da"/"de"/"dos"', () => {
    const email = gerarEmail(createRng(4), { nome: 'Ana de Souza dos Santos' });
    const local = email.split('@')[0]!;
    expect(local).not.toMatch(/(^|[._])(de|da|do|dos|das)([._]|$)/);
  });

  it('honors a custom provider', () => {
    const email = gerarEmail(createRng(5), {
      nome: 'Maria Lima',
      provedor: 'empresa.com.br',
    });
    expect(email.endsWith('@empresa.com.br')).toBe(true);
  });
});
