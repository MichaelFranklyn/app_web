import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * O vínculo vendedor × fábrica se edita pelas PONTAS: no perfil da pessoa
 * ("Fábricas com acesso") e na aba de vendedores da fábrica. A tabela cruzada
 * de /settings/users saiu — quem quer mexer no vínculo já está numa das duas
 * telas, e procurar a linha certa entre todos os pares da empresa era o passo a
 * mais que a aba cobrava.
 *
 * O que estes testes prendem é o caminho inteiro do acordo de comissão: a
 * tabela mostra o percentual, o menu abre o modal, o modal traduz em dinheiro e
 * a mutation sai com o número certo.
 */
const userWithSeller = {
  user_detail: {
    status: true,
    message: "ok",
    data: {
      id: "u-9",
      name: "Vendedor Vinculado",
      email: "vv@empresa.com.br",
      role: "SELLER",
      isActive: true,
      phone: null,
      cpf: null,
      birthDate: null,
      addressZip: null,
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: null,
      addressState: null,
      createdAt: "2026-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Empresa Teste",
        razaoSocial: "Empresa Teste LTDA",
      },
      seller: {
        id: "seller-9",
        name: "Vendedor Vinculado",
        region: "BA",
        isActive: true,
        factoryCount: 1,
        clientCount: 0,
        totalRevenue: "0",
        lastOrderDate: null,
        scheduleConfig: null,
      },
    },
  },
};

const access = {
  id: "acc-1",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  sellerCommissionRate: "3",
  sellerCommissionBasis: null,
  factory: {
    id: "factory-1",
    nomeFantasia: "Fábrica Vinculada",
    nickname: null,
    razaoSocial: "Fábrica Vinculada LTDA",
  },
  grantedByUser: { id: "u-1", name: "Admin" },
};

test("perfil: o acordo de comissão é editado na tabela de fábricas", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () => userWithSeller,
    SellerFactoryAccesses: () => ({
      seller_accesses: {
        edges: [{ node: access }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    // A prévia pergunta ao servidor quanto ESTA fábrica paga à empresa.
    AccessFactoryRate: () => ({
      access_factory_rate: {
        edges: [
          {
            node: {
              id: "cf-1",
              factoryId: "factory-1",
              commissionRate: 7,
            },
          },
        ],
      },
    }),
    UpdateSellerCommissionAgreement: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        updateSellerFactoryAccess: { status: true, message: "ok" },
      };
    },
  });

  await page.goto("/settings/users/u-9");

  // A linha resume o acordo em uma frase, no formato que o escritório usa.
  const linha = page.getByRole("row", { name: /Fábrica Vinculada/ });
  await expect(linha.getByText("3% do pedido · igual à fábrica")).toBeVisible();

  await linha.getByRole("button", { name: "Mais ações" }).click();
  await page.getByRole("menuitem", { name: "Comissão do vendedor" }).click();

  const dialog = page.getByRole("dialog");
  // A prévia é o que impede digitar a taxa errada: mostra o dinheiro dos dois
  // lados num pedido de R$ 10.000 (fábrica a 7% = R$ 700; vendedor a 3% = R$ 300).
  await expect(dialog.getByText("R$ 300,00")).toBeVisible();
  await expect(dialog.getByText("R$ 400,00")).toBeVisible();

  await dialog.getByRole("spinbutton").fill("4");
  await expect(dialog.getByText("R$ 400,00").first()).toBeVisible();

  await dialog.getByRole("button", { name: "Salvar acordo" }).click();

  await expect(page.getByText("Acordo de comissão atualizado")).toBeVisible();
  expect(sentInput).toMatchObject({
    sellerCommissionRate: 4,
    clearSellerCommissionRate: false,
  });
});

test("perfil: revoga o acesso a uma fábrica pelo menu da linha", async ({
  page,
}) => {
  await mockGraphql(page, {
    UserDetail: () => userWithSeller,
    SellerFactoryAccesses: () => ({
      seller_accesses: {
        edges: [{ node: access }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
    RevokeSellerFactoryAccess: () => ({
      updateSellerFactoryAccess: { status: true, message: "ok" },
    }),
  });

  await page.goto("/settings/users/u-9");

  await page
    .getByRole("row", { name: /Fábrica Vinculada/ })
    .getByRole("button", { name: "Mais ações" })
    .click();
  await page.getByRole("menuitem", { name: "Revogar acesso" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Revogar acesso" })
    .click();

  await expect(page.getByText("Acesso revogado com sucesso")).toBeVisible();
});

test("meu perfil: a tabela de fábricas é só leitura", async ({ page }) => {
  await mockGraphql(page, {
    UserDetail: () => userWithSeller,
    SellerFactoryAccesses: () => ({
      seller_accesses: {
        edges: [{ node: access }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
  });

  // O próprio perfil é a rota no singular, e só abre com o id de quem está
  // logado (`e2e-user`): com o id de outra pessoa, o gestor é mandado para a
  // visão de gestão, que é justamente a que TEM as ações.
  await page.goto("/settings/user/e2e-user");

  const linha = page.getByRole("row", { name: /Fábrica Vinculada/ });
  await expect(linha.getByText("3% do pedido · igual à fábrica")).toBeVisible();
  // Ninguém combina a própria comissão nem revoga o próprio acesso.
  await expect(linha.getByRole("button", { name: "Mais ações" })).toHaveCount(
    0
  );
});
