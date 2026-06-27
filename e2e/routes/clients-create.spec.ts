import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: adicionar cliente à carteira via AddClientModal.
 *
 * Variante vs. users-create: a mutation `AddClientToCompany` retorna SÓ IDs, então
 * NÃO há add otimista. A invalidação usa `useInvalidateQueriesClient` (evict+gc),
 * que recarrega a lista no PRÓXIMO mount — não sincroniza a linha na tela atual.
 * Por isso a asserção fiel ao app é o toast de sucesso + fechamento do modal
 * (não a linha aparecendo aqui). O mock `Clients`/`created` fica como cobertura
 * do refetch eventual. ClientStats (SSR) é atendida pelo stub GraphQL.
 */
test("clients: adiciona um cliente e confirma sucesso", async ({ page }) => {
  const created: Array<Record<string, unknown>> = [];

  await mockGraphql(page, {
    Clients: () => ({
      clients_list: {
        edges: created.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: created.length,
      },
    }),
    AddClientToCompany: (variables) => {
      const input = (variables.input ?? {}) as { cnpj?: string };
      const seq = created.length + 1;
      created.push({
        id: `client-${seq}`,
        cnpj: String(input.cnpj ?? ""),
        razaoSocial: "Cliente Teste E2E",
        nomeFantasia: "Cliente Teste E2E",
        cnae: null,
        cnaeDescription: null,
        addressCity: "São Paulo",
        addressState: "SP",
      });
      return {
        addClientToCompany: {
          status: true,
          code: 200,
          message: "ok",
          data: { id: `client-${seq}`, clientId: `client-${seq}` },
        },
      };
    },
  });

  await page.goto("/clients");

  await page.getByRole("button", { name: "Novo Cliente" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="cnpj"]').fill("11.222.333/0001-81");
  await dialog.getByRole("button", { name: "Adicionar cliente" }).click();

  // Sucesso: toast + modal fechado (a linha entra no próximo mount — ver topo).
  await expect(
    page.getByText("Cliente adicionado à carteira com sucesso")
  ).toBeVisible();
  await expect(dialog).toBeHidden();
});
