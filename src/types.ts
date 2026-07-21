/** Shared public types for dados-br-faker. */

/** The 27 Brazilian federative units (26 states + Distrito Federal). */
export type UF =
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO';

/** The five Brazilian macro-regions. */
export type Regiao =
  | 'Norte'
  | 'Nordeste'
  | 'Centro-Oeste'
  | 'Sudeste'
  | 'Sul';

/** A weighted dataset entry (higher weight = more frequent). */
export interface ItemPonderado {
  nome: string;
  peso: number;
}

/** A structured phone number, exposed inside composite entities. */
export interface Telefone {
  /** Two-digit area code (DDD), coherent with the entity's city. */
  ddd: string;
  /** Local number without the DDD (9 digits for mobile, 8 for landline). */
  numero: string;
  tipo: 'celular' | 'fixo';
  /** Human-readable form, e.g. `(11) 98765-4321`. */
  formatado: string;
}

/** A coherent Brazilian address: CEP falls within the city's real range. */
export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: UF;
  /** Full state name, e.g. `Paraná`. */
  estado: string;
  regiao: Regiao;
  /** Masked CEP, e.g. `80010-000`. */
  cep: string;
}

/** A coherent person: DDD matches the city, age matches the birth date, etc. */
export interface Pessoa {
  nome: string;
  cpf: string;
  rg: string;
  /** ISO date `YYYY-MM-DD`. */
  dataNascimento: string;
  idade: number;
  genero: 'M' | 'F';
  /** Derived from the name, accent-stripped. */
  email: string;
  telefone: Telefone;
  endereco: Endereco;
}

/** A coherent company: IE follows the address UF, phone DDD matches the city. */
export interface Empresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: Endereco;
  telefone: Telefone;
  email: string;
}

/** A municipality with the data needed for coherent addresses and phones. */
export interface Municipio {
  nome: string;
  uf: UF;
  regiao: Regiao;
  /** Inclusive lower bound of the city CEP range, 8 digits. */
  cepInicio: string;
  /** Inclusive upper bound of the city CEP range, 8 digits. */
  cepFim: string;
  /** Valid area codes (DDD) for the municipality. */
  ddds: string[];
  /** Approximate population, used to weight random selection. */
  populacao: number;
}
