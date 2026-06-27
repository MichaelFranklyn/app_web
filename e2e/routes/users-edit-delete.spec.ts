import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Fluxos de ESCRITA via ações da linha (MoreOptions → menuitem):
 *  - Editar: update otimista (onUpdateOptimistic) antes da mutation → a célula
 *    reflete o novo nome na hora; sucesso faz commit.
 *  - Excluir: ConfirmModal com remoção otimista (onBeforeConfirm) ANTES da
 *    mutation → a linha some na hora; erro faria rollback.
 *
 * Cada teste semeia 1 usuário na query `Users` para ter uma linha sobre a qual agir.
 */
const seedUser = () => ({
  id: "u-1",
  name: "Maria Antiga",
  email: "maria@empresa.com.br",
  role: "SELLER",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
});

test("users: edita o nome e a linha reflete a mudança", async ({ page }) => {
  const users = [seedUser()];

  await mockGraphql(page, {
    Users: () => ({
      users_list: {
        edges: users.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: users.length,
      },
    }),
    updateUser: (variables) => {
      const input = (variables.input ?? {}) as { name?: string };
      const u = users.find((x) => x.id === variables.id);
      if (u && input.name) u.name = input.name;
      return {
        updateUser: {
          status: true,
          code: 200,
          message: "ok",
          data: { id: variables.id },
        },
      };
    },
  });

  await page.goto("/users");

  const row = page.getByRole("row", { name: /Maria Antiga/ });
  await row.getByRole("button").click();
  await page.getByRole("menuitem", { name: "Editar" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Maria Nova");
  await dialog.getByRole("button", { name: "Editar usuário" }).click();

  await expect(page.getByText("Usuário editado com sucesso")).toBeVisible();
  await expect(page.getByText("Maria Nova")).toBeVisible();
});

test("users: exclui um usuário e a linha some", async ({ page }) => {
  const users = [seedUser()];

  await mockGraphql(page, {
    Users: () => ({
      users_list: {
        edges: users.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: users.length,
      },
    }),
    DeleteUser: (variables) => {
      const idx = users.findIndex((u) => u.id === variables.id);
      if (idx >= 0) users.splice(idx, 1);
      return { deleteUser: { status: true, message: "ok" } };
    },
  });

  await page.goto("/users");

  await expect(page.getByText("Maria Antiga")).toBeVisible();

  const row = page.getByRole("row", { name: /Maria Antiga/ });
  await row.getByRole("button").click();
  await page.getByRole("menuitem", { name: "Excluir" }).click();

  // ConfirmModal: botão = confirmLabel.
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir usuário" })
    .click();

  await expect(page.getByText("Usuário excluído com sucesso")).toBeVisible();
  await expect(page.getByText("Maria Antiga")).toHaveCount(0);
});

test("users: desativa um usuário e o badge vira Inativo", async ({ page }) => {
  const users = [seedUser()];
  users[0].name = "Ana Toggle";

  await mockGraphql(page, {
    Users: () => ({
      users_list: {
        edges: users.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: users.length,
      },
    }),
    ToggleUser: () => ({ updateUser: { status: true, message: "ok" } }),
  });

  await page.goto("/users");

  const row = page.getByRole("row", { name: /Ana Toggle/ });
  await row.getByRole("button").click();
  await page.getByRole("menuitem", { name: "Desativar" }).click();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Desativar" })
    .click();

  await expect(page.getByText("Usuário desativado com sucesso")).toBeVisible();
  await expect(row.getByText("Inativo")).toBeVisible();
});
