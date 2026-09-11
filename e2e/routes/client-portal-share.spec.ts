import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * "Compartilhar com o cliente" — o botão que CANCELA o link pergunta antes.
 *
 * Cancelar derruba na hora o acesso que o cliente já usa, e o botão disparava a
 * mutation no primeiro clique. A confirmação é no próprio botão (e não num
 * ConfirmModal) porque isto já é um modal — modal sobre modal é proibido no
 * projeto.
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
          razaoSocial: "Cliente Portal LTDA",
          nomeFantasia: "Cliente Portal",
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
  SellerClientFactoriesByClient: () => ({
    sellerClientFactoryList: {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
      totalCount: 0,
    },
  }),
  // Já existe um link ativo: é o estado que mostra o botão de cancelar.
  ClientPortalLink: () => ({
    clientPortalLink: {
      status: true,
      data: {
        url: null,
        expiresAt: "2026-12-31T00:00:00Z",
        lastAccessedAt: null,
        createdAt: "2026-09-01T00:00:00Z",
      },
    },
  }),
  RevokeClientPortalLink: () => ({
    revokeClientPortalLink: { status: true, message: "ok" },
  }),
});

test("cliente/portal: cancelar o link pede confirmação antes de revogar", async ({
  page,
}) => {
  const spy = await mockGraphql(page, { ...clientLayout() });

  await page.goto("/clients/cc-1/overview");
  await page.getByRole("button", { name: "Compartilhar" }).click();

  const cancelar = page.getByRole("button", { name: "Cancelar link" });
  await expect(cancelar).toBeVisible();

  // 1º clique: só arma a confirmação — nada foi revogado ainda.
  await cancelar.click();
  expect(spy.calls("RevokeClientPortalLink")).toHaveLength(0);

  const confirmar = page.getByRole("button", {
    name: /o cliente perde o acesso/i,
  });
  await expect(confirmar).toBeVisible();

  // 2º clique: aí sim.
  await confirmar.click();
  await spy.waitForCall("RevokeClientPortalLink");
  expect(spy.lastVariables("RevokeClientPortalLink")).toMatchObject({
    companyClientId: "cc-1",
  });
});
