import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: vincular fábrica via LinkFactoryModal (wizard de 2 steps).
 *
 * Cobre padrões novos vs. users-create: navegação multi-step ("Próximo" →
 * "Vincular"), campo com MÁSCARA (cnpj) e o Input.Select custom (dropdown em
 * portal, fora do dialog). Mock STATEFUL pelo mesmo motivo de users-create
 * (add otimista + invalidateClient → refetch de CompanyFactories).
 */
const FACTORY_NAME = "Fábrica Teste E2E";

test("factories: vincula uma fábrica e o card aparece na grid", async ({
  page,
}) => {
  const created: Array<Record<string, unknown>> = [];

  await mockGraphql(page, {
    CompanyFactories: () => ({
      company_factories_list: {
        edges: created.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: created.length,
      },
    }),
    LinkFactory: (variables) => {
      const input = (variables.input ?? {}) as Record<string, unknown>;
      const node = {
        id: `cf-${created.length + 1}`,
        commissionRate: input.commissionRate ?? 10,
        commissionCalcBasis: input.commissionCalcBasis ?? "Faturado",
        paymentTermDays: input.paymentTermDays ?? 5,
        contractStart: null,
        contractEnd: null,
        factory: {
          id: "factory-1",
          cnpj: String(input.cnpj ?? ""),
          razaoSocial: FACTORY_NAME,
          nomeFantasia: FACTORY_NAME,
          addressCity: "São Paulo",
          addressState: "SP",
          deletedAt: null,
        },
      };
      created.push(node);
      return {
        linkFactory: { status: true, code: 200, message: "ok", data: node },
      };
    },
  });

  await page.goto("/factories");

  await page.getByRole("button", { name: "Vincular Fábrica" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Step 1 — CNPJ (mascarado) → Próximo.
  await dialog.locator('input[name="cnpj"]').fill("12345678000199");
  await dialog.getByRole("button", { name: "Próximo" }).click();

  // Step 2 — termos comerciais.
  await dialog.locator('input[name="commissionRate"]').fill("10");

  // Input.Select custom: digitar filtra e abre o dropdown (renderizado em
  // portal, fora do dialog); clicar a opção no portal.
  const basis = dialog.getByRole("textbox", { name: "Base de cálculo" });
  await basis.click();
  await basis.pressSequentially("Faturado");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Faturado", { exact: true })
    .click();

  await dialog.locator('input[name="paymentTermDays"]').fill("5");
  await dialog.locator('input[name="territory"]').fill("Sudeste");

  await dialog.getByRole("button", { name: "Vincular" }).click();

  // Sucesso: toast + card novo na grid (persistente após o refetch).
  await expect(page.getByText("Fábrica vinculada com sucesso")).toBeVisible();
  await expect(page.getByText(FACTORY_NAME).first()).toBeVisible();
});
