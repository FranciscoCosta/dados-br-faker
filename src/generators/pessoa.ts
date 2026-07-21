/** Coherent person generation — the library's flagship entity. */

import type { Rng } from '../engine/prng.js';
import type { Pessoa, Regiao, UF } from '../types.js';
import { gerarCpf } from './cpf.js';
import { gerarEmail } from './email.js';
import { gerarEndereco } from './endereco.js';
import { encontrarMunicipio } from './municipio.js';
import type { Genero } from './nome.js';
import { escolherGenero, gerarNome } from './nome.js';
import { gerarRg } from './rg.js';
import { gerarTelefoneEstruturado } from './telefone.js';

/** Options for {@link gerarPessoa}. */
export interface OpcoesPessoa {
  uf?: UF;
  cidade?: string;
  regiao?: Regiao;
  genero?: Genero;
  /** Minimum age in years (default 18). */
  idadeMin?: number;
  /** Maximum age in years (default 80). */
  idadeMax?: number;
}

/** Full years between `nascimento` and `referencia`. */
export function calcularIdade(nascimento: Date, referencia: Date): number {
  let idade = referencia.getFullYear() - nascimento.getFullYear();
  const mes = referencia.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && referencia.getDate() < nascimento.getDate())) {
    idade -= 1;
  }
  return idade;
}

function formatarISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Generate a coherent person. */
export function gerarPessoa(rng: Rng, opcoes: OpcoesPessoa = {}): Pessoa {
  const genero = opcoes.genero ?? escolherGenero(rng);
  const nome = gerarNome(rng, { genero });

  const idadeMin = opcoes.idadeMin ?? 18;
  const idadeMax = opcoes.idadeMax ?? 80;
  const idadeAlvo = rng.int(idadeMin, idadeMax);

  const hoje = new Date();
  const nascimento = new Date(hoje);
  nascimento.setFullYear(hoje.getFullYear() - idadeAlvo);
  // Shift back up to a year so the target age is already reached today.
  nascimento.setDate(nascimento.getDate() - rng.int(0, 364));
  const idade = calcularIdade(nascimento, hoje);

  const endereco = gerarEndereco(rng, {
    ...(opcoes.uf ? { uf: opcoes.uf } : {}),
    ...(opcoes.cidade ? { cidade: opcoes.cidade } : {}),
    ...(opcoes.regiao ? { regiao: opcoes.regiao } : {}),
  });

  const municipio = encontrarMunicipio(endereco.cidade, endereco.uf);
  const telefone = gerarTelefoneEstruturado(rng, {
    ddd: rng.pick(municipio.ddds),
    tipo: rng.bool(0.8) ? 'celular' : 'fixo',
  });

  return {
    nome,
    cpf: gerarCpf(rng),
    rg: gerarRg(rng),
    dataNascimento: formatarISO(nascimento),
    idade,
    genero,
    email: gerarEmail(rng, { nome }),
    telefone,
    endereco,
  };
}
