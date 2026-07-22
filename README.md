# dados-br-faker

> Modern, TypeScript-first generator of **coherent** Brazilian fake data: the CEP belongs to the city, the city to the state, the phone's DDD to the region, the age to the birth date. Valid check digits, deterministic seeding, real tree-shaking, and first-class support for the **2026 alphanumeric CNPJ**.

[![npm version](https://img.shields.io/npm/v/dados-br-faker.svg)](https://www.npmjs.com/package/dados-br-faker)
[![CI](https://github.com/FranciscoCosta/dados-br-faker/actions/workflows/ci.yml/badge.svg)](https://github.com/FranciscoCosta/dados-br-faker/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/dados-br-faker)](https://bundlephobia.com/package/dados-br-faker)
[![types](https://img.shields.io/npm/types/dados-br-faker.svg)](https://www.npmjs.com/package/dados-br-faker)
[![license](https://img.shields.io/npm/l/dados-br-faker.svg)](https://github.com/FranciscoCosta/dados-br-faker/blob/main/LICENSE)
[![zero deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen.svg)](https://github.com/FranciscoCosta/dados-br-faker/blob/main/package.json)

🇧🇷 [Leia em português](https://github.com/FranciscoCosta/dados-br-faker/blob/main/docs/README.pt-BR.md)

![dados-br-faker in action](https://raw.githubusercontent.com/FranciscoCosta/dados-br-faker/main/docs/demo.gif)

## Why another Brazilian faker?

Existing libraries generate **isolated, incoherent** fields: a CEP from Curitiba next to a city in Manaus with a São Paulo DDD. For test fixtures, seeds, and demos that actually look real, incoherence is a bug.

`dados-br-faker` generates **internally coherent entities**. A `pessoa` has a CEP inside its city's real range, a phone DDD valid for that city, an age consistent with its birth date, and an email derived from its name.

```ts
import { createFaker } from 'dados-br-faker';

const faker = createFaker({ seed: 123 }); // deterministic; omit seed for random

faker.pessoa({ uf: 'PR' });
// {
//   nome: 'Lucas Ferreira Almeida',
//   cpf: '81529374026',                 // valid check digits
//   rg: '284679135',
//   dataNascimento: '1990-04-17',
//   idade: 36,                          // consistent with dataNascimento
//   genero: 'M',
//   email: 'lucas.almeida82@gmail.com', // derived from the name
//   telefone: { ddd: '41', numero: '9…', tipo: 'celular', formatado: '(41) 9…' },
//   endereco: {
//     logradouro: 'Rua das Flores', numero: '482', bairro: 'Centro',
//     cidade: 'Curitiba', uf: 'PR', estado: 'Paraná', regiao: 'Sul',
//     cep: '80420-130',                 // inside Curitiba's real CEP range
//   },
// }
```

Everything above is coherent by construction, and reproducible from the seed.

## Install

```bash
npm i -D dados-br-faker
# or: pnpm add -D dados-br-faker / yarn add -D dados-br-faker
```

Requires Node ≥ 18. Ships ESM + CJS + type declarations. **Zero runtime dependencies.**

## Two ways to use it

```ts
// 1) Deterministic instance, reproducible from a seed
import { createFaker } from 'dados-br-faker';
const faker = createFaker({ seed: 42 });
faker.cpf(); // same value every run for this seed/position

// 2) Standalone tree-shakeable functions, always random
import { cpf, pessoa } from 'dados-br-faker';
cpf(); // random each call
```

Importing a single function pulls in only its code: `import { cpf }` bundles to ~1.2 KB and does **not** include the municipality/name datasets.

## Comparison

To the best of our knowledge, as of July 2026:

| Feature                                | **dados-br-faker** | faker-br | js-brasil / fakerbr | @faker-js/faker (pt_BR) |
| -------------------------------------- | :----------------: | :------: | :-----------------: | :---------------------: |
| Coherent entities (CEP↔city↔state↔DDD) |         ✅         |    ❌    |         ❌          |           ❌            |
| Valid CPF/CNPJ check digits            |         ✅         |    ⚠️    |         ✅          |           ⚠️            |
| **Alphanumeric CNPJ (2026)**           |         ✅         |    ❌    |         ❌          |           ❌            |
| TypeScript-first (typed API)           |         ✅         |    ❌    |         ⚠️          |           ✅            |
| ESM + real tree-shaking                |         ✅         |    ❌    |         ⚠️          |           ✅            |
| Deterministic seed                     |         ✅         |    ❌    |         ❌          |           ✅            |
| Zero runtime deps                      |         ✅         |    ✅    |         ⚠️          |           ✅            |
| Actively maintained                    |         ✅         |    ❌    |         ⚠️          |           ✅            |

`@faker-js/faker` is an excellent, general-purpose library; its Brazilian locale simply generates **isolated** fields and does not aim for cross-field coherence or valid Brazilian documents. `dados-br-faker` is narrower and opinionated: coherence and correct documents are the whole point.

## The alphanumeric CNPJ (IN RFB nº 2.229/2024)

Since **2026-07-27**, newly issued CNPJs may be alphanumeric. `dados-br-faker` supports both formats:

```ts
faker.cnpj(); // '11222333000181'          (numeric, default)
faker.cnpj({ mascara: true }); // '11.222.333/0001-81'
faker.cnpj({ formato: 'alfanumerico' }); // '12ABC34501DE35'
faker.cnpj({ formato: 'alfanumerico', mascara: true }); // '12.ABC.345/01DE-35'

validarCnpj('12.ABC.345/01DE-35'); // true (validates both formats, with or without mask)
```

- Positions 1-8 (root) and 9-12 (branch) may be letters `A-Z` or digits; positions 13-14 (check digits) are always numeric.
- Check digits use modulo 11 with weights 2-9, converting each character by its ASCII value minus 48 (`'0'`-`'9'` → 0-9; `'A'` → 17 … `'Z'` → 42).

## API

### `createFaker(options?)`

```ts
const faker = createFaker({ seed?: number });
faker.seed(100); // re-seed; resets the sequence deterministically
```

Omitting `seed` makes the instance non-deterministic.

### Atomic generators

All option keys are in Portuguese. `mascara` toggles formatting.

| Method     | Signature                                   | Example output                          |
| ---------- | ------------------------------------------- | --------------------------------------- |
| `cpf`      | `(o?: { mascara? }) => string`              | `'52998224725'` / `'529.982.247-25'`    |
| `cnpj`     | `(o?: { mascara?, formato? }) => string`    | `'11222333000181'` / `'12ABC34501DE35'` |
| `rg`       | `(o?: { mascara? }) => string`              | `'246781312'` / `'24.678.131-2'`        |
| `cnh`      | `() => string`                              | `'69044271146'`                         |
| `cep`      | `(o?: { mascara? }) => string`              | `'80420130'` / `'80420-130'`            |
| `telefone` | `(o?: { mascara?, tipo?, ddd? }) => string` | `'11987654321'` / `'(11) 98765-4321'`   |
| `nome`     | `(o?: { genero?, sobrenome? }) => string`   | `'Helena Souza Lima'`                   |
| `email`    | `(o?: { nome?, provedor? }) => string`      | `'helena.lima23@gmail.com'`             |

- `formato`: `'numerico'` (default) or `'alfanumerico'`.
- `tipo`: `'celular'` (default) or `'fixo'`.
- `genero`: `'M'` or `'F'` (random if omitted).
- `sobrenome`: `false` returns only the first name.

### Coherent entities

```ts
faker.endereco(o?: { uf?, cidade?, regiao? }): Endereco
faker.pessoa(o?: { uf?, cidade?, regiao?, genero?, idadeMin?, idadeMax? }): Pessoa
faker.empresa(o?: { uf?, cidade?, regiao?, cnpjFormato? }): Empresa
```

Filters constrain **every** field coherently:

```ts
faker.pessoa({ uf: 'SC' }); // address, DDD, IE-less person all within Santa Catarina
faker.endereco({ cidade: 'Curitiba' });
faker.empresa({ uf: 'RS', cnpjFormato: 'alfanumerico' });
```

> Companies opened from July 2026 onward would use the alphanumeric CNPJ in real life, so pass `cnpjFormato: 'alfanumerico'` to seed realistic newly-registered companies.

Returned shapes: [`Endereco`](https://github.com/FranciscoCosta/dados-br-faker/blob/main/src/types.ts), [`Pessoa`](https://github.com/FranciscoCosta/dados-br-faker/blob/main/src/types.ts), [`Empresa`](https://github.com/FranciscoCosta/dados-br-faker/blob/main/src/types.ts), [`Telefone`](https://github.com/FranciscoCosta/dados-br-faker/blob/main/src/types.ts).

### Vehicles & banking

```ts
faker.placa(); // 'ABC1D23' (Mercosul), or { formato: 'antiga' } → 'ABC-1234'
faker.renavam(); // '54088307874', valid DENATRAN check digit
faker.veiculo(); // { marca, modelo, ano, cor, placa, renavam }

faker.chavePix(); // random UUID v4 (EVP key)
faker.chavePix({ tipo: 'telefone' }); // '+5511987654321'  (also 'cpf' | 'email')
faker.contaBancaria(); // { banco, codigoBanco, agencia, conta }
faker.boleto({ valor: 150.75 }); // { banco, valor, codigoBarras, linhaDigitavel }
```

Bank COMPE codes are real; the account check digit is a documented generic scheme (per-bank rules are not standardized). RENAVAM and boleto check digits are validated by `validarRenavam` and `validarLinhaDigitavel` (the boleto barcode/linha follows FEBRABAN, verified against real slips).

### Validators

```ts
import {
  validarCpf,
  validarCnpj,
  validarInscricaoEstadual,
  validarRenavam,
  validarLinhaDigitavel,
  validarCnh,
} from 'dados-br-faker';

validarCpf('529.982.247-25'); // true (with or without mask)
validarCnpj('12ABC34501DE35'); // true (numeric or alphanumeric)
validarInscricaoEstadual('110042490114', 'SP'); // true
validarRenavam('54088307874'); // true
validarLinhaDigitavel('10492006506100010004200997263900989810000021403'); // true
validarCnh('69044271146'); // true
```

## Recipes

### Prisma seed

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { createFaker } from 'dados-br-faker';

const prisma = new PrismaClient();
const faker = createFaker({ seed: 2026 }); // reproducible seed data

async function main() {
  for (let i = 0; i < 50; i++) {
    const p = faker.pessoa();
    await prisma.user.create({
      data: {
        name: p.nome,
        email: p.email,
        cpf: p.cpf,
        city: p.endereco.cidade,
        state: p.endereco.uf,
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
```

### Vitest

```ts
import { expect, test } from 'vitest';
import { createFaker } from 'dados-br-faker';

const faker = createFaker({ seed: 1 }); // deterministic fixtures

test('checkout accepts a valid customer', () => {
  const cliente = faker.pessoa({ uf: 'SP' });
  expect(cliente.endereco.uf).toBe('SP');
  // ...assert your business logic with realistic, coherent data
});
```

### MSW (mock API)

```ts
import { http, HttpResponse } from 'msw';
import { createFaker } from 'dados-br-faker';

const faker = createFaker({ seed: 7 });

export const handlers = [
  http.get('/api/clientes', () =>
    HttpResponse.json(Array.from({ length: 20 }, () => faker.pessoa())),
  ),
];
```

### Storybook

```ts
import { createFaker } from 'dados-br-faker';
const faker = createFaker({ seed: 42 }); // stable stories across reloads

export const Default = {
  args: { empresa: faker.empresa() },
};
```

Runnable versions live in [`examples/`](https://github.com/FranciscoCosta/dados-br-faker/tree/main/examples).

## Data & honesty

- **Documents** (CPF, CNPJ, IE-SP) have correct check digits, verified against known vectors and 1000+ property-tested samples.
- **Municipalities**: the 160 most populous cities, covering all 27 federative units, with names, UF, region, and population from **IBGE** (2025 estimates), area codes from the `municipios-brasileiros` dataset, and **real Correios CEP ranges** per city.
- **Names**: weighted by the **IBGE _Nomes no Brasil_** national frequency ranking (accented forms curated), plus a tail of modern given names.
- **RG** uses the São Paulo format; it is illustrative, not an official record. Brazil has no single national RG algorithm.
- **Inscrição Estadual**: **SP, RJ, and PR** follow their official SEFAZ algorithms (verified against real vectors); **AM, ES, PB, PI, RS, SC, SE** use the plain modulo-11 rule that is their official algorithm too. The remaining states use a self-consistent generic scheme sized to the state's IE length. These values are for coherent fixtures, not tax submission.

## License

[MIT](https://github.com/FranciscoCosta/dados-br-faker/blob/main/LICENSE)
