/** The seeded faker instance: one shared PRNG bound to every generator. */

import { createRandomRng, createRng } from './engine/prng.js';
import type { Rng } from './engine/prng.js';
import type { ContaBancaria, OpcoesChavePix } from './generators/banco.js';
import { gerarChavePix, gerarContaBancaria } from './generators/banco.js';
import type { Endereco, Empresa, Pessoa } from './types.js';
import type { OpcoesCep } from './generators/cep.js';
import { gerarCep } from './generators/cep.js';
import type { OpcoesCnpj } from './generators/cnpj.js';
import { gerarCnpj } from './generators/cnpj.js';
import type { OpcoesCpf } from './generators/cpf.js';
import { gerarCpf } from './generators/cpf.js';
import type { OpcoesEmail } from './generators/email.js';
import { gerarEmail } from './generators/email.js';
import type { OpcoesEndereco } from './generators/endereco.js';
import { gerarEndereco } from './generators/endereco.js';
import type { OpcoesEmpresa } from './generators/empresa.js';
import { gerarEmpresa } from './generators/empresa.js';
import type { OpcoesNome } from './generators/nome.js';
import { gerarNome } from './generators/nome.js';
import type { OpcoesPessoa } from './generators/pessoa.js';
import { gerarPessoa } from './generators/pessoa.js';
import type { OpcoesRg } from './generators/rg.js';
import { gerarRg } from './generators/rg.js';
import type { OpcoesTelefone } from './generators/telefone.js';
import { gerarTelefone } from './generators/telefone.js';
import type { OpcoesPlaca, Veiculo } from './generators/veiculo.js';
import {
  gerarPlaca,
  gerarRenavam,
  gerarVeiculo,
} from './generators/veiculo.js';

/** Options for {@link createFaker}. */
export interface OpcoesFaker {
  /** Seed for deterministic output; omitted means non-deterministic. */
  seed?: number;
}

/** A faker bound to a single (optionally seeded) PRNG stream. */
export interface Faker {
  cpf(opcoes?: OpcoesCpf): string;
  cnpj(opcoes?: OpcoesCnpj): string;
  rg(opcoes?: OpcoesRg): string;
  cep(opcoes?: OpcoesCep): string;
  telefone(opcoes?: OpcoesTelefone): string;
  nome(opcoes?: OpcoesNome): string;
  email(opcoes?: OpcoesEmail): string;
  endereco(opcoes?: OpcoesEndereco): Endereco;
  pessoa(opcoes?: OpcoesPessoa): Pessoa;
  empresa(opcoes?: OpcoesEmpresa): Empresa;
  placa(opcoes?: OpcoesPlaca): string;
  renavam(): string;
  veiculo(opcoes?: OpcoesPlaca): Veiculo;
  chavePix(opcoes?: OpcoesChavePix): string;
  contaBancaria(): ContaBancaria;
  /** Re-seed the stream, resetting the sequence deterministically. */
  seed(valor: number): void;
}

/** Create a faker instance. With a seed the output is fully reproducible. */
export function createFaker(opcoes: OpcoesFaker = {}): Faker {
  let rng: Rng =
    opcoes.seed !== undefined ? createRng(opcoes.seed) : createRandomRng();

  return {
    cpf: (o) => gerarCpf(rng, o),
    cnpj: (o) => gerarCnpj(rng, o),
    rg: (o) => gerarRg(rng, o),
    cep: (o) => gerarCep(rng, o),
    telefone: (o) => gerarTelefone(rng, o),
    nome: (o) => gerarNome(rng, o),
    email: (o) => gerarEmail(rng, o),
    endereco: (o) => gerarEndereco(rng, o),
    pessoa: (o) => gerarPessoa(rng, o),
    empresa: (o) => gerarEmpresa(rng, o),
    placa: (o) => gerarPlaca(rng, o),
    renavam: () => gerarRenavam(rng),
    veiculo: (o) => gerarVeiculo(rng, o),
    chavePix: (o) => gerarChavePix(rng, o),
    contaBancaria: () => gerarContaBancaria(rng),
    seed: (valor) => {
      rng = createRng(valor);
    },
  };
}
