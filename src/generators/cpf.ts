/** CPF generation and validation (Cadastro de Pessoas Físicas). */

import { aplicarMascara, apenasDigitos } from '../engine/mascara.js';
import { dvModulo11 } from '../engine/modulo11.js';
import type { Rng } from '../engine/prng.js';

/** Options for {@link gerarCpf}. */
export interface OpcoesCpf {
  /** Format the result as `529.982.247-25` instead of the bare digits. */
  mascara?: boolean;
}

const MASCARA_CPF = '###.###.###-##';
const PESOS_DV1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_DV2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

/** Compute the two CPF check digits for the first 9 digits. */
function calcularDigitos(base: number[]): [number, number] {
  const dv1 = dvModulo11(base, PESOS_DV1);
  const dv2 = dvModulo11([...base, dv1], PESOS_DV2);
  return [dv1, dv2];
}

/** Validate a CPF, accepting input with or without the mask. */
export function validarCpf(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.length !== 11) return false;
  // Repeated-digit sequences pass the check-digit math but are not valid CPFs.
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const numeros = digitos.split('').map(Number);
  const [dv1, dv2] = calcularDigitos(numeros.slice(0, 9));
  return numeros[9] === dv1 && numeros[10] === dv2;
}

/** Generate a valid CPF. */
export function gerarCpf(rng: Rng, opcoes: OpcoesCpf = {}): string {
  let base: number[];
  do {
    base = Array.from({ length: 9 }, () => rng.int(0, 9));
  } while (base.every((d) => d === base[0]));

  const [dv1, dv2] = calcularDigitos(base);
  const digitos = [...base, dv1, dv2].join('');
  return opcoes.mascara ? aplicarMascara(digitos, MASCARA_CPF) : digitos;
}
