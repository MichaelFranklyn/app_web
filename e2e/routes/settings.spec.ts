import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * O hub de /settings deixou de existir: cada assunto é item na sidebar, então a
 * rota só encaminha para o primeiro assunto que o papel pode abrir. Mandar todo
 * mundo para /settings/company jogaria o admin contra o `requireOwnerPage`.
 */
const stub = {
  MyCompany: () => ({
    my_company: {
      status: true,
      message: "ok",
      data: {
        id: "c-1",
        cnpj: "33000167000101",
        razaoSocial: "EMPRESA TESTE LTDA",
        nomeFantasia: "Empresa Teste",
        segment: "Representação",
        phone: null,
        whatsapp: null,
        website: null,
        addressZip: null,
        addressStreet: null,
        addressNumber: null,
        addressComplement: null,
        addressNeighborhood: null,
        addressCity: null,
        addressState: null,
        logoUrl: null,
        avatarUrl: null,
      },
    },
  }),
  Users: () => ({ users_list: emptyConnection() }),
  UsersStats: () => ({
    users_stats: {
      totalCount: 0,
      activeCount: 0,
      adminCount: 0,
      sellerCount: 0,
    },
  }),
};

test("settings: o dono cai nos dados da empresa", async ({ page }) => {
  await mockGraphql(page, stub);
  await grantRole(page, "OWNER", { alsoJwt: true });

  await page.goto("/settings");

  await expect(page).toHaveURL(/\/settings\/company$/);
});

test("settings: o admin cai na lista de pessoas", async ({ page }) => {
  await mockGraphql(page, stub);
  await grantRole(page, "ADMIN", { alsoJwt: true });

  await page.goto("/settings");

  // `updateCompany` é @is_owner: mandá-lo para /settings/company seria um beco.
  await expect(page).toHaveURL(/\/settings\/users$/);
});

test("settings: o vendedor cai no próprio perfil", async ({ page }) => {
  await mockGraphql(page, stub);
  await grantRole(page, "SELLER", { alsoJwt: true });

  await page.goto("/settings");

  // Nenhum assunto da empresa é dele; o que é dele é o perfil.
  await expect(page).toHaveURL(/\/settings\/user\/e2e-user$/);
});

test("settings: vendedor que abre o catálogo é devolvido", async ({ page }) => {
  // Todos os guards de configuração devolvem para /profile — uma regra só, e sem
  // a cadeia /settings/catalog → /settings → /profile que existia antes.
  await mockGraphql(page, stub);
  await grantRole(page, "SELLER", { alsoJwt: true });

  await page.goto("/settings/catalog");

  await expect(page).toHaveURL(/\/settings\/user\/e2e-user$/);
});

test("settings/catalog: o índice lista um card por catálogo", async ({
  page,
}) => {
  await grantRole(page, "OWNER", { alsoJwt: true });
  await page.goto("/settings/catalog");

  const hub = page.locator('[data-tour="settings-catalog-sections"]');
  await expect(
    hub.getByRole("link", { name: "Categorias de produtos" })
  ).toBeVisible();
  await expect(hub.getByRole("link", { name: "Unidades" })).toBeVisible();
  await expect(
    hub.getByRole("link", { name: "Rótulos de embalagem" })
  ).toBeVisible();
  await expect(
    hub.getByRole("link", { name: "Regras de imposto" })
  ).toBeVisible();
});

test("settings: nenhuma rota de configuração se abre para o vendedor", async ({
  page,
}) => {
  await mockGraphql(page, { ...stub });
  await grantRole(page, "SELLER", { alsoJwt: true });

  for (const rota of [
    "/settings",
    "/settings/company",
    "/settings/users",
    "/settings/catalog",
    "/settings/catalog/categories",
    "/settings/catalog/units",
    "/settings/catalog/labels",
    "/settings/catalog/tax-rules",
  ]) {
    await page.goto(rota);
    // Sempre termina no próprio perfil — a única coisa que é dele.
    await expect(page, `rota ${rota}`).toHaveURL(/\/settings\/user\/e2e-user$/);
  }
});
