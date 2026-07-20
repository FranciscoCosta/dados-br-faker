# dados-br-faker — Design (FASE 0)

**Data:** 2026-07-20
**Status:** Aprovado — pronto para FASE 1
**Nome npm:** `dados-br-faker` (verificado disponível — 404 no registry)

## Visão

Gerador de dados fake brasileiros, TypeScript-first, **zero dependências de runtime**, com
o diferencial de **coerência interna entre campos**: CEP pertence à cidade, cidade ao estado,
DDD do telefone à região, idade compatível com data de nascimento, documentos com dígitos
verificadores válidos. Determinístico via seed. Suporte pioneiro ao **CNPJ alfanumérico**
(IN RFB nº 2.229/2024, em produção desde 27/07/2026).

## Decisões de design (fechadas na FASE 0)

1. **Idioma das opções:** português total nas chaves (`mascara`, `formato`, `tipo`).
   Substantivos de domínio em português (`cpf`, `cnpj`, `pessoa`, `endereco`).
2. **Retorno de `telefone()` atômico:** `string` (consistente com `cpf`/`cnpj`/`cep`).
   Dentro das entidades, `telefone` é o objeto `Telefone` para tornar a invariante
   `telefone.ddd ↔ cidade` inspecionável.
3. **Determinismo:** apenas `createFaker({ seed })` é determinístico. Funções standalone
   (`import { cpf }`) usam `Math.random` e são sempre aleatórias — tree-shaking limpo,
   sem estado global compartilhado.
4. **RG:** formato SP (8 dígitos + DV mod-11, `X` quando DV=10), documentado como
   ilustrativo/não-oficial. Coerência RG↔UF fora do escopo v1.
5. **Inscrição Estadual:** implementar com DV correto e testado o subconjunto das UFs mais
   comuns (SP, RJ, MG, PR, RS, SC, BA, ...) + fallback genérico documentado para as demais.
   Não inventar regras onde a fonte é mal documentada.

## API pública (MVP)

### Entry points

```ts
import { createFaker } from 'dados-br-faker'; // instância com seed
import { cpf, cnpj, pessoa, validarCpf } from 'dados-br-faker'; // standalone, tree-shakeable

const faker = createFaker({ seed: 123 }); // sem seed = aleatório
```

### Geradores atômicos (retornam string)

```ts
interface OpcoesDoc      { mascara?: boolean }
interface OpcoesCnpj     { mascara?: boolean; formato?: 'numerico' | 'alfanumerico' } // default 'numerico'
interface OpcoesTelefone { mascara?: boolean; tipo?: 'celular' | 'fixo'; ddd?: string }
interface OpcoesNome     { genero?: 'M' | 'F'; sobrenome?: boolean } // sobrenome default true
interface OpcoesEmail    { nome?: string; provedor?: string }

faker.cpf(o?: OpcoesDoc): string
faker.cnpj(o?: OpcoesCnpj): string
faker.rg(o?: OpcoesDoc): string
faker.cep(o?: OpcoesDoc): string
faker.telefone(o?: OpcoesTelefone): string
faker.nome(o?: OpcoesNome): string
faker.email(o?: OpcoesEmail): string
```

### Entidades coerentes

```ts
type UF = 'AC'|'AL'|'AP'|'AM'|'BA'|'CE'|'DF'|'ES'|'GO'|'MA'|'MT'|'MS'|'MG'|'PA'|'PB'|'PR'|'PE'|'PI'|'RJ'|'RN'|'RS'|'RO'|'RR'|'SC'|'SP'|'SE'|'TO';
type Regiao = 'Norte'|'Nordeste'|'Centro-Oeste'|'Sudeste'|'Sul';

interface Endereco {
  logradouro: string; numero: string; complemento?: string;
  bairro: string; cidade: string; uf: UF; estado: string;
  regiao: Regiao; cep: string;
}
interface Telefone { ddd: string; numero: string; tipo: 'celular'|'fixo'; formatado: string }

interface Pessoa {
  nome: string; cpf: string; rg: string;
  dataNascimento: string; // ISO 'YYYY-MM-DD'
  idade: number; genero: 'M'|'F';
  email: string; telefone: Telefone; endereco: Endereco;
}
interface Empresa {
  razaoSocial: string; nomeFantasia: string; cnpj: string;
  inscricaoEstadual: string; endereco: Endereco; telefone: Telefone; email: string;
}

interface OpcoesEndereco { uf?: UF; cidade?: string; regiao?: Regiao }
interface OpcoesPessoa   { uf?: UF; cidade?: string; genero?: 'M'|'F'; idadeMin?: number; idadeMax?: number }
interface OpcoesEmpresa  { uf?: UF; cidade?: string; cnpjFormato?: 'numerico'|'alfanumerico' }

faker.endereco(o?: OpcoesEndereco): Endereco
faker.pessoa(o?: OpcoesPessoa): Pessoa
faker.empresa(o?: OpcoesEmpresa): Empresa
```

### Validadores (standalone)

```ts
validarCpf(valor: string): boolean   // aceita com/sem máscara
validarCnpj(valor: string): boolean  // aceita numérico E alfanumérico, com/sem máscara
```

### Instância

```ts
function createFaker(opcoes?: { seed?: number }): Faker;
interface Faker {
  /* todos os métodos acima */ seed(n: number): void;
}
```

## Arquitetura em 3 camadas

```
src/
  data/         JSON PURO (reutilizável pelo pacote Composer irmão)
    nomes.json, sobrenomes.json, municipios.json,
    logradouros.json, bairros.json, ie-regras.json
  engine/       determinismo + primitivas, sem conhecimento de "Brasil"
    prng.ts (mulberry32), pick.ts (pick/weightedPick), mascara.ts, modulo11.ts
  generators/   lógica fina: consome data + engine
    cpf.ts, cnpj.ts, rg.ts, cep.ts, telefone.ts, nome.ts, email.ts,
    endereco.ts, pessoa.ts, empresa.ts, inscricao-estadual.ts
  faker.ts      createFaker: injeta 1 rng compartilhado em todos os geradores
  index.ts      re-exporta standalone + createFaker + tipos + validadores
tests/
```

**JSON puro isolado:** o pacote Composer (PHP) irmão reutilizará os mesmos arquivos de dados;
JSON neutro = fonte única de verdade cross-language.

**Fluxo de coerência:** toda entidade parte do **município** (ponderado por população). Dele
derivam UF, região, faixa de CEP (CEP sorteado dentro da faixa), DDD (entre os válidos do
município) e IE (algoritmo da UF). Nome → email normalizado sem acentos. `dataNascimento`
sorteada → `idade` calculada dela. Filtro `{ cidade }` fixa o município e propaga a tudo.

## PRNG

**mulberry32** — 32-bit seed, sem dependências, rápido. `createFaker` cria um rng e o injeta
por closure. Primitivas: `next()`, `int(min,max)`, `pick(array)`, `weightedPick(items,pesos)`, `bool(p)`.

## CNPJ alfanumérico (IN RFB nº 2.229/2024)

- 14 posições; 1–8 (raiz) e 9–12 (ordem) alfanuméricas (A–Z e 0–9); 13–14 (DV) sempre numéricas.
- DV: módulo 11, pesos 2–9, cada caractere convertido por `ASCII - 48` (dígitos 0–9; A=17, B=18...).
- Máscara de exibição inalterada: `XX.XXX.XXX/XXXX-DD`.
- `validarCnpj` aceita ambos os formatos (regex alfanumérico `[0-9A-Z]{12}\d{2}`), com/sem máscara.

## Escopo MVP (v1)

**Dentro:** cpf, cnpj (numérico + alfanumérico), rg, cep, telefone, nome, email, endereco,
pessoa, empresa + validarCpf/validarCnpj. Nada além.

**Invariantes com teste explícito (FASE 3):** CEP∈faixa da cidade · DDD válido p/ cidade ·
idade↔dataNascimento · email derivado do nome · IE válida p/ UF · filtros {uf}/{cidade}
propagam a todos os campos · determinismo por seed em todos os geradores.

**Fora do escopo v1:** coerência RG↔UF; dados bancários, veículos, CNH, boleto (v0.2+).

## Ferramentas

pnpm (via corepack) · TypeScript estrito · tsup (ESM+CJS+.d.ts) · Vitest+coverage ·
ESLint+Prettier · Changesets · GitHub Actions (Node 20 e 22).
