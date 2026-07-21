/** Coherent company generation. */

import type { Rng } from '../engine/prng.js';
import type { Empresa, Regiao, UF } from '../types.js';
import type { FormatoCnpj } from './cnpj.js';
import { gerarCnpj } from './cnpj.js';
import { gerarEndereco } from './endereco.js';
import { gerarInscricaoEstadual } from './inscricao-estadual.js';
import { encontrarMunicipio } from './municipio.js';
import { sobrenome } from './nome.js';
import { gerarTelefoneEstruturado } from './telefone.js';

/** Options for {@link gerarEmpresa}. */
export interface OpcoesEmpresa {
  uf?: UF;
  cidade?: string;
  regiao?: Regiao;
  /**
   * CNPJ format for the entity (default `'numerico'`). Companies opened from
   * July 2026 onward would use `'alfanumerico'` in real life — handy for
   * seeding realistic newly-registered companies.
   */
  cnpjFormato?: FormatoCnpj;
}

const RAMOS = [
  'Comércio',
  'Serviços',
  'Tecnologia',
  'Construções',
  'Alimentos',
  'Transportes',
  'Consultoria',
  'Indústria',
  'Logística',
  'Engenharia',
  'Distribuidora',
  'Representações',
];
const TIPOS_SOCIETARIOS = ['LTDA', 'ME', 'EIRELI', 'S.A.', 'EPP'];

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Generate a coherent company. */
export function gerarEmpresa(rng: Rng, opcoes: OpcoesEmpresa = {}): Empresa {
  const endereco = gerarEndereco(rng, {
    ...(opcoes.uf ? { uf: opcoes.uf } : {}),
    ...(opcoes.cidade ? { cidade: opcoes.cidade } : {}),
    ...(opcoes.regiao ? { regiao: opcoes.regiao } : {}),
  });

  const nomeFantasia = `${sobrenome(rng)} ${rng.pick(RAMOS)}`;
  const razaoSocial = `${nomeFantasia} ${rng.pick(TIPOS_SOCIETARIOS)}`;

  const municipio = encontrarMunicipio(endereco.cidade, endereco.uf);
  const telefone = gerarTelefoneEstruturado(rng, {
    ddd: rng.pick(municipio.ddds),
    tipo: rng.bool(0.6) ? 'fixo' : 'celular',
  });

  return {
    razaoSocial,
    nomeFantasia,
    cnpj: gerarCnpj(rng, { formato: opcoes.cnpjFormato ?? 'numerico' }),
    inscricaoEstadual: gerarInscricaoEstadual(rng, endereco.uf),
    endereco,
    telefone,
    email: `contato@${slug(nomeFantasia)}.com.br`,
  };
}
