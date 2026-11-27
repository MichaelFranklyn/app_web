import { expect, Locator, Page } from "@playwright/test";

/**
 * Escolhe uma ação no "⋯" de uma linha de tabela (`RowActions`).
 *
 * Desde 23/11/2026 toda ação de linha mora no menu, com o nome escrito — não
 * há mais lápis/lixeira soltos para clicar. O gatilho é o único botão de nome
 * "Ações …" (ou "Mais ações …") da linha; o item é um `menuitem`. Como no `openDialog`, o clique
 * re-tenta enquanto o menu não abriu: antes da hidratação o botão do SSR não
 * tem onClick.
 *
 * Linha com UMA ação só (desde 27/11/2026) não tem "⋯": a ação é um botão com
 * nome, direto na linha — o helper clica nele.
 */
export async function rowAction(
  page: Page,
  row: Locator,
  action: string | RegExp
): Promise<void> {
  const direct = row.getByRole("button", { name: action });
  const trigger = row.getByRole("button", { name: /ações/i });
  await expect(direct.or(trigger).first()).toBeVisible({ timeout: 15_000 });
  if ((await trigger.count()) === 0) {
    await direct.click();
    return;
  }
  const item = page.getByRole("menuitem", { name: action });
  await expect(async () => {
    if (!(await item.isVisible())) {
      await row
        .getByRole("button", { name: /ações/i })
        .click({ timeout: 2_000 });
    }
    await expect(item).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  await item.click();
}
