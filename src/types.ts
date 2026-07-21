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
