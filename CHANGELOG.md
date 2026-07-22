# dados-br-faker

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
