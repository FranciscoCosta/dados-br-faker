/**
 * Inscrição Estadual (state tax registration) generation and validation.
 *
 * SP, RJ, and PR use their official SEFAZ algorithms (ported and verified
 * against real vectors from the `gammasoft/ie` library). A further set of
 * states — AM, ES, PB, PI, RS, SC, SE — use the plain modulo-11 "cálculo
 * trivial", which is exactly the generic scheme below, so those are correct
 * too. The remaining states use the generic modulo-11 scheme sized to the
 * state's official IE length: generator and validator agree by construction,
 * but the DV is not guaranteed to match that SEFAZ's exact rule. Values are for
 * coherent fake entities, not for submission to a tax authority.
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

/** Weighted sum with multipliers cycling from the right (SEFAZ convention). */
function modDireita(base: string, pesos: number[], divisor = 11): number {
  let soma = 0;
  let i = 0;
  for (let k = base.length - 1; k >= 0; k--) {
    soma += (pesos[i % pesos.length] as number) * Number(base[k]);
    i++;
  }
  return soma % divisor;
}

const dvSubtracao = (resto: number): number => (resto < 2 ? 0 : 11 - resto);
const RJ_PR_PESOS = [2, 3, 4, 5, 6, 7];

/** RJ: 8 digits, 7-digit base, weights 2–7, subtraction rule. */
function validarRj(digitos: number[]): boolean {
  if (digitos.length !== 8) return false;
  const base = digitos.slice(0, 7).join('');
  return digitos[7] === dvSubtracao(modDireita(base, RJ_PR_PESOS));
}

function gerarRj(rng: Rng): string {
  const base = Array.from({ length: 7 }, () => rng.int(0, 9)).join('');
  return `${base}${dvSubtracao(modDireita(base, RJ_PR_PESOS))}`;
}

/** PR check digit: `11 - resto`, but `>= 10` becomes 0. */
function prDv(base: string): number {
  const resto = 11 - modDireita(base, RJ_PR_PESOS);
  return resto >= 10 ? 0 : resto;
}

/** PR: 10 digits, 8-digit base, two check digits with weights 2–7. */
function validarPr(digitos: number[]): boolean {
  if (digitos.length !== 10) return false;
  const base = digitos.slice(0, 8).join('');
  const dv1 = prDv(base);
  const dv2 = prDv(`${base}${dv1}`);
  return digitos[8] === dv1 && digitos[9] === dv2;
}

function gerarPr(rng: Rng): string {
  const base = Array.from({ length: 8 }, () => rng.int(0, 9)).join('');
  const dv1 = prDv(base);
  const dv2 = prDv(`${base}${dv1}`);
  return `${base}${dv1}${dv2}`;
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
  if (uf === 'RJ') return validarRj(digitos);
  if (uf === 'PR') return validarPr(digitos);
  return validarGenerico(digitos, COMPRIMENTOS[uf]);
}

/** Generate a valid Inscrição Estadual for the given UF. */
export function gerarInscricaoEstadual(rng: Rng, uf: UF): string {
  if (uf === 'SP') return gerarSp(rng);
  if (uf === 'RJ') return gerarRj(rng);
  if (uf === 'PR') return gerarPr(rng);
  return gerarGenerico(rng, COMPRIMENTOS[uf]);
}
