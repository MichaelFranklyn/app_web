import { EXPIRED_PORTAL_TOKEN } from "../support/stub-backend";
import { expect, test } from "../support/fixtures";

/**
 * As telas de erro das rotas sem casca de app.
 *
 *  • **Link do portal vencido.** O cliente abre o link sem sessão e sem saber
 *    o que é o sistema; se o layout de `/p/[token]` deixasse de tratar o perfil
 *    nulo, ele veria uma tela quebrada em vez do recado de pedir outro link.
 *
 *  • **Endereço inexistente.** Sem o `not-found.tsx` raiz, o Next mostra o
 *    "404 | This page could not be found." em inglês e sem saída.
 */
// Sem sessão: é como o cliente do portal e um visitante perdido chegam.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Telas de erro", () => {
  test("link do portal vencido mostra o recado em português", async ({
    page,
  }) => {
    const response = await page.goto(`/p/${EXPIRED_PORTAL_TOKEN}`);

    // 200, e não 307 para o login: o `/p/` é liberado por prefixo.
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Este link não está mais válido" })
    ).toBeVisible();
    await expect(
      page.getByText("Peça um link novo ao seu representante")
    ).toBeVisible();
    // Nada da casca do portal: o perfil não veio, nenhuma tela filha roda.
    await expect(page.getByRole("heading", { name: "Resumo" })).toHaveCount(0);
  });

  test("endereço inexistente mostra a página não encontrada", async ({
    page,
  }) => {
    const response = await page.goto("/p/token-qualquer/rota-que-nao-existe");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Página não encontrada" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ir para o início" })
    ).toHaveAttribute("href", "/");
  });
});
