import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Fluxo de ESCRITA: vincular fábrica via LinkFactoryModal (wizard de 3 steps:
 * Fábrica → Comissão → Contrato).
 *
 * Cobre padrões novos vs. users-create: navegação multi-step ("Próximo" →
 * "Vincular"), volta de passo sem perder o que já foi digitado, campo com
 * MÁSCARA (cnpj) e o Input.Select custom (dropdown em portal, fora do dialog).
 * Mock STATEFUL pelo mesmo motivo de users-create (add otimista +
 * invalidateClient → refetch de CompanyFactories).
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

  // Vincular fábrica é ação de gestor — o header a esconde para vendedor.
  await grantRole(page, "OWNER");
  await page.goto("/factories");

  await page.getByRole("button", { name: "Vincular Fábrica" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Step 1 — CNPJ (mascarado) + apelido opcional → Próximo. O número precisa
  // ter dígito verificador válido: o formulário barra CNPJ malformado antes de
  // enviar (ver utils/document.ts).
  await dialog.locator('input[name="cnpj"]').fill("11222333000181");
  await dialog.getByRole("button", { name: "Próximo" }).click();

  // Step 2 — comissão.
  await dialog.locator('input[name="commissionRate"]').fill("10");

  // Input.Select custom: digitar filtra e abre o dropdown (renderizado em
  // portal, fora do dialog); clicar a opção no portal.
  // O `value` da opção é o legado "Faturado", mas o LABEL exibido (e filtrado
  // ao digitar) é "Faturamento — comissão paga no faturamento".
  const basis = dialog.getByRole("textbox", { name: "Base de cálculo" });
  await basis.click();
  await basis.pressSequentially("Faturamento");
  await page
    .locator("[data-select-dropdown]")
    .getByText(/^Faturamento —/)
    .click();

  await dialog.locator('input[name="paymentTermDays"]').fill("5");

  // Voltar não pode perder o que já foi digitado no passo anterior.
  await dialog.getByRole("button", { name: "Voltar" }).click();
  await expect(dialog.locator('input[name="cnpj"]')).toHaveValue(
    "11.222.333/0001-81"
  );
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: "Próximo" }).click();

  // Step 3 — contrato.
  await dialog.locator('input[name="territory"]').fill("Sudeste");

  await dialog.getByRole("button", { name: "Vincular" }).click();

  // Sucesso: toast + card novo na grid (persistente após o refetch).
  await expect(page.getByText("Fábrica vinculada com sucesso")).toBeVisible();
  await expect(page.getByText(FACTORY_NAME).first()).toBeVisible();
});
