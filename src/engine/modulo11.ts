/**
 * Modulo-11 check-digit helpers shared by CPF, CNPJ, and state-registration
 * (Inscrição Estadual) algorithms.
 */

/** Weighted sum of `valores` against `pesos` (same length required). */
export function somaPonderada(
  valores: readonly number[],
  pesos: readonly number[],
): number {
  if (valores.length !== pesos.length) {
    throw new Error('somaPonderada: valores and pesos must be the same length');
  }
  let soma = 0;
  for (let i = 0; i < valores.length; i++) {
    soma += (valores[i] as number) * (pesos[i] as number);
  }
  return soma;
}

/**
 * Standard CPF/CNPJ check digit: `remainder < 2 → 0`, otherwise `11 - remainder`.
 * Callers provide the value/weight pairing; for the alphanumeric CNPJ the values
 * are the ASCII-shifted character codes.
 */
export function dvModulo11(
  valores: readonly number[],
  pesos: readonly number[],
): number {
  const resto = somaPonderada(valores, pesos) % 11;
  return resto < 2 ? 0 : 11 - resto;
}
