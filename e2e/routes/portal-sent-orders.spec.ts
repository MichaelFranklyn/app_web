import { expect, test } from "../support/fixtures";

/**
 * "Pedidos" no portal: o cliente acompanha o que mandou ao
 * representante. SSR puro — os dados vêm de `PortalSentOrders` e
 * `PortalSentOrder` no stub.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "token-de-teste-do-portal";

test("o menu leva à lista, e o cartão abre o pedido enviado", async ({
  page,
}) => {
  await page.goto(`/p/${TOKEN}`);
  // Exato: "Fazer pedido" também casa com /pedido/.
  await page
    .getByRole("link", { name: "Pedidos", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`/p/${TOKEN}/enviados$`));

  await expect(
    page.getByRole("heading", { level: 1, name: "Pedidos", exact: true })
  ).toBeVisible();
  // Placar do topo (stub: 1 enviado, aguardando) e o atalho para pedir.
  await expect(page.getByText("Aguardando", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Fazer pedido" }).last()
  ).toBeVisible();
  // Sem "?enviado=1", nada de confirmação de envio.
  await expect(page.getByText("Pedido enviado!")).toHaveCount(0);

  await page.getByRole("link", { name: /Fábrica Alfa/ }).click();
  await expect(page).toHaveURL(new RegExp(`/p/${TOKEN}/enviados/sent-1$`));
  await expect(
    page.getByRole("heading", { level: 1, name: "Orçamento #42" })
  ).toBeVisible();
  // Breadcrumb volta para a lista.
  await expect(
    page
      .getByRole("navigation", { name: /breadcrumb|caminho/i })
      .getByRole("link", { name: "Pedidos" })
  ).toBeVisible();
  await expect(page.getByText("Torneira Teste")).toBeVisible();
  await expect(page.getByRole("button", { name: "Baixar PDF" })).toBeVisible();

  // Email pelo navegador: a prévia mostra para quem, o assunto e a mensagem,
  // e o botão abre o app de email do aparelho já preenchido.
  await page.getByRole("button", { name: "Enviar por email" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Para");
  await expect(dialog).toContainText("Assunto");
  await expect(dialog).toContainText("Pedido Fábrica Alfa —");
  await expect(dialog).toContainText("Torneira Teste");
  const mail = dialog.getByRole("link", { name: "Abrir no meu email" });
  await expect(mail).toHaveAttribute("href", /^mailto:[^?]+\?subject=/);
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toHaveCount(0);

  await expect(
    page.getByRole("button", { name: "Enviar por WhatsApp" })
  ).toBeVisible();
});

test("pedido enviado que não é do cliente mostra o não encontrado", async ({
  page,
}) => {
  await page.goto(`/p/${TOKEN}/enviados/outro-pedido`);

  await expect(
    page.getByRole("link", { name: "Ver os pedidos" })
  ).toBeVisible();
  await expect(page.getByText("Torneira Teste")).toHaveCount(0);
});
