/** CEP generation. Values fall within a real municipality's range. */

import { aplicarMascara } from '../engine/mascara.js';
import type { Rng } from '../engine/prng.js';
import { gerarCepNaFaixa, selecionarMunicipio } from './municipio.js';

/** Options for {@link gerarCep}. */
export interface OpcoesCep {
  /** Format the result as `80010-000` instead of the bare digits. */
  mascara?: boolean;
}

const MASCARA_CEP = '#####-###';

/** Generate a CEP within a population-weighted random municipality's range. */
export function gerarCep(rng: Rng, opcoes: OpcoesCep = {}): string {
  const municipio = selecionarMunicipio(rng, {});
  const cep = gerarCepNaFaixa(rng, municipio.cepInicio, municipio.cepFim);
  return opcoes.mascara ? aplicarMascara(cep, MASCARA_CEP) : cep;
}
