# dados-br-faker

## 0.3.3

### Patch Changes

- Add a terminal demo GIF to the README, showing coherent output, deterministic
  seeding, valid check digits, and the 2026 alphanumeric CNPJ. The image is served
  from GitHub via an absolute URL, so it renders on npmjs.com without shipping in
  the package tarball.

## 0.3.2

### Patch Changes

- Make npmjs.com show the English README.

  npm always includes every `README*` file in the tarball and picks one as the
  package README; with both `README.md` and `README.pt-BR.md` in the root it chose
  the Portuguese one. The translation moved to `docs/README.pt-BR.md`, so only
  `README.md` remains in the root.

## 0.3.1

### Patch Changes

- Fix package metadata and README links on npmjs.com.

  - Add `repository`, `homepage`, and `bugs` fields so the npm page links back to
    the GitHub repo and issue tracker.
  - Convert relative README links (`./README.pt-BR.md`, `./LICENSE`, `./examples`,
    `./src/types.ts`) to absolute GitHub URLs. Relative links resolve against
    `npmjs.com/package/...` and returned 404 on the package page.

## 0.3.0

### Minor Changes

- Official state-registration (Inscrição Estadual) algorithms for **RJ** and
  **PR**, ported from `gammasoft/ie` and verified against real vectors.
  `validarInscricaoEstadual` is now accurate for SP, RJ, PR plus AM, ES, PB, PI,
  RS, SC, and SE (whose official rule is the plain modulo-11 scheme); the
  remaining states keep the documented generic scheme.

## 0.2.0

### Minor Changes

- Expanded datasets and new generators.

  **Datasets (official sources):** 160 largest municipalities (all 27 UFs) with real
  Correios CEP ranges, IBGE population, and area codes; 270 first names and 108
  surnames from the IBGE _Nomes no Brasil_ frequency ranking.

  **New generators & validators:**

  - `veiculo` / `placa` (Mercosul & old format) / `renavam` (+ `validarRenavam`)
  - `chavePix` (random UUID v4, CPF, email, phone) / `contaBancaria`
  - `boleto` — 44-digit barcode + FEBRABAN linha digitável (+ `validarLinhaDigitavel`)
  - `cnh` (+ `validarCnh`)

  All check-digit algorithms (RENAVAM, boleto, CNH) were ported from tested
  libraries and verified against real vectors.
