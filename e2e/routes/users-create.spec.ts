import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: criar pessoa via AddUserModal (a lista é única — vendedor é
 * um usuário com perfil de campo).
 *
 * O mock é STATEFUL — `createUser` registra a pessoa e a query `Users` passa a
 * devolvê-la. Necessário porque, no sucesso, o modal faz add otimista E
 * `invalidateClient(["users_list"])` → refetch; se o refetch voltasse vazio, a
 * linha otimista some no re-sync do useOptimisticList.
 */
const stateful = (created: Array<Record<string, unknown>>) => ({
  Users: () => ({
    users_list: {
      edges: created.map((node) => ({ node })),
      pageInfo: { hasNextPage: false, endCursor: null },
      totalCount: created.length,
    },
  }),
  SellerFactoryAccessList: () => ({
    seller_factory_access_list: emptyConnection(),
  }),
  createUser: (variables: Record<string, unknown>) => {
    const input = (variables.input ?? {}) as {
      name: string;
      email: string;
      role: string;
    };
    const node = {
      id: `user-${created.length + 1}`,
      name: input.name,
      email: input.email,
      role: input.role,
      isActive: true,
      phone: null,
      createdAt: "2026-06-22T10:00:00Z",
      seller: null,
    };
    created.push(node);
    return {
      createUser: { status: true, code: 200, message: "ok", data: node },
    };
  },
});

test("users: cria uma pessoa e a nova linha aparece na tabela", async ({
  page,
}) => {
  const created: Array<Record<string, unknown>> = [];
  await mockGraphql(page, stateful(created));

  await page.goto("/settings/users");

  await page.getByRole("button", { name: /nova pessoa/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="name"]').fill("Maria Teste");
  await dialog.locator('input[name="email"]').fill("maria@empresa.com.br");
  // O input do radio é sr-only; clicar no label (texto) ativa o input.
  await dialog.getByText("Administrador").click();

  await dialog.getByRole("button", { name: "Adicionar pessoa" }).click();

  // Toast de sucesso + linha nova persistente após o refetch.
  await expect(page.getByText("Usuário adicionado com sucesso")).toBeVisible();
  await expect(page.getByText("maria@empresa.com.br")).toBeVisible();
});

test("users: criar com perfil Vendedor pede para completar os dados de campo", async ({
  page,
}) => {
  const created: Array<Record<string, unknown>> = [];
  await mockGraphql(page, stateful(created));

  await page.goto("/settings/users");
  await page.getByRole("button", { name: /nova pessoa/i }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Vendedor Novo");
  await dialog.locator('input[name="email"]').fill("vendedor@empresa.com.br");
  // exact: a descrição do modal também menciona "Vendedor".
  await dialog.getByText("Vendedor", { exact: true }).click();
  await dialog.getByRole("button", { name: "Adicionar pessoa" }).click();

  // Sem CPF e endereço de partida a rota do dia não é calculada — o aviso
  // aparece na hora, em vez de o gestor descobrir isso depois.
  await expect(page.getByText("Complete os dados de vendedor")).toBeVisible();
});
