# Contributing to dados-br-faker

Thanks for your interest in improving `dados-br-faker`! This project values
**coherence, correctness, and honesty about data** above feature count.

## Development setup

```bash
corepack enable pnpm   # pnpm ships with Node ≥ 18 via corepack
pnpm install
pnpm check             # typecheck + lint + tests — must pass before a PR
```

Useful scripts:

| Script                        | What it does                        |
| ----------------------------- | ----------------------------------- |
| `pnpm test`                   | Run the test suite once             |
| `pnpm test:watch`             | Watch mode                          |
| `pnpm test:coverage`          | Tests with coverage report          |
| `pnpm typecheck`              | `tsc --noEmit` (strict)             |
| `pnpm lint` / `pnpm lint:fix` | ESLint                              |
| `pnpm format`                 | Prettier write                      |
| `pnpm build`                  | Build ESM + CJS + `.d.ts` with tsup |
| `pnpm check`                  | Everything CI runs                  |

## Project shape

```
src/
  data/         Pure JSON datasets (reusable by the sibling Composer package)
  engine/       Deterministic PRNG + primitives (no "Brazil" knowledge)
  generators/   Thin logic consuming data + engine
  faker.ts      createFaker: one shared rng injected into every generator
  index.ts      Public surface (standalone fns, createFaker, validators, types)
tests/
```

Keep the layers separated: datasets stay language-neutral JSON, the engine
stays domain-agnostic, and generators stay thin.

## Ground rules

1. **Test-driven.** Every generator and bug fix ships with tests in the same
   change. Write the failing test first. Check-digit algorithms need both a
   known-vector test and a property test.
2. **Zero runtime dependencies.** Dev dependencies are fine; runtime deps are
   not.
3. **Coherence is a feature.** New entity fields must respect the existing
   invariants (CEP↔city, DDD↔city, age↔birth date, etc.) and add a test proving
   it.
4. **Be honest about data.** If a dataset is curated or an algorithm is a
   simplification, say so in the source (`source` field / module docstring) and
   in the README. Never present fabricated precision as official.
5. **TypeScript strict.** Public API carries JSDoc — it powers editor
   autocomplete.

## Adding data

- **Municipalities**: include `uf`, `regiao`, real `cepInicio`/`cepFim`
  (8 digits), valid `ddds`, and `populacao`. Prefer verifiable ranges; a
  narrower correct range beats a wide guessed one.
- **State registration (IE)**: only add a state's _official_ algorithm with a
  reference; otherwise it stays on the documented generic scheme.

## Commits & releases

- Conventional-commit style is appreciated (`feat:`, `fix:`, `docs:`, …).
- User-facing changes need a Changeset: `pnpm changeset` and describe the bump.

## Reporting issues

Include the seed, the exact call, what you got, and what you expected. Seeds
make bugs reproducible — always share them.
