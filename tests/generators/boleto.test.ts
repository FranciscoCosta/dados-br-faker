import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/prng.js';
import {
  gerarBoleto,
  validarLinhaDigitavel,
} from '../../src/generators/boleto.js';

// Real barcode/linha pair (bank 104 Caixa), verified against mrmgomes/boleto-utils.
const LINHA_REAL = '10492006506100010004200997263900989810000021403';

describe('validarLinhaDigitavel', () => {
  it('accepts a known-valid linha digitável (raw and formatted)', () => {
    expect(validarLinhaDigitavel(LINHA_REAL)).toBe(true);
    expect(
      validarLinhaDigitavel(
        '10492.00650 61000.100042 00997.263900 9 89810000021403',
      ),
    ).toBe(true);
  });

  it('rejects a linha with a corrupted field check digit', () => {
    const ruim = `${LINHA_REAL.slice(0, 9)}${(Number(LINHA_REAL[9]) + 1) % 10}${LINHA_REAL.slice(10)}`;
    expect(validarLinhaDigitavel(ruim)).toBe(false);
  });

  it('rejects the wrong length', () => {
    expect(validarLinhaDigitavel('123')).toBe(false);
  });
});

describe('gerarBoleto', () => {
  it('is deterministic for a given seed', () => {
    expect(gerarBoleto(createRng(1))).toEqual(gerarBoleto(createRng(1)));
  });

  it('produces a 44-digit barcode and a formatted, valid linha digitável', () => {
    const b = gerarBoleto(createRng(5));
    expect(b.codigoBarras).toMatch(/^\d{44}$/);
    expect(b.linhaDigitavel).toMatch(
      /^\d{5}\.\d{5} \d{5}\.\d{6} \d{5}\.\d{6} \d \d{14}$/,
    );
    expect(validarLinhaDigitavel(b.linhaDigitavel)).toBe(true);
  });

  it('property: 1000 generated boletos have valid linhas digitáveis', () => {
    const rng = createRng(2024);
    for (let i = 0; i < 1000; i++) {
      expect(validarLinhaDigitavel(gerarBoleto(rng).linhaDigitavel)).toBe(true);
    }
  });

  it('encodes the requested value', () => {
    const b = gerarBoleto(createRng(3), { valor: 150.75 });
    expect(b.valor).toBe(150.75);
    // value occupies the last 10 digits of the barcode (in cents).
    expect(b.codigoBarras.slice(19, 19 + 25).length).toBe(25);
    expect(b.codigoBarras.slice(9, 19)).toBe('0000015075');
  });
});
