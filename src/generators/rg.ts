/**
 * RG (Registro Geral) generation.
 *
 * Brazil has no single national RG check-digit algorithm — each state issues
 * its own. This library uses the widely recognized São Paulo (SSP-SP) scheme:
 * 8 base digits weighted by 2–9, modulo 11, with the check digit `11 - resto`
 * (`10 → 'X'`, `11 → '0'`). The output is illustrative, not an official record.
 */

import { aplicarMascara } from '../engine/mascara.js';
import { somaPonderada } from '../engine/modulo11.js';
import type { Rng } from '../engine/prng.js';

/** Options for {@link gerarRg}. */
export interface OpcoesRg {
  /** Format the result as `24.678.131-2` instead of the bare characters. */
  mascara?: boolean;
}

const MASCARA_RG = '##.###.###-#';
const PESOS = [2, 3, 4, 5, 6, 7, 8, 9];

/** Compute the SP RG check digit for an 8-digit base (`'0'`–`'9'` or `'X'`). */
export function digitoVerificadorRg(base: string): string {
  const valores = base.split('').map(Number);
  const resto = somaPonderada(valores, PESOS) % 11;
  const dv = 11 - resto;
  if (dv === 10) return 'X';
  if (dv === 11) return '0';
  return String(dv);
}

/** Generate an RG in the São Paulo format. */
export function gerarRg(rng: Rng, opcoes: OpcoesRg = {}): string {
  const base = Array.from({ length: 8 }, () => rng.int(0, 9)).join('');
  const valor = `${base}${digitoVerificadorRg(base)}`;
  return opcoes.mascara ? aplicarMascara(valor, MASCARA_RG) : valor;
}
