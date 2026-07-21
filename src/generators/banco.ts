/**
 * Banking data: PIX keys and bank accounts.
 *
 * Bank COMPE codes are real (Banco Central). The account check digit uses a
 * generic modulo-11 scheme (self-consistent) because per-bank account DV rules
 * are not publicly standardized — values are for coherent fixtures, not real
 * account validation.
 */

import { bancos } from '../data/index.js';
import type { Rng } from '../engine/prng.js';
import { gerarCpf } from './cpf.js';
import { gerarEmail } from './email.js';
import { gerarTelefoneEstruturado } from './telefone.js';

/** PIX key type. */
export type TipoChavePix = 'aleatoria' | 'cpf' | 'email' | 'telefone';

/** Options for {@link gerarChavePix}. */
export interface OpcoesChavePix {
  /** Key type (default `'aleatoria'`, a random UUID v4). */
  tipo?: TipoChavePix;
}

/** A generated bank account. */
export interface ContaBancaria {
  banco: string;
  /** 3-digit COMPE code. */
  codigoBanco: string;
  /** 4-digit agency number. */
  agencia: string;
  /** Account number with a check digit, e.g. `12345-6`. */
  conta: string;
}

const HEX = '0123456789abcdef';

/** Generate a random UUID v4 from the seeded stream. */
function uuidV4(rng: Rng): string {
  const h = (n: number): string =>
    Array.from({ length: n }, () => HEX[rng.int(0, 15)]).join('');
  const y = HEX[rng.int(8, 11)] as string; // variant 8, 9, a, or b
  return `${h(8)}-${h(4)}-4${h(3)}-${y}${h(3)}-${h(12)}`;
}

/** Generate a PIX key of the requested type. */
export function gerarChavePix(rng: Rng, opcoes: OpcoesChavePix = {}): string {
  switch (opcoes.tipo) {
    case 'cpf':
      return gerarCpf(rng);
    case 'email':
      return gerarEmail(rng);
    case 'telefone': {
      const t = gerarTelefoneEstruturado(rng, { tipo: 'celular' });
      return `+55${t.ddd}${t.numero}`;
    }
    default:
      return uuidV4(rng);
  }
}

/** Generic modulo-11 account check digit (weights cycle 2–9 from the right). */
function digitoConta(digitos: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = digitos.length - 1; i >= 0; i--) {
    soma += Number(digitos[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** Generate a bank account with a real bank and a checked account number. */
export function gerarContaBancaria(rng: Rng): ContaBancaria {
  const banco = rng.pick(bancos);
  const agencia = Array.from({ length: 4 }, () => rng.int(0, 9)).join('');
  const numero = Array.from({ length: rng.int(5, 8) }, () =>
    rng.int(0, 9),
  ).join('');
  return {
    banco: banco.nome,
    codigoBanco: banco.codigo,
    agencia,
    conta: `${numero}-${digitoConta(numero)}`,
  };
}
