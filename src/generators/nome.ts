/** Personal-name generation backed by the weighted IBGE-inspired datasets. */

import { nomesFemininos, nomesMasculinos, sobrenomes } from '../data/index.js';
import type { Rng } from '../engine/prng.js';
import type { ItemPonderado } from '../types.js';

/** Binary gender used to pick a coherent given name. */
export type Genero = 'M' | 'F';

/** Options for {@link gerarNome}. */
export interface OpcoesNome {
  /** Force a gender; omitted means a random 50/50 choice. */
  genero?: Genero;
  /** Append surnames (default `true`). */
  sobrenome?: boolean;
}

function pesos(items: ItemPonderado[]): number[] {
  return items.map((i) => i.peso);
}

/** Pick a gender with even odds. */
export function escolherGenero(rng: Rng): Genero {
  return rng.bool() ? 'M' : 'F';
}

/** Draw a weighted first name for the given gender. */
export function primeiroNome(rng: Rng, genero: Genero): string {
  const lista = genero === 'M' ? nomesMasculinos : nomesFemininos;
  return rng.weightedPick(lista, pesos(lista)).nome;
}

/** Draw one weighted surname. */
export function sobrenome(rng: Rng): string {
  return rng.weightedPick(sobrenomes, pesos(sobrenomes)).nome;
}

/** Compose one or two distinct surnames (two ~60% of the time). */
export function sobrenomeCompleto(rng: Rng): string {
  const primeiro = sobrenome(rng);
  if (!rng.bool(0.6)) return primeiro;
  let segundo = sobrenome(rng);
  // Avoid a duplicated surname like "Silva Silva".
  for (
    let tentativas = 0;
    segundo === primeiro && tentativas < 5;
    tentativas++
  ) {
    segundo = sobrenome(rng);
  }
  return `${primeiro} ${segundo}`;
}

/** Generate a full name (given name plus surnames by default). */
export function gerarNome(rng: Rng, opcoes: OpcoesNome = {}): string {
  const genero = opcoes.genero ?? escolherGenero(rng);
  const primeiro = primeiroNome(rng, genero);
  if (opcoes.sobrenome === false) return primeiro;
  return `${primeiro} ${sobrenomeCompleto(rng)}`;
}
