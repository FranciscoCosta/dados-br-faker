/**
 * Boleto (bank slip) generation: 44-digit barcode and 47-digit linha digitável
 * with valid check digits, following the FEBRABAN standard.
 *
 * The check-digit algorithms (módulo 10 for the three linha fields, módulo 11
 * for the barcode general DV) are ported from the tested `mrmgomes/boleto-utils`
 * library and verified against real barcode/linha pairs. The fator de vencimento
 * and campo livre are synthetic (valid format, not tied to a real due date).
 */

import { bancos } from '../data/index.js';
import { apenasDigitos } from '../engine/mascara.js';
import type { Rng } from '../engine/prng.js';

/** A generated boleto. */
export interface Boleto {
  banco: string;
  /** 3-digit COMPE code. */
  codigoBanco: string;
  /** Nominal value in reais. */
  valor: number;
  /** 44-digit barcode. */
  codigoBarras: string;
  /** Formatted 47-digit linha digitável. */
  linhaDigitavel: string;
}

/** Options for {@link gerarBoleto}. */
export interface OpcoesBoleto {
  /** Nominal value in reais; random if omitted. */
  valor?: number;
  /** 3-digit COMPE code; a random known bank if omitted. */
  banco?: string;
}

/** FEBRABAN módulo 10 (sum of product digits, alternating weights 2/1). */
function mod10(numero: string): number {
  let mult = 2;
  let s = '';
  for (let i = numero.length - 1; i >= 0; i--) {
    s = `${mult * Number(numero.charAt(i))}${s}`;
    mult = mult === 2 ? 1 : 2;
  }
  let soma = 0;
  for (const ch of s) soma += Number(ch);
  soma %= 10;
  return soma === 0 ? 0 : 10 - soma;
}

/** FEBRABAN módulo 11 for the barcode general DV (weights 4,3,2,9,8,7,6,5). */
function mod11(x: string): number {
  const seq = [4, 3, 2, 9, 8, 7, 6, 5];
  let digit = 0;
  for (let i = 0; i < x.length; i++) {
    digit += (seq[i % seq.length] as number) * Number(x.charAt(i));
  }
  const dac = digit % 11;
  if (dac === 0 || dac === 1) return 0;
  if (dac === 10) return 1;
  return 11 - dac;
}

/** Convert a 44-digit barcode into the 47-digit linha digitável (unformatted). */
function barrasParaLinha(codigo: string): string {
  const nova =
    codigo.substr(0, 4) +
    codigo.substr(19, 25) +
    codigo.substr(4, 1) +
    codigo.substr(5, 14);
  const b1 = nova.substr(0, 9) + mod10(nova.substr(0, 9));
  const b2 = nova.substr(9, 10) + mod10(nova.substr(9, 10));
  const b3 = nova.substr(19, 10) + mod10(nova.substr(19, 10));
  const b4 = nova.substr(29);
  return `${b1}${b2}${b3}${b4}`;
}

/** Apply the standard FEBRABAN spacing to a 47-digit linha digitável. */
function formatarLinha(linha: string): string {
  return (
    `${linha.slice(0, 5)}.${linha.slice(5, 10)} ` +
    `${linha.slice(10, 15)}.${linha.slice(15, 21)} ` +
    `${linha.slice(21, 26)}.${linha.slice(26, 32)} ` +
    `${linha.slice(32, 33)} ${linha.slice(33)}`
  );
}

/** Validate a linha digitável (three módulo-10 fields + the general DV). */
export function validarLinhaDigitavel(valor: string): boolean {
  const l = apenasDigitos(valor);
  if (l.length !== 47) return false;

  if (mod10(l.slice(0, 9)) !== Number(l[9])) return false;
  if (mod10(l.slice(10, 20)) !== Number(l[20])) return false;
  if (mod10(l.slice(21, 31)) !== Number(l[31])) return false;

  // Rebuild the barcode and verify the general check digit.
  const nova = l.slice(0, 9) + l.slice(10, 20) + l.slice(21, 31) + l.slice(32);
  const dvGeral = nova.substr(29, 1);
  const bancoMoeda = nova.substr(0, 4);
  const campoLivre = nova.substr(4, 25);
  const fatorValor = nova.substr(30, 14);
  const semDV = bancoMoeda + fatorValor + campoLivre;
  return mod11(semDV) === Number(dvGeral);
}

/** Generate a boleto with a valid barcode and linha digitável. */
export function gerarBoleto(rng: Rng, opcoes: OpcoesBoleto = {}): Boleto {
  const banco =
    bancos.find((b) => b.codigo === opcoes.banco) ?? rng.pick(bancos);

  const centavos =
    opcoes.valor !== undefined
      ? Math.round(opcoes.valor * 100)
      : rng.int(1000, 9_999_999);
  const valor10 = String(centavos).padStart(10, '0');
  const fator = String(rng.int(1000, 9999));
  const campoLivre = Array.from({ length: 25 }, () => rng.int(0, 9)).join('');

  const semDV = `${banco.codigo}9${fator}${valor10}${campoLivre}`;
  const dvGeral = mod11(semDV);
  const codigoBarras = `${banco.codigo}9${dvGeral}${fator}${valor10}${campoLivre}`;

  return {
    banco: banco.nome,
    codigoBanco: banco.codigo,
    valor: centavos / 100,
    codigoBarras,
    linhaDigitavel: formatarLinha(barrasParaLinha(codigoBarras)),
  };
}
