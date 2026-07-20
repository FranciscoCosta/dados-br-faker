import { describe, expect, it } from 'vitest';
import {
  aplicarMascara,
  apenasAlfanumerico,
  apenasDigitos,
} from '../../src/engine/mascara.js';

describe('aplicarMascara', () => {
  it('fills # placeholders in order, keeping literals', () => {
    expect(aplicarMascara('52998224725', '###.###.###-##')).toBe(
      '529.982.247-25',
    );
  });

  it('formats a CNPJ regardless of digit/letter content', () => {
    expect(aplicarMascara('12ABC34501DE35', '##.###.###/####-##')).toBe(
      '12.ABC.345/01DE-35',
    );
  });
});

describe('apenasDigitos', () => {
  it('strips everything but digits', () => {
    expect(apenasDigitos('529.982.247-25')).toBe('52998224725');
  });
});

describe('apenasAlfanumerico', () => {
  it('keeps uppercase letters and digits, drops punctuation', () => {
    expect(apenasAlfanumerico('12.ABC.345/01DE-35')).toBe('12ABC34501DE35');
  });

  it('uppercases lowercase input', () => {
    expect(apenasAlfanumerico('12abc.345/01de-35')).toBe('12ABC34501DE35');
  });
});
