/** Coherent address generation. */

import {
  bairros,
  estados,
  nomesLogradouro,
  tiposLogradouro,
} from '../data/index.js';
import { aplicarMascara } from '../engine/mascara.js';
import type { Rng } from '../engine/prng.js';
import type { Endereco } from '../types.js';
import type { FiltroMunicipio } from './municipio.js';
import { gerarCepNaFaixa, selecionarMunicipio } from './municipio.js';

/** Options for {@link gerarEndereco}. */
export type OpcoesEndereco = FiltroMunicipio;

const MASCARA_CEP = '#####-###';

function gerarComplemento(rng: Rng): string {
  const tipo = rng.pick(['Apto', 'Casa', 'Bloco', 'Sala', 'Fundos']);
  if (tipo === 'Casa' || tipo === 'Fundos') return tipo;
  return `${tipo} ${rng.int(1, 300)}`;
}

/** Generate an address coherent with the selected municipality. */
export function gerarEndereco(rng: Rng, opcoes: OpcoesEndereco = {}): Endereco {
  const municipio = selecionarMunicipio(rng, opcoes);

  const tipo = rng.weightedPick(
    tiposLogradouro,
    tiposLogradouro.map((t) => t.peso),
  ).nome;
  const logradouro = `${tipo} ${rng.pick(nomesLogradouro)}`;
  const numero = rng.bool(0.05) ? 's/n' : String(rng.int(1, 9999));
  const cepDigitos = gerarCepNaFaixa(
    rng,
    municipio.cepInicio,
    municipio.cepFim,
  );

  const endereco: Endereco = {
    logradouro,
    numero,
    bairro: rng.pick(bairros),
    cidade: municipio.nome,
    uf: municipio.uf,
    estado: estados[municipio.uf],
    regiao: municipio.regiao,
    cep: aplicarMascara(cepDigitos, MASCARA_CEP),
  };

  // Include a complemento roughly a third of the time.
  if (rng.bool(0.33)) {
    endereco.complemento = gerarComplemento(rng);
  }

  return endereco;
}
