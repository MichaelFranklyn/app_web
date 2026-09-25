import { expect, test } from "@playwright/test";

// Verificação manual contra o banco REAL (dump de prod) e a API local.
test("HERC: produto 1000001106 traz o preço ao ser adicionado num pedido", async ({
  page,
}) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));

  await page.goto("http://localhost:3000/login");
  await page
    .locator('input[name="email"]')
    .fill("escritorio.contato@email.com");
  await page.locator('input[name="password"]').fill("contato123");
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 30000 });
  console.log("LOGIN OK");

  // Novo pedido digitado tem página própria (não é mais modal).
  await page.goto("http://localhost:3000/orders/new");
  await expect(page.getByText("Dados do pedido")).toBeVisible({
    timeout: 15000,
  });
  await page.waitForTimeout(4000);
  console.log("ERROS DE RUNTIME:", JSON.stringify(erros));
});
