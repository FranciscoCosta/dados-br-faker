# dados-br-faker

> Gerador moderno e TypeScript-first de dados fake brasileiros **coerentes**: o CEP pertence à cidade, a cidade ao estado, o DDD do telefone à região, a idade à data de nascimento. Dígitos verificadores válidos, geração determinística por seed, tree-shaking real e suporte pioneiro ao **CNPJ alfanumérico de 2026**.

[![npm version](https://img.shields.io/npm/v/dados-br-faker.svg)](https://www.npmjs.com/package/dados-br-faker)
[![CI](https://github.com/FranciscoCosta/dados-br-faker/actions/workflows/ci.yml/badge.svg)](https://github.com/FranciscoCosta/dados-br-faker/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/dados-br-faker)](https://bundlephobia.com/package/dados-br-faker)
[![types](https://img.shields.io/npm/types/dados-br-faker.svg)](https://www.npmjs.com/package/dados-br-faker)
[![license](https://img.shields.io/npm/l/dados-br-faker.svg)](./LICENSE)
[![zero deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen.svg)](./package.json)

🇺🇸 [Read in English](./README.md)

## Por que mais um faker brasileiro?

As bibliotecas existentes geram campos **isolados e incoerentes**: um CEP de Curitiba ao lado de uma cidade de Manaus com DDD de São Paulo. Para fixtures de teste, seeds e demos que pareçam reais, incoerência é bug.

O `dados-br-faker` gera **entidades internamente coerentes**. Uma `pessoa` tem CEP dentro da faixa real da sua cidade, DDD válido para essa cidade, idade consistente com a data de nascimento e e-mail derivado do nome.

```ts
import { createFaker } from 'dados-br-faker';

const faker = createFaker({ seed: 123 }); // determinístico; sem seed = aleatório

faker.pessoa({ uf: 'PR' });
// {
//   nome: 'Lucas Ferreira Almeida',
//   cpf: '81529374026',                 // dígitos verificadores válidos
//   rg: '284679135',
//   dataNascimento: '1990-04-17',
//   idade: 36,                          // consistente com dataNascimento
//   genero: 'M',
//   email: 'lucas.almeida82@gmail.com', // derivado do nome
//   telefone: { ddd: '41', numero: '9…', tipo: 'celular', formatado: '(41) 9…' },
//   endereco: {
//     logradouro: 'Rua das Flores', numero: '482', bairro: 'Centro',
//     cidade: 'Curitiba', uf: 'PR', estado: 'Paraná', regiao: 'Sul',
//     cep: '80420-130',                 // dentro da faixa real de Curitiba
//   },
// }
```

Tudo acima é coerente por construção e reproduzível a partir da seed.

## Instalação

```bash
npm i -D dados-br-faker
# ou: pnpm add -D dados-br-faker / yarn add -D dados-br-faker
```

Requer Node ≥ 18. Distribui ESM + CJS + tipos. **Zero dependências de runtime.**

## Duas formas de usar

```ts
// 1) Instância determinística, reproduzível a partir de uma seed
import { createFaker } from 'dados-br-faker';
const faker = createFaker({ seed: 42 });
faker.cpf(); // mesmo valor a cada execução para esta seed/posição

// 2) Funções standalone tree-shakeable, sempre aleatórias
import { cpf, pessoa } from 'dados-br-faker';
cpf(); // aleatório a cada chamada
```

Importar uma única função traz só o código dela: `import { cpf }` gera um bundle de ~1,2 KB e **não** inclui os datasets de municípios/nomes.

## Comparação

Até onde sabemos, em julho de 2026:

| Recurso                                     | **dados-br-faker** | faker-br | js-brasil / fakerbr | @faker-js/faker (pt_BR) |
| ------------------------------------------- | :----------------: | :------: | :-----------------: | :---------------------: |
| Entidades coerentes (CEP↔cidade↔estado↔DDD) |         ✅         |    ❌    |         ❌          |           ❌            |
| CPF/CNPJ com DV válido                      |         ✅         |    ⚠️    |         ✅          |           ⚠️            |
| **CNPJ alfanumérico (2026)**                |         ✅         |    ❌    |         ❌          |           ❌            |
| TypeScript-first (API tipada)               |         ✅         |    ❌    |         ⚠️          |           ✅            |
| ESM + tree-shaking real                     |         ✅         |    ❌    |         ⚠️          |           ✅            |
| Seed determinística                         |         ✅         |    ❌    |         ❌          |           ✅            |
| Zero deps de runtime                        |         ✅         |    ✅    |         ⚠️          |           ✅            |
| Manutenção ativa                            |         ✅         |    ❌    |         ⚠️          |           ✅            |

O `@faker-js/faker` é uma excelente biblioteca de propósito geral; o locale brasileiro apenas gera campos **isolados**, sem buscar coerência entre campos nem documentos brasileiros válidos. O `dados-br-faker` é mais estreito e opinativo: coerência e documentos corretos são o objetivo central.

## O CNPJ alfanumérico (IN RFB nº 2.229/2024)

Desde **27/07/2026**, novos CNPJs podem ser alfanuméricos. O `dados-br-faker` suporta os dois formatos:

```ts
faker.cnpj(); // '11222333000181'          (numérico, padrão)
faker.cnpj({ mascara: true }); // '11.222.333/0001-81'
faker.cnpj({ formato: 'alfanumerico' }); // '12ABC34501DE35'
faker.cnpj({ formato: 'alfanumerico', mascara: true }); // '12.ABC.345/01DE-35'

validarCnpj('12.ABC.345/01DE-35'); // true (valida ambos os formatos, com ou sem máscara)
```

- Posições 1-8 (raiz) e 9-12 (ordem/filial) podem ser letras `A-Z` ou dígitos; posições 13-14 (verificadores) são sempre numéricas.
- O DV usa módulo 11 com pesos 2-9, convertendo cada caractere pelo valor ASCII menos 48 (`'0'`-`'9'` → 0-9; `'A'` → 17 … `'Z'` → 42).

## API

### `createFaker(opcoes?)`

```ts
const faker = createFaker({ seed?: number });
faker.seed(100); // re-seed; reinicia a sequência deterministicamente
```

Sem `seed`, a instância é não-determinística.

### Geradores atômicos

Todas as chaves de opção estão em português. `mascara` alterna a formatação.

| Método     | Assinatura                                  | Exemplo                                 |
| ---------- | ------------------------------------------- | --------------------------------------- |
| `cpf`      | `(o?: { mascara? }) => string`              | `'52998224725'` / `'529.982.247-25'`    |
| `cnpj`     | `(o?: { mascara?, formato? }) => string`    | `'11222333000181'` / `'12ABC34501DE35'` |
| `rg`       | `(o?: { mascara? }) => string`              | `'246781312'` / `'24.678.131-2'`        |
| `cnh`      | `() => string`                              | `'69044271146'`                         |
| `cep`      | `(o?: { mascara? }) => string`              | `'80420130'` / `'80420-130'`            |
| `telefone` | `(o?: { mascara?, tipo?, ddd? }) => string` | `'11987654321'` / `'(11) 98765-4321'`   |
| `nome`     | `(o?: { genero?, sobrenome? }) => string`   | `'Helena Souza Lima'`                   |
| `email`    | `(o?: { nome?, provedor? }) => string`      | `'helena.lima23@gmail.com'`             |

- `formato`: `'numerico'` (padrão) ou `'alfanumerico'`.
- `tipo`: `'celular'` (padrão) ou `'fixo'`.
- `genero`: `'M'` ou `'F'` (aleatório se omitido).
- `sobrenome`: `false` retorna só o primeiro nome.

### Entidades coerentes

```ts
faker.endereco(o?: { uf?, cidade?, regiao? }): Endereco
faker.pessoa(o?: { uf?, cidade?, regiao?, genero?, idadeMin?, idadeMax? }): Pessoa
faker.empresa(o?: { uf?, cidade?, regiao?, cnpjFormato? }): Empresa
```

Os filtros restringem **todos** os campos de forma coerente:

```ts
faker.pessoa({ uf: 'SC' }); // endereço e DDD todos dentro de Santa Catarina
faker.endereco({ cidade: 'Curitiba' });
faker.empresa({ uf: 'RS', cnpjFormato: 'alfanumerico' });
```

> Empresas abertas a partir de julho/2026 usariam o CNPJ alfanumérico na vida real, então passe `cnpjFormato: 'alfanumerico'` para seeds realistas de empresas recém-abertas.

Formatos de retorno: [`Endereco`](./src/types.ts), [`Pessoa`](./src/types.ts), [`Empresa`](./src/types.ts), [`Telefone`](./src/types.ts).

### Veículos & bancário

```ts
faker.placa(); // 'ABC1D23' (Mercosul), ou { formato: 'antiga' } → 'ABC-1234'
faker.renavam(); // '54088307874', DV DENATRAN válido
faker.veiculo(); // { marca, modelo, ano, cor, placa, renavam }

faker.chavePix(); // UUID v4 aleatória (chave EVP)
faker.chavePix({ tipo: 'telefone' }); // '+5511987654321'  (também 'cpf' | 'email')
faker.contaBancaria(); // { banco, codigoBanco, agencia, conta }
faker.boleto({ valor: 150.75 }); // { banco, valor, codigoBarras, linhaDigitavel }
```

Os códigos COMPE dos bancos são reais; o DV da conta é um esquema genérico documentado (as regras por banco não são padronizadas). Os DVs do RENAVAM e do boleto são validáveis por `validarRenavam` e `validarLinhaDigitavel` (o algoritmo do boleto segue a FEBRABAN, verificado contra boletos reais).

### Validadores

```ts
import {
  validarCpf,
  validarCnpj,
  validarInscricaoEstadual,
  validarRenavam,
  validarLinhaDigitavel,
  validarCnh,
} from 'dados-br-faker';

validarCpf('529.982.247-25'); // true (com ou sem máscara)
validarCnpj('12ABC34501DE35'); // true (numérico ou alfanumérico)
validarInscricaoEstadual('110042490114', 'SP'); // true
validarRenavam('54088307874'); // true
validarLinhaDigitavel('10492006506100010004200997263900989810000021403'); // true
validarCnh('69044271146'); // true
```

## Receitas

### Seed do Prisma

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { createFaker } from 'dados-br-faker';

const prisma = new PrismaClient();
const faker = createFaker({ seed: 2026 }); // dados de seed reproduzíveis

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

const faker = createFaker({ seed: 1 }); // fixtures determinísticas

test('checkout aceita um cliente válido', () => {
  const cliente = faker.pessoa({ uf: 'SP' });
  expect(cliente.endereco.uf).toBe('SP');
  // ...valide sua regra de negócio com dados realistas e coerentes
});
```

### MSW (mock de API)

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
const faker = createFaker({ seed: 42 }); // stories estáveis entre reloads

export const Default = {
  args: { empresa: faker.empresa() },
};
```

Versões executáveis estão em [`examples/`](./examples).

## Dados & honestidade

- **Documentos** (CPF, CNPJ, IE-SP) têm DV correto, verificados contra vetores conhecidos e 1000+ amostras em testes de propriedade.
- **Municípios**: as 160 cidades mais populosas, cobrindo as 27 unidades federativas, com nome, UF, região e população do **IBGE** (estimativas 2025), DDD do dataset `municipios-brasileiros` e **faixas de CEP reais dos Correios** por cidade.
- **Nomes**: ponderados pelo ranking de frequência nacional do **IBGE _Nomes no Brasil_** (formas acentuadas curadas), com uma cauda de nomes modernos.
- **RG** usa o formato de São Paulo; é ilustrativo, não um registro oficial. O Brasil não tem algoritmo nacional único de RG.
- **Inscrição Estadual**: **SP, RJ e PR** seguem os algoritmos oficiais da SEFAZ (verificados contra vetores reais); **AM, ES, PB, PI, RS, SC, SE** usam a regra de módulo 11 simples, que é também o algoritmo oficial deles. As demais UFs usam um esquema genérico auto-consistente dimensionado ao comprimento da IE do estado. Esses valores servem para fixtures coerentes, não para envio a órgãos fazendários.

## Licença

[MIT](./LICENSE)
