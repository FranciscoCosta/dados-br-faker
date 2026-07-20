/**
 * String masking helpers shared by the document generators.
 *
 * A mask uses `#` as an ordered placeholder consumed from the raw value; every
 * other character is emitted literally. This works for numeric documents (CPF,
 * CEP) and for the alphanumeric CNPJ alike, since it never inspects the value.
 */

/** Apply a `#`-placeholder mask to a raw value. */
export function aplicarMascara(valor: string, mascara: string): string {
  let i = 0;
  let out = '';
  for (const ch of mascara) {
    if (ch === '#') {
      out += valor[i] ?? '';
      i += 1;
    } else {
      out += ch;
    }
  }
  return out;
}

/** Keep only the decimal digits of a value. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Keep only ASCII letters and digits, uppercasing the result. */
export function apenasAlfanumerico(valor: string): string {
  return valor.toUpperCase().replace(/[^0-9A-Z]/g, '');
}
