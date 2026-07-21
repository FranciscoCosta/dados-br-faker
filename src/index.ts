/**
 * dados-br-faker — Modern, TypeScript-first Brazilian fake-data generator
 * with internally coherent entities, valid check digits, deterministic
 * seeding, and support for the alphanumeric CNPJ (IN RFB nº 2.229/2024).
 *
 * Two ways to use it:
 *   - `createFaker({ seed })` for a deterministic instance.
 *   - Standalone tree-shakeable functions (always random).
 */

import { createRandomRng } from './engine/prng.js';
import { gerarCep } from './generators/cep.js';
import { gerarCnpj } from './generators/cnpj.js';
import { gerarCpf } from './generators/cpf.js';
import { gerarEmail } from './generators/email.js';
import { gerarEndereco } from './generators/endereco.js';
import { gerarEmpresa } from './generators/empresa.js';
import { gerarNome } from './generators/nome.js';
import { gerarPessoa } from './generators/pessoa.js';
import { gerarRg } from './generators/rg.js';
import { gerarTelefone } from './generators/telefone.js';
import { gerarInscricaoEstadual } from './generators/inscricao-estadual.js';
import {
  gerarPlaca,
  gerarRenavam,
  gerarVeiculo,
} from './generators/veiculo.js';

import type { OpcoesCep } from './generators/cep.js';
import type { OpcoesCnpj } from './generators/cnpj.js';
import type { OpcoesCpf } from './generators/cpf.js';
import type { OpcoesEmail } from './generators/email.js';
import type { OpcoesEndereco } from './generators/endereco.js';
import type { OpcoesEmpresa } from './generators/empresa.js';
import type { OpcoesNome } from './generators/nome.js';
import type { OpcoesPessoa } from './generators/pessoa.js';
import type { OpcoesRg } from './generators/rg.js';
import type { OpcoesTelefone } from './generators/telefone.js';
import type { OpcoesPlaca, Veiculo } from './generators/veiculo.js';
import type { Endereco, Empresa, Pessoa, UF } from './types.js';

/** Library version, kept in sync with package.json at release time. */
export const version = '0.1.0';

// --- Seeded instance -------------------------------------------------------
export { createFaker } from './faker.js';
export type { Faker, OpcoesFaker } from './faker.js';

// --- Standalone generators (always random) ---------------------------------

/** Generate a random valid CPF. Use {@link createFaker} for deterministic output. */
export const cpf = (opcoes?: OpcoesCpf): string =>
  gerarCpf(createRandomRng(), opcoes);

/** Generate a random valid CNPJ (numeric or `formato: 'alfanumerico'`). */
export const cnpj = (opcoes?: OpcoesCnpj): string =>
  gerarCnpj(createRandomRng(), opcoes);

/** Generate a random RG (São Paulo format; illustrative, not official). */
export const rg = (opcoes?: OpcoesRg): string =>
  gerarRg(createRandomRng(), opcoes);

/** Generate a random CEP inside a real municipality's range. */
export const cep = (opcoes?: OpcoesCep): string =>
  gerarCep(createRandomRng(), opcoes);

/** Generate a random phone number (mobile by default). */
export const telefone = (opcoes?: OpcoesTelefone): string =>
  gerarTelefone(createRandomRng(), opcoes);

/** Generate a random full name from the weighted datasets. */
export const nome = (opcoes?: OpcoesNome): string =>
  gerarNome(createRandomRng(), opcoes);

/** Generate a random email, derived from a name when provided. */
export const email = (opcoes?: OpcoesEmail): string =>
  gerarEmail(createRandomRng(), opcoes);

/** Generate a coherent random address (CEP within the city's range). */
export const endereco = (opcoes?: OpcoesEndereco): Endereco =>
  gerarEndereco(createRandomRng(), opcoes);

/** Generate a coherent random person (DDD↔city, age↔birth date, email↔name). */
export const pessoa = (opcoes?: OpcoesPessoa): Pessoa =>
  gerarPessoa(createRandomRng(), opcoes);

/** Generate a coherent random company (IE↔UF, DDD↔city). */
export const empresa = (opcoes?: OpcoesEmpresa): Empresa =>
  gerarEmpresa(createRandomRng(), opcoes);

/** Generate a valid Inscrição Estadual for a given UF. */
export const inscricaoEstadual = (uf: UF): string =>
  gerarInscricaoEstadual(createRandomRng(), uf);

/** Generate a random license plate (Mercosul by default). */
export const placa = (opcoes?: OpcoesPlaca): string =>
  gerarPlaca(createRandomRng(), opcoes);

/** Generate a random valid 11-digit RENAVAM. */
export const renavam = (): string => gerarRenavam(createRandomRng());

/** Generate a random vehicle with a valid RENAVAM. */
export const veiculo = (opcoes?: OpcoesPlaca): Veiculo =>
  gerarVeiculo(createRandomRng(), opcoes);

// --- Validators ------------------------------------------------------------
export { validarCpf } from './generators/cpf.js';
export { validarCnpj } from './generators/cnpj.js';
export { validarInscricaoEstadual } from './generators/inscricao-estadual.js';
export { validarRenavam } from './generators/veiculo.js';

// --- Types -----------------------------------------------------------------
export type {
  Endereco,
  Empresa,
  Pessoa,
  Telefone,
  Municipio,
  UF,
  Regiao,
} from './types.js';
export type { OpcoesCpf } from './generators/cpf.js';
export type { OpcoesCnpj, FormatoCnpj } from './generators/cnpj.js';
export type { OpcoesRg } from './generators/rg.js';
export type { OpcoesCep } from './generators/cep.js';
export type { OpcoesTelefone, TipoTelefone } from './generators/telefone.js';
export type { OpcoesNome, Genero } from './generators/nome.js';
export type { OpcoesEmail } from './generators/email.js';
export type { OpcoesEndereco } from './generators/endereco.js';
export type { OpcoesPessoa } from './generators/pessoa.js';
export type { OpcoesEmpresa } from './generators/empresa.js';
export type {
  OpcoesPlaca,
  FormatoPlaca,
  Veiculo,
} from './generators/veiculo.js';
