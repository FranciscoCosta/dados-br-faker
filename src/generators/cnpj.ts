/**
 * CNPJ generation and validation, supporting both the traditional numeric
 * format and the alphanumeric format introduced by IN RFB nº 2.229/2024
 * (in production since 2026-07-27).
 *
 * Structure (14 positions): positions 1–8 (root) and 9–12 (order/branch) are
 * numeric today and may be alphanumeric under the new rules; positions 13–14
 * (check digits) are always numeric. The check digits use modulo 11 with the
 * weights 2–9, converting each character by its ASCII value minus 48 (digits
 * keep 0–9; 'A' = 17, 'B' = 18, …, 'Z' = 42).
 */

import { aplicarMascara, apenasAlfanumerico } from '../engine/mascara.js';
import { dvModulo11 } from '../engine/modulo11.js';
import type { Rng } from '../engine/prng.js';

/** CNPJ display format. */
export type FormatoCnpj = 'numerico' | 'alfanumerico';

/** Options for {@link gerarCnpj}. */
export interface OpcoesCnpj {
  /** Format the result as `11.222.333/0001-81` instead of the bare value. */
  mascara?: boolean;
  /** Numeric (default) or the 2026 alphanumeric format. */
  formato?: FormatoCnpj;
}

const MASCARA_CNPJ = '##.###.###/####-##';
const ALFANUMERICO = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PESOS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Convert a CNPJ character to its check-digit value (ASCII − 48). */
function valorCaractere(ch: string): number {
  return ch.charCodeAt(0) - 48;
}

/** Compute the two numeric check digits for a 12-character base. */
function calcularDigitos(base: string): [number, number] {
  const valores = base.split('').map(valorCaractere);
  const dv1 = dvModulo11(valores, PESOS_DV1);
  const dv2 = dvModulo11([...valores, dv1], PESOS_DV2);
  return [dv1, dv2];
}

/** Validate a CNPJ in either format, accepting input with or without the mask. */
export function validarCnpj(valor: string): boolean {
  const limpo = apenasAlfanumerico(valor);
  // Root/order alphanumeric, check digits strictly numeric.
  if (!/^[0-9A-Z]{12}\d{2}$/.test(limpo)) return false;
  // Repeated-character sequences are conventionally invalid.
  if (/^(.)\1{13}$/.test(limpo)) return false;

  const [dv1, dv2] = calcularDigitos(limpo.slice(0, 12));
  return limpo[12] === String(dv1) && limpo[13] === String(dv2);
}

/** Generate a valid CNPJ in the requested format. */
export function gerarCnpj(rng: Rng, opcoes: OpcoesCnpj = {}): string {
  const alfanumerico = opcoes.formato === 'alfanumerico';

  let base: string;
  if (alfanumerico) {
    base = Array.from({ length: 12 }, () =>
      ALFANUMERICO[rng.int(0, ALFANUMERICO.length - 1)],
    ).join('');
  } else {
    // Numeric matriz: 8-digit root + '0001' branch.
    const raiz = Array.from({ length: 8 }, () => rng.int(0, 9)).join('');
    base = `${raiz}0001`;
  }

  const [dv1, dv2] = calcularDigitos(base);
  const valor = `${base}${dv1}${dv2}`;
  return opcoes.mascara ? aplicarMascara(valor, MASCARA_CNPJ) : valor;
}
