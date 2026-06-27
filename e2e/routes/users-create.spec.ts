import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: criar usuário via AddUserModal.
 *
 * O mock é STATEFUL — `createUser` registra o usuário e a query `Users` passa a
 * devolvê-lo. Necessário porque, no sucesso, o modal faz add otimista E
 * `invalidateClient(["users_list"])` → refetch; se o refetch voltasse vazio, a
 * linha otimista some no re-sync do useOptimisticList.
 */
test("users: cria um usuário e a nova linha aparece na tabela", async ({
  page,
}) => {
  const created: Array<Record<string, unknown>> = [];

  await mockGraphql(page, {
    Users: () => ({
      users_list: {
        edges: created.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: created.length,
      },
    }),
    createUser: (variables) => {
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
        createdAt: "2026-06-22T10:00:00Z",
      };
      created.push(node);
      return {
        createUser: { status: true, code: 200, message: "ok", data: node },
      };
    },
  });

  await page.goto("/users");

  // Abre o modal de criação.
  await page.getByRole("button", { name: /novo usu/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Preenche o formulário.
  await dialog.locator('input[name="name"]').fill("Maria Teste");
  await dialog.locator('input[name="email"]').fill("maria@empresa.com.br");
  // O input do radio é sr-only; clicar no label (texto) ativa o input.
  await dialog.getByText("Vendedor").click();

  // Submete.
  await dialog.getByRole("button", { name: "Adicionar usuário" }).click();

  // Toast de sucesso + linha nova persistente após o refetch.
  await expect(page.getByText("Usuário adicionado com sucesso")).toBeVisible();
  await expect(page.getByText("maria@empresa.com.br")).toBeVisible();
});
