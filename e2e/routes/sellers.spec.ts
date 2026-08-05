import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Não existe mais uma tela de vendedores: vendedor é um usuário com perfil de
 * campo, então /sellers é só um atalho para a lista única de pessoas (/settings/users).
 */
test("sellers: a rota antiga cai na lista de pessoas", async ({ page }) => {
  await mockGraphql(page, {
    Users: () => ({ users_list: emptyConnection() }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
  });

  await page.goto("/sellers");

  await expect(page).toHaveURL(/\/settings\/users$/);

  // O skeleton do loading.tsx repete o título e as abas da lista (ListPageSkeleton
  // com tabs={["Pessoas", …]} e listTitle="Pessoas da empresa"), então durante a
  // transição os dois convivem no DOM e um getByText casa DUAS vezes. Esperar por
  // algo que só a lista pronta tem — o cabeçalho da coluna — resolve a corrida.
  await expect(
    page.getByRole("columnheader", { name: "Pessoa" })
  ).toBeVisible();
  await expect(page.getByText("Pessoas da empresa").first()).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Acessos por Fábrica" }).first()
  ).toBeVisible();
});

test("users: a rota antiga cai na lista sob configurações", async ({
  page,
}) => {
  await mockGraphql(page, { Users: () => ({ users_list: emptyConnection() }) });

  await page.goto("/users");

  // Link salvo continua funcionando — a lista mudou de lugar, não de dono.
  await expect(page).toHaveURL(/\/settings\/users$/);
});

test("users: a rota antiga do perfil também redireciona", async ({ page }) => {
  await mockGraphql(page, {});

  await page.goto("/users/u-1");

  await expect(page).toHaveURL(/\/settings\/users\/u-1$/);
});
