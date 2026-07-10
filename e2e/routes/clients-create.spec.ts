import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: adicionar cliente à carteira via AddClientModal.
 *
 * A mutation `AddClientToCompany` retorna o vínculo (id da carteira) + o cliente
 * global aninhado, o que permite ADD OTIMISTA: a linha entra na hora via
 * useOptimisticList, seguida de invalidação para reconciliar. A asserção cobre o
 * toast + a linha aparecendo imediatamente. ClientStats (SSR) vem do stub GraphQL.
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
      const client = {
        id: `client-${seq}`,
        cnpj: String(input.cnpj ?? ""),
        razaoSocial: "Cliente Teste E2E",
        nomeFantasia: "Cliente Teste E2E",
        cnae: null,
        cnaeDescription: null,
        addressCity: "São Paulo",
        addressState: "SP",
      };
      created.push({ ...client, companyClient: { id: `cc-${seq}` } });
      return {
        addClientToCompany: {
          status: true,
          code: 200,
          message: "ok",
          data: { id: `cc-${seq}`, clientId: `client-${seq}`, client },
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

  // Sucesso: toast + prompt "vincular agora?" + linha otimista na lista.
  await expect(
    page.getByText("Cliente adicionado à carteira com sucesso")
  ).toBeVisible();

  // O modal de criação fecha e dá lugar ao ConfirmModal de vínculo — por isso
  // `dialog` nunca fica oculto. Dispensa o prompt antes de conferir a lista.
  await expect(page.getByText("Cliente adicionado!")).toBeVisible();
  await page.getByRole("button", { name: "Agora não" }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("Cliente Teste E2E").first()).toBeVisible();
});
