/**
 * CNH (Carteira Nacional de Habilitação) number generation and validation.
 *
 * 11 digits: 9 sequential base digits + 2 check digits. The check-digit
 * algorithm (two modulo-11 passes with weight sets 2–10 and 3–11,2) is ported
 * from the tested `klawdyo/validation-br` library and verified against its
 * real vectors (e.g. 69044271146, 62472927637 are valid).
 */

import { apenasDigitos } from '../engine/mascara.js';
import { dvModulo11 } from '../engine/modulo11.js';
import type { Rng } from '../engine/prng.js';

const PESOS_DV1 = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const PESOS_DV2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 2];

/** Compute the two CNH check digits for a 9-digit base. */
function calcularDigitos(base: number[]): [number, number] {
  const dv1 = dvModulo11(base, PESOS_DV1);
  const dv2 = dvModulo11([...base, dv1], PESOS_DV2);
  return [dv1, dv2];
}

/** Validate a CNH number, accepting input with or without separators. */
export function validarCnh(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const numeros = digitos.split('').map(Number);
  const [dv1, dv2] = calcularDigitos(numeros.slice(0, 9));
  return numeros[9] === dv1 && numeros[10] === dv2;
}

/** Generate a valid CNH number. */
export function gerarCnh(rng: Rng): string {
  let base: number[];
  do {
    base = Array.from({ length: 9 }, () => rng.int(0, 9));
  } while (base.every((d) => d === base[0]));

  const [dv1, dv2] = calcularDigitos(base);
  return `${base.join('')}${dv1}${dv2}`;
}
