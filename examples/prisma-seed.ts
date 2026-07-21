/**
 * Reproducible database seeding with Prisma.
 *
 * Run: `npx tsx examples/prisma-seed.ts`
 * Requires: @prisma/client, a configured schema with `User` and `Company`.
 *
 * The seed makes the generated data identical on every run — great for
 * predictable local databases and CI.
 */
import { PrismaClient } from '@prisma/client';
import { createFaker } from 'dados-br-faker';

const prisma = new PrismaClient();
const faker = createFaker({ seed: 2026 });

async function main(): Promise<void> {
  // 50 coherent people: address, DDD, age and email all consistent.
  for (let i = 0; i < 50; i++) {
    const p = faker.pessoa();
    await prisma.user.create({
      data: {
        name: p.nome,
        email: p.email,
        cpf: p.cpf,
        birthDate: new Date(p.dataNascimento),
        phone: p.telefone.formatado,
        city: p.endereco.cidade,
        state: p.endereco.uf,
        zip: p.endereco.cep,
      },
    });
  }

  // 10 companies in São Paulo — the last five as newly-registered (2026)
  // companies, using the alphanumeric CNPJ.
  for (let i = 0; i < 10; i++) {
    const e = faker.empresa({
      uf: 'SP',
      cnpjFormato: i >= 5 ? 'alfanumerico' : 'numerico',
    });
    await prisma.company.create({
      data: {
        legalName: e.razaoSocial,
        tradeName: e.nomeFantasia,
        cnpj: e.cnpj,
        stateRegistration: e.inscricaoEstadual,
        email: e.email,
        city: e.endereco.cidade,
      },
    });
  }

  console.log('Seed complete: 50 users + 10 companies.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
