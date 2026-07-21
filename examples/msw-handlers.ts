/**
 * Mocking a REST API with MSW (Mock Service Worker).
 *
 * Requires: msw. Import these handlers from your test/browser setup, e.g.
 *   import { setupServer } from 'msw/node';
 *   import { handlers } from './examples/msw-handlers';
 *   const server = setupServer(...handlers);
 *
 * A seeded faker keeps the mocked responses stable across runs.
 */
import { http, HttpResponse } from 'msw';
import { createFaker } from 'dados-br-faker';

const faker = createFaker({ seed: 7 });

export const handlers = [
  // List of coherent customers.
  http.get('/api/clientes', () =>
    HttpResponse.json(
      Array.from({ length: 20 }, () => {
        const p = faker.pessoa();
        return {
          nome: p.nome,
          email: p.email,
          cpf: p.cpf,
          telefone: p.telefone.formatado,
          cidade: p.endereco.cidade,
          uf: p.endereco.uf,
        };
      }),
    ),
  ),

  // A single company, including the 2026 alphanumeric CNPJ.
  http.get('/api/empresa/:id', () => {
    const e = faker.empresa({ cnpjFormato: 'alfanumerico' });
    return HttpResponse.json({
      razaoSocial: e.razaoSocial,
      cnpj: e.cnpj,
      inscricaoEstadual: e.inscricaoEstadual,
      cidade: e.endereco.cidade,
      uf: e.endereco.uf,
    });
  }),

  // Create endpoint echoing a generated CPF as the new id.
  http.post('/api/clientes', () =>
    HttpResponse.json({ id: faker.cpf() }, { status: 201 }),
  ),
];
