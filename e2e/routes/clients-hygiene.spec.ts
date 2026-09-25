import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Higienização da carteira (/clients/hygiene).
 *
 * O que se prende é o caminho do gestor: ver POR QUE o cliente está na lista,
 * dizer o que aconteceu com ele e vê-lo sair da lista. A página é só de gestão
 * (o guard lê o papel do token no servidor), por isso o `alsoJwt`.
 */
function hygieneItem() {
  return {
    receitaStatus: "BAIXADA",
    lastOrderDate: "2024-03-10",
    reasons: ["RECEITA_INACTIVE", "NO_RECENT_PURCHASE"],
    companyClient: {
      id: "cc-1",
      status: "ACTIVE",
      createdAt: "2023-01-01T00:00:00Z",
      client: {
        id: "client-1",
        cnpj: "11222333000181",
        razaoSocial: "MERCADO CENTRAL LTDA",
        nomeFantasia: "Mercado Central",
        nickname: null,
      },
    },
  };
}

test("higienização: gestor marca que o cliente não existe mais e ele sai da lista", async ({
  page,
}) => {
  await grantRole(page, "OWNER", { alsoJwt: true });

  let ended = false;
  const spy = await mockGraphql(page, {
    ClientHygiene: () => ({
      clientHygiene: {
        receitaPending: 3,
        items: ended ? [] : [hygieneItem()],
      },
    }),
    EndCompanyClient: () => {
      ended = true;
      return {
        endCompanyClient: {
          status: true,
          message: "Cliente marcado como encerrado (não existe mais).",
          data: {
            cancelledVisits: 0,
            companyClient: {
              id: "cc-1",
              isActive: false,
              status: "CLOSED",
              statusReason: null,
              statusChangedAt: "2026-09-25T12:00:00Z",
            },
          },
        },
      };
    },
  });

  await page.goto("/clients/hygiene");

  await expect(
    page.getByRole("heading", { name: "Higienizar carteira", level: 1 })
  ).toBeVisible();
  // Os pendentes da Receita ficam à vista, com a ação de conferir.
  await expect(
    page.getByText("3 cliente(s) ainda não conferido(s) na Receita")
  ).toBeVisible();

  const linha = page
    .getByRole("row")
    .filter({ hasText: "MERCADO CENTRAL LTDA" });
  await expect(linha).toContainText("CNPJ fora de operação");
  await expect(linha).toContainText("Sem compra há mais de 1 ano");

  await linha.getByRole("button", { name: "Situação do cliente" }).click();
  await page.getByRole("menuitem", { name: "Não existe mais" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Tirar da carteira" }).click();

  const variables = await spy.waitForCall("EndCompanyClient");
  expect(variables).toMatchObject({ id: "cc-1", input: { status: "CLOSED" } });

  await expect(page.getByText("Carteira em dia")).toBeVisible();
});
