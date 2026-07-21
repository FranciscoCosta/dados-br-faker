/** Email generation, derived from a person's name when available. */

import type { Rng } from '../engine/prng.js';
import { gerarNome } from './nome.js';

/** Options for {@link gerarEmail}. */
export interface OpcoesEmail {
  /** Base the local part on this name; omitted means a random name is used. */
  nome?: string;
  /** Force the domain; omitted means a random common provider is chosen. */
  provedor?: string;
}

const PROVEDORES = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com.br',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'icloud.com',
];

const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/** Lowercase, strip diacritics, and keep only `[a-z0-9]`. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Split a name into significant tokens, dropping connective particles. */
function tokens(nome: string): string[] {
  return nome
    .split(/\s+/)
    .filter((t) => t.length > 0 && !PARTICULAS.has(t.toLowerCase()))
    .map(normalizar)
    .filter((t) => t.length > 0);
}

/** Generate an email address, deriving the local part from a name. */
export function gerarEmail(rng: Rng, opcoes: OpcoesEmail = {}): string {
  const base = opcoes.nome ?? gerarNome(rng);
  const partes = tokens(base);
  const primeiro = partes[0] ?? 'usuario';
  const ultimo = partes.length > 1 ? partes[partes.length - 1] : '';

  const separador = rng.pick(['.', '_', '']);
  let local = ultimo ? `${primeiro}${separador}${ultimo}` : primeiro;

  // Frequently append a small number, as real users do.
  if (rng.bool(0.5)) {
    local += rng.int(1, 999);
  }

  const provedor = opcoes.provedor ?? rng.pick(PROVEDORES);
  return `${local}@${provedor}`;
}
