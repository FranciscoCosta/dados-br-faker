/**
 * Inscrição Estadual (state tax registration) generation and validation.
 *
 * São Paulo uses its documented official algorithm (two modulo-11 check digits
 * with the units-digit rule). Every other UF uses a self-consistent generic
 * modulo-11 scheme sized to that state's official IE length: the generator and
 * validator agree by construction, but the generic DV is NOT guaranteed to
 * match each SEFAZ's exact rule. Real per-state algorithms can be added
 * incrementally; the values are intended for coherent fake entities, not for
 * submission to a tax authority.
 */

import { apenasDigitos } from '../engine/mascara.js';
import { somaPonderada } from '../engine/modulo11.js';
import type { Rng } from '../engine/prng.js';
import type { UF } from '../types.js';

/** Official IE length (number of digits) per UF. */
const COMPRIMENTOS: Record<UF, number> = {
  AC: 13,
  AL: 9,
  AP: 9,
  AM: 9,
  BA: 9,
  CE: 9,
  DF: 13,
  ES: 9,
  GO: 9,
  MA: 9,
  MT: 11,
  MS: 9,
  MG: 13,
  PA: 9,
  PB: 9,
  PR: 10,
  PE: 9,
  PI: 9,
  RJ: 8,
  RN: 10,
  RS: 10,
  RO: 14,
  RR: 9,
  SC: 9,
  SP: 12,
  SE: 9,
  TO: 11,
};

/** Number of digits in a valid IE for the given UF. */
export function comprimentoIE(uf: UF): number {
  return COMPRIMENTOS[uf];
}

const SP_PESOS_DV1 = [1, 3, 4, 5, 6, 7, 8, 10];
const SP_PESOS_DV2 = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];

/** SP check digit: units digit of `(weighted sum) mod 11`. */
function spDv(digitos: number[], pesos: number[]): number {
  return (somaPonderada(digitos, pesos) % 11) % 10;
}

function validarSp(digitos: number[]): boolean {
  if (digitos.length !== 12) return false;
  const dv1 = spDv(digitos.slice(0, 8), SP_PESOS_DV1);
  if (digitos[8] !== dv1) return false;
  const dv2 = spDv(digitos.slice(0, 11), SP_PESOS_DV2);
  return digitos[11] === dv2;
}

function gerarSp(rng: Rng): string {
  const base = Array.from({ length: 8 }, () => rng.int(0, 9));
  const dv1 = spDv(base, SP_PESOS_DV1);
  const meio = [rng.int(0, 9), rng.int(0, 9)];
  const onze = [...base, dv1, ...meio];
  const dv2 = spDv(onze, SP_PESOS_DV2);
  return [...onze, dv2].join('');
}

/** Generic modulo-11 check digit: weights cycle 2–9 from the right. */
function genericoDv(digitos: number[]): number {
  let soma = 0;
  let peso = 2;
  for (let i = digitos.length - 1; i >= 0; i--) {
    soma += (digitos[i] as number) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function validarGenerico(digitos: number[], comprimento: number): boolean {
  if (digitos.length !== comprimento) return false;
  const base = digitos.slice(0, comprimento - 1);
  return digitos[comprimento - 1] === genericoDv(base);
}

function gerarGenerico(rng: Rng, comprimento: number): string {
  const base = Array.from({ length: comprimento - 1 }, () => rng.int(0, 9));
  return [...base, genericoDv(base)].join('');
}

/** Validate an IE for a UF, accepting input with or without punctuation. */
export function validarInscricaoEstadual(valor: string, uf: UF): boolean {
  const digitos = apenasDigitos(valor).split('').map(Number);
  if (uf === 'SP') return validarSp(digitos);
  return validarGenerico(digitos, COMPRIMENTOS[uf]);
}

/** Generate a valid Inscrição Estadual for the given UF. */
export function gerarInscricaoEstadual(rng: Rng, uf: UF): string {
  if (uf === 'SP') return gerarSp(rng);
  return gerarGenerico(rng, COMPRIMENTOS[uf]);
}
