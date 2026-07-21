/**
 * Municipality selection and CEP generation — the backbone of address/phone
 * coherence. Every composite entity starts by choosing a municipality here.
 */

import { municipios } from '../data/index.js';
import type { Rng } from '../engine/prng.js';
import type { Municipio, Regiao, UF } from '../types.js';

/** Filters shared by address-like generators. */
export interface FiltroMunicipio {
  uf?: UF;
  cidade?: string;
  regiao?: Regiao;
}

/** Normalize a city name for tolerant comparison (case/accent-insensitive). */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Select a municipality matching the filter, weighted by population. */
export function selecionarMunicipio(
  rng: Rng,
  filtro: FiltroMunicipio,
): Municipio {
  const cidadeAlvo = filtro.cidade ? normalizar(filtro.cidade) : undefined;
  const candidatos = municipios.filter((m) => {
    if (filtro.uf && m.uf !== filtro.uf) return false;
    if (filtro.regiao && m.regiao !== filtro.regiao) return false;
    if (cidadeAlvo && normalizar(m.nome) !== cidadeAlvo) return false;
    return true;
  });

  if (candidatos.length === 0) {
    const alvo = filtro.cidade ?? filtro.uf ?? filtro.regiao ?? 'filtro';
    throw new Error(`selecionarMunicipio: nenhum município para "${alvo}"`);
  }

  return rng.weightedPick(
    candidatos,
    candidatos.map((m) => m.populacao),
  );
}

/** Find a municipality by exact name (optionally disambiguated by UF). */
export function encontrarMunicipio(nome: string, uf?: UF): Municipio {
  const m = municipios.find(
    (mun) => mun.nome === nome && (uf === undefined || mun.uf === uf),
  );
  if (!m) throw new Error(`encontrarMunicipio: "${nome}" não encontrado`);
  return m;
}

/** Generate an 8-digit CEP within the inclusive `[inicio, fim]` range. */
export function gerarCepNaFaixa(rng: Rng, inicio: string, fim: string): string {
  const valor = rng.int(Number(inicio), Number(fim));
  return String(valor).padStart(8, '0');
}
