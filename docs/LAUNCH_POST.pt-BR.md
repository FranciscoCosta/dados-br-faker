# Rascunho — Post de lançamento (PT)

Rascunho para TabNews / LinkedIn / dev.to. Ajuste o tom por canal e substitua o
link do repositório. Gancho: o CNPJ alfanumérico é notícia quente e nenhuma lib
concorrente o suporta.

---

## Versão TabNews / dev.to

**Título:** O novo CNPJ com letras entrou em produção — seus testes já geram dados nesse formato?

Desde 27/07/2026, a Receita passou a emitir **CNPJ alfanumérico** (IN RFB nº 2.229/2024). As bibliotecas de dados fake brasileiras que a gente usa em teste ainda não geram nada nesse formato — e a maioria nunca gerou dados **coerentes** para começo de conversa.

Esse foi o empurrão pra eu lançar o **`dados-br-faker`**: um gerador de dados fake brasileiros, TypeScript-first, com um diferencial que faltava — **coerência entre os campos**.

### O problema

As libs existentes geram campos isolados. Você pede um "cliente" e recebe um CEP de Curitiba, cidade de Manaus e DDD de São Paulo — tudo no mesmo objeto. Pra fixture de teste, seed de banco e mock de API, isso é bug.

### A ideia

O `dados-br-faker` gera **entidades internamente coerentes**:

```ts
import { createFaker } from 'dados-br-faker';

const faker = createFaker({ seed: 123 }); // determinístico

faker.pessoa({ uf: 'PR' });
// nome, cpf (DV válido), rg, dataNascimento, idade (bate com a data),
// email (derivado do nome), telefone.ddd (válido pra cidade),
// endereco.cep (dentro da faixa real da cidade) — tudo coerente.
```

O CEP pertence à cidade, a cidade ao estado, o DDD à região, a idade à data de nascimento. E, com `seed`, é 100% reproduzível.

### O gancho de 2026: CNPJ alfanumérico

```ts
faker.cnpj(); // '11222333000181'  (numérico, padrão)
faker.cnpj({ formato: 'alfanumerico' }); // '12ABC34501DE35'  (novo formato)

validarCnpj('12.ABC.345/01DE-35'); // true — valida os dois formatos
```

O DV segue o módulo 11 com conversão ASCII-48 das letras (A=17, B=18…), como manda a IN. Dá até pra seedar "empresas recém-abertas" realistas:

```ts
faker.empresa({ uf: 'SP', cnpjFormato: 'alfanumerico' });
```

### Por que usar

- **Coerência** entre campos (o diferencial).
- **CPF/CNPJ com DV válido** — inclusive o alfanumérico de 2026.
- **TypeScript-first**, autocomplete impecável.
- **Determinístico por seed** — testes reproduzíveis.
- **ESM + tree-shaking real** — importar só `cpf` gera ~1,2 KB.
- **Zero dependências de runtime.**

### Onde

- npm: `npm i -D dados-br-faker`
- Repositório: https://github.com/<OWNER>/dados-br-faker

Feedback e contribuições são muito bem-vindos. Se você mantém seeds de banco ou mocks de API pra produto brasileiro, testa aí e me conta.

---

## Versão LinkedIn (curta)

O **CNPJ alfanumérico** entrou em produção (IN RFB nº 2.229/2024, desde 27/07/2026) — e as libs de dados fake brasileiras não acompanharam.

Lancei o **`dados-br-faker`**: gerador de dados fake BR, TypeScript-first, com o diferencial que faltava — **coerência entre os campos** (o CEP pertence à cidade, o DDD à região, a idade à data de nascimento) — além de CPF/CNPJ com dígito verificador válido, **suporte ao novo CNPJ alfanumérico**, seed determinística e tree-shaking real.

```ts
const faker = createFaker({ seed: 123 });
faker.pessoa({ uf: 'PR' }); // tudo coerente e reproduzível
faker.cnpj({ formato: 'alfanumerico' }); // '12ABC34501DE35'
```

`npm i -D dados-br-faker` · repo nos comentários. Zero deps de runtime, MIT.

#typescript #testing #brasil #opensource #cnpj
