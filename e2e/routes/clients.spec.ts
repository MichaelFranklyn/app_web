import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

// ClientStats roda SERVER-SIDE (page.tsx) e é atendida pelo stub GraphQL;
// aqui mockamos apenas a query client-side da tabela.
test("clients: a carteira carrega vazia e renderiza o cabeçalho", async ({
  page,
}) => {
  await mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
  });

  await page.goto("/clients");

  await expect(page.getByText(/03.*Clientes/)).toBeVisible();
});
