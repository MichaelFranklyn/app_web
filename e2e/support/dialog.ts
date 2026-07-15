import { expect, Locator, Page } from "@playwright/test";

/**
 * Clica num gatilho que abre um modal, re-tentando até o dialog aparecer.
 *
 * O clique pode cair ANTES da hidratação do React: o botão já existe no HTML
 * do SSR e recebe foco nativo, mas o onClick ainda não foi anexado — o modal
 * nunca abre e o teste estoura o timeout esperando o dialog (flake visto no
 * CI, onde o server é mais lento; no retry a hidratação vence a corrida).
 *
 * O clique só re-tenta enquanto o dialog não abriu, então um dialog que só
 * demorou a animar não leva um segundo clique.
 */
export async function openDialog(
  page: Page,
  trigger: Locator
): Promise<Locator> {
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    if (!(await dialog.isVisible())) {
      await trigger.click({ timeout: 2_000 });
    }
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  return dialog;
}
