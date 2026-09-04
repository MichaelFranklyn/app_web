import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Marcar visita à mão, da ficha do cliente.
 *
 * O "+" de cada card da rotina só alcança um dia que já está na tela. Aqui a
 * data é livre — é o caso do cliente que pede "passa aqui dia 12" numa semana
 * que ainda não tem rotina —, e o que o teste guarda é o payload: cliente e
 * DATA, com a resolução do dia e da semana ficando no backend.
 */
const clientLayout = () => ({
  CompanyClient: () => ({
    companyClient: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        id: "cc-1",
        notes: null,
        isActive: true,
        client: {
          id: "client-1",
          cnpj: "12345678000190",
          razaoSocial: "Cliente Visita LTDA",
          nomeFantasia: "Cliente Visita",
          cnae: null,
          cnaeDescription: null,
          addressStreet: null,
          addressNumber: null,
          addressComplement: null,
          addressNeighborhood: null,
          addressZip: null,
          addressCity: null,
          addressState: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    },
  }),
  VisitsByCompanyClient: () => ({
    visitsByCompanyClient: {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
      totalCount: 0,
    },
  }),
  // Um vendedor só no cliente: o modal não precisa perguntar de quem é a visita.
  ClientLinksForVisit: () => ({
    sellerClientFactoryList: {
      edges: [
        {
          node: {
            id: "scf-1",
            sellerId: "seller-1",
            factoryId: "f-1",
            seller: { id: "seller-1", name: "Celso" },
            factory: {
              id: "f-1",
              razaoSocial: "HERC LTDA",
              nomeFantasia: "HERC",
            },
          },
        },
      ],
      totalCount: 1,
    },
  }),
});

test("cliente/visitas: marcar visita manda o cliente e a data escolhida", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...clientLayout(),
    ScheduleManualVisit: () => ({
      scheduleManualVisit: {
        status: true,
        message: "Visita marcada com sucesso.",
        data: {
          id: "item-1",
          scheduleDayId: "day-1",
          plannedOrder: 1,
          contactType: "IN_PERSON",
        },
      },
    }),
  });
  await page.goto("/clients/cc-1/visits");

  await page.getByRole("button", { name: "Marcar visita" }).click();
  await expect(
    page.getByRole("dialog", { name: "Marcar visita" })
  ).toBeVisible();

  // O dia sai do calendário: "Hoje" é o atalho que o cliente mais usa ("passa
  // aqui hoje ainda"), e a regra do backend aceita a data de hoje.
  await page.getByLabel(/dia da visita/i).click({ force: true });
  await page.getByRole("button", { name: "Hoje", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Marcar visita" })
    .click();

  const variables = await spy.waitForCall("ScheduleManualVisit");
  const input = variables.input as {
    clientId: string;
    date: string;
    contactType: string;
    sellerId: string | null;
  };
  expect(input.clientId).toBe("client-1");
  expect(input.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(input.contactType).toBe("IN_PERSON");
  // Um vendedor só no cliente: o modal resolve sem perguntar.
  expect(input.sellerId).toBe("seller-1");
});

test("cliente/visitas: ligar para o cliente marca contato remoto", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...clientLayout(),
    ScheduleManualVisit: () => ({
      scheduleManualVisit: {
        status: true,
        message: "ok",
        data: {
          id: "item-1",
          scheduleDayId: "day-1",
          plannedOrder: 1,
          contactType: "REMOTE",
        },
      },
    }),
  });
  await page.goto("/clients/cc-1/visits");

  await page.getByRole("button", { name: "Marcar visita" }).click();
  await page.getByRole("button", { name: "Ligar para o cliente" }).click();
  await page.getByLabel(/dia da visita/i).click({ force: true });
  await page.getByRole("button", { name: "Hoje", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Marcar contato" })
    .click();

  const variables = await spy.waitForCall("ScheduleManualVisit");
  expect((variables.input as { contactType: string }).contactType).toBe(
    "REMOTE"
  );
});
