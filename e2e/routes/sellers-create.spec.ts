import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Criar vendedor: wizard de 3 steps (seleção de usuário → identificação →
 * endereço). O step de endereço tem autofill por CEP que bate no ViaCEP
 * (externo) — interceptamos a rota para determinismo. sellersStats roda SSR
 * (stub). SellersUserIds é consumido sem optional chaining → precisa shape.
 */
test("sellers: cadastra um vendedor pelo wizard de 3 steps", async ({
  page,
}) => {
  const sellers: Array<Record<string, unknown>> = [];

  // ViaCEP (autofill de endereço a partir do CEP).
  await page.route("https://viacep.com.br/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        logradouro: "Av. Paulista",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
      }),
    })
  );

  await mockGraphql(page, {
    Sellers: () => ({
      sellers_list: {
        edges: sellers.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: sellers.length,
      },
    }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
    UsersForSellerModal: () => ({ users_for_seller: { edges: [] } }),
    SellersUserIds: () => ({ sellers_user_ids: { edges: [] } }),
    CreateSeller: (v) => {
      const input = (v.input ?? {}) as { name: string };
      const node = {
        id: `seller-new-${sellers.length + 1}`,
        name: input.name,
        phone: "11999990000",
        region: "Sudeste",
        isActive: true,
        factoryCount: 0,
        clientCount: 0,
        totalRevenue: "0",
        lastOrderDate: null,
      };
      sellers.push(node);
      return { createSeller: { status: true, message: "ok", data: node } };
    },
  });

  await page.goto("/sellers");
  await page.getByRole("button", { name: "Novo Vendedor" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Step 1: pula a seleção de usuário existente (opcional).
  await dialog.getByRole("button", { name: "Próximo →" }).click();

  // Step 2: identificação (phone/cpf têm máscara; dígitos crus passam).
  await dialog.locator('input[name="name"]').fill("Vendedor E2E");
  await dialog.locator('input[name="email"]').fill("ve2e@empresa.com.br");
  await dialog.locator('input[name="phone"]').fill("11999990000");
  await dialog.locator('input[name="cpf"]').fill("12345678909");
  await dialog.locator('input[name="region"]').fill("Sudeste");
  await dialog.getByRole("button", { name: "Próximo →" }).click();

  // Step 3: endereço — CEP dispara o autofill (ViaCEP mockado).
  await dialog.locator('input[name="homeCep"]').fill("01310-100");
  await expect(dialog.locator('input[name="homeCity"]')).toHaveValue(
    "São Paulo"
  );
  await dialog.locator('input[name="homeNumber"]').fill("1000");

  await dialog.getByRole("button", { name: "Cadastrar vendedor" }).click();

  await expect(page.getByText("Vendedor cadastrado com sucesso")).toBeVisible();
  await expect(page.getByText("Vendedor E2E")).toBeVisible();
});
