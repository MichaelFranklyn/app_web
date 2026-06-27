import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("users: a lista carrega vazia e mostra o botão de criar", async ({
  page,
}) => {
  await mockGraphql(page, {
    Users: () => ({ users_list: emptyConnection() }),
  });

  await page.goto("/users");

  await expect(page.getByRole("button", { name: /novo usu/i })).toBeVisible();
});
