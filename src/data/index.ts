/**
 * Typed accessors over the raw JSON datasets.
 *
 * The JSON files live alongside this module so they remain language-neutral and
 * reusable by the sibling Composer (PHP) package. This module is the only place
 * that couples them to TypeScript types.
 */

import type { ItemPonderado, Municipio, UF } from '../types.js';
import bairrosData from './bairros.json';
import estadosData from './estados.json';
import logradourosData from './logradouros.json';
import municipiosData from './municipios.json';
import nomesData from './nomes.json';
import sobrenomesData from './sobrenomes.json';
import veiculosData from './veiculos.json';

export const nomesMasculinos: ItemPonderado[] = nomesData.masculinos;
export const nomesFemininos: ItemPonderado[] = nomesData.femininos;
export const sobrenomes: ItemPonderado[] = sobrenomesData.sobrenomes;
export const municipios: Municipio[] = municipiosData.municipios as Municipio[];
export const tiposLogradouro: ItemPonderado[] = logradourosData.tipos;
export const nomesLogradouro: string[] = logradourosData.nomes;
export const bairros: string[] = bairrosData.bairros;
export const estados: Record<UF, string> = estadosData.estados as Record<
  UF,
  string
>;
export const modelosVeiculo: { marca: string; modelo: string }[] =
  veiculosData.modelos;
export const coresVeiculo: string[] = veiculosData.cores;
