/**
 * Vehicle generation: license plates (Mercosul and pre-2018 formats), RENAVAM
 * with a valid check digit, and a coherent vehicle entity.
 */

import { coresVeiculo, modelosVeiculo } from '../data/index.js';
import { apenasDigitos } from '../engine/mascara.js';
import { dvModulo11 } from '../engine/modulo11.js';
import type { Rng } from '../engine/prng.js';

/** License-plate format. */
export type FormatoPlaca = 'mercosul' | 'antiga';

/** Options for {@link gerarPlaca}. */
export interface OpcoesPlaca {
  /** `'mercosul'` (default, `ABC1D23`) or `'antiga'` (`ABC-1234`). */
  formato?: FormatoPlaca;
}

/** A generated vehicle. */
export interface Veiculo {
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  /** Mercosul plate, e.g. `ABC1D23`. */
  placa: string;
  /** 11-digit RENAVAM with a valid check digit. */
  renavam: string;
}

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// RENAVAM: weights on the 10 base digits (left to right); DENATRAN modulo 11.
const PESOS_RENAVAM = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function letra(rng: Rng): string {
  return LETRAS[rng.int(0, 25)] as string;
}

/** Compute the RENAVAM check digit for a 10-digit base. */
function digitoRenavam(base: string): number {
  return dvModulo11(base.split('').map(Number), PESOS_RENAVAM);
}

/** Validate a RENAVAM, accepting input with or without separators. */
export function validarRenavam(valor: string): boolean {
  const digitos = apenasDigitos(valor);
  if (digitos.length === 0 || digitos.length > 11) return false;
  const cheio = digitos.padStart(11, '0');
  if (/^(\d)\1{10}$/.test(cheio)) return false;
  return digitoRenavam(cheio.slice(0, 10)) === Number(cheio[10]);
}

/** Generate a valid 11-digit RENAVAM. */
export function gerarRenavam(rng: Rng): string {
  let base: string;
  do {
    base = Array.from({ length: 10 }, () => rng.int(0, 9)).join('');
  } while (/^(\d)\1{9}$/.test(base));
  return `${base}${digitoRenavam(base)}`;
}

/** Generate a license plate. */
export function gerarPlaca(rng: Rng, opcoes: OpcoesPlaca = {}): string {
  const l = (): string => letra(rng);
  const d = (): string => String(rng.int(0, 9));
  if (opcoes.formato === 'antiga') {
    return `${l()}${l()}${l()}-${d()}${d()}${d()}${d()}`;
  }
  // Mercosul: LLL N L NN
  return `${l()}${l()}${l()}${d()}${l()}${d()}${d()}`;
}

/** Generate a coherent vehicle. */
export function gerarVeiculo(rng: Rng, opcoes: OpcoesPlaca = {}): Veiculo {
  const { marca, modelo } = rng.pick(modelosVeiculo);
  return {
    marca,
    modelo,
    ano: rng.int(1990, new Date().getFullYear()),
    cor: rng.pick(coresVeiculo),
    placa: gerarPlaca(rng, opcoes),
    renavam: gerarRenavam(rng),
  };
}
