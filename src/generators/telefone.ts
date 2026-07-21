/** Phone-number generation (mobile and landline). */

import { municipios } from '../data/index.js';
import { apenasDigitos } from '../engine/mascara.js';
import type { Rng } from '../engine/prng.js';
import type { Telefone } from '../types.js';

/** Line type. */
export type TipoTelefone = 'celular' | 'fixo';

/** Options for {@link gerarTelefone} and {@link gerarTelefoneEstruturado}. */
export interface OpcoesTelefone {
  /** Format the result as `(11) 98765-4321` instead of bare digits. */
  mascara?: boolean;
  /** Line type (default `'celular'`). */
  tipo?: TipoTelefone;
  /** Force the DDD; omitted means a random valid area code is chosen. */
  ddd?: string;
}

/** All area codes known to the municipality dataset. */
const DDDS = [...new Set(municipios.flatMap((m) => m.ddds))];

function digitos(rng: Rng, quantidade: number): string {
  return Array.from({ length: quantidade }, () => rng.int(0, 9)).join('');
}

/** Generate a structured phone number, used inside composite entities. */
export function gerarTelefoneEstruturado(
  rng: Rng,
  opcoes: OpcoesTelefone,
): Telefone {
  const ddd = opcoes.ddd ?? rng.pick(DDDS);
  const tipo = opcoes.tipo ?? 'celular';

  let numero: string;
  let formatado: string;
  if (tipo === 'celular') {
    numero = `9${digitos(rng, 8)}`;
    formatado = `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
  } else {
    numero = `${rng.int(2, 5)}${digitos(rng, 7)}`;
    formatado = `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
  }

  return { ddd, numero, tipo, formatado };
}

/** Generate a phone number as a string (bare digits, or masked). */
export function gerarTelefone(rng: Rng, opcoes: OpcoesTelefone = {}): string {
  const tel = gerarTelefoneEstruturado(rng, opcoes);
  return opcoes.mascara ? tel.formatado : apenasDigitos(`${tel.ddd}${tel.numero}`);
}
