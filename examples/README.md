# Examples

Runnable, copy-pasteable examples of `dados-br-faker` in real workflows.

Each example needs its own peer library installed (Prisma, Vitest, MSW). They
are intentionally kept out of the library build and lint — they exist to show
integration patterns.

| File                                                 | Shows                                     |
| ---------------------------------------------------- | ----------------------------------------- |
| [`prisma-seed.ts`](./prisma-seed.ts)                 | Reproducible database seeding with Prisma |
| [`vitest.example.test.ts`](./vitest.example.test.ts) | Deterministic test fixtures with Vitest   |
| [`msw-handlers.ts`](./msw-handlers.ts)               | Mocking a REST API with MSW               |

## Run them

```bash
# from a project that has dados-br-faker installed
npm i -D dados-br-faker

# Prisma seed (needs @prisma/client + a schema)
npx tsx examples/prisma-seed.ts

# Vitest
npx vitest run examples/vitest.example.test.ts

# MSW handlers are imported by your test/setup file
```

The seed (`createFaker({ seed })`) makes every example reproducible: same seed,
same data, every run.
