import { expect, test } from "../support/fixtures";

/**
 * "Fazer pedido" no portal: uma tela só para repor o que acaba e pedir do
 * catálogo. O cliente toca "Adicionar", decide a quantidade na "Minha lista"
 * e envia. O envio é Server Action (sai do servidor do Next), então o stub
 * ECOA o que recebeu — é isso que prova o que foi enviado.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "token-de-teste-do-portal";
// Torneira e Registro são da Alfa; Sifão e Chuveiro, da Beta.
const ALFA = `/p/${TOKEN}/pedido?f=fab-alfa`;
const BETA = `/p/${TOKEN}/pedido?f=fab-beta`;

test("o menu leva ao Fazer pedido, e as rotas antigas redirecionam", async ({
  page,
}) => {
  await page.goto(`/p/${TOKEN}`);
  await page.getByRole("link", { name: "Fazer pedido" }).first().click();
  await expect(page).toHaveURL(new RegExp("/pedido$"));

  for (const old of ["repor", "orcamento"]) {
    await page.goto(`/p/${TOKEN}/${old}`);
    await expect(page).toHaveURL(new RegExp("/pedido$"));
  }
});

test("sem fábrica escolhida, pede para escolher antes de mostrar produtos", async ({
  page,
}) => {
  await page.goto(`/p/${TOKEN}/pedido`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Fazer pedido" })
  ).toBeVisible();
  await expect(page.getByText("Escolha a fábrica do orçamento")).toBeVisible();
  // Não existe orçamento de "todas": nada de produto nem de lista ainda.
  await expect(page.getByText("Torneira Teste")).toBeHidden();
  await expect(page.getByText("Chuveiro Teste")).toBeHidden();
  await expect(page.getByRole("button", { name: "Todas" })).toHaveCount(0);

  // A escolha são botões seletores (como o "Valores de" das comissões).
  const factories = page.getByRole("group", { name: "Fábrica do orçamento" });
  // Nada escolhido ainda: nenhum botão marcado, e nada para enviar.
  await expect(factories.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Enviar ao representante" })
  ).toHaveCount(0);
  await factories.getByRole("button", { name: "Fábrica Beta" }).click();

  await expect(page).toHaveURL(/f=fab-beta/);
  await expect(
    factories.getByRole("button", { name: "Fábrica Beta" })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Chuveiro Teste")).toBeVisible();
  await expect(page.getByText("Sifão Teste")).toBeVisible();
  await expect(page.getByText("Registro Teste")).toBeHidden();
  await expect(page.getByText("Torneira Teste")).toBeHidden();
});

test("mostra o que está acabando e o catálogo com preço e última compra", async ({
  page,
}) => {
  await page.goto(ALFA);

  await expect(
    page.getByRole("heading", { name: "Está acabando" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Produtos da Fábrica Alfa" })
  ).toBeVisible();
  await expect(
    page.getByText(/Preços estimados pela sua tabela/)
  ).toBeVisible();
  await expect(page.getByText("Torneira Teste")).toBeVisible();
  await expect(page.getByText("Registro Teste")).toBeVisible();
  // Só a fábrica do orçamento.
  await expect(page.getByText("Sifão Teste")).toBeHidden();

  await expect(page.getByText("Promoção")).toBeVisible();
  await expect(page.getByText(/9,90 \/ un\./)).toBeVisible();
  await expect(page.getByText(/15,00 \/ un\./)).toBeVisible();
  // A embalagem mínima vem na linha, com o preço da embalagem fechada.
  await expect(page.getByText("R$ 180,00 a embalagem").first()).toBeVisible();
  // O preço da última compra, para o cliente comparar.
  await expect(
    page.getByText(/Última compra: R\$\s14,20 \/ un\./)
  ).toBeVisible();
  await expect(page.getByText("Nenhum produto ainda")).toBeVisible();
});

test("o que já foi pedido aparece na linha do produto", async ({ page }) => {
  await page.goto(BETA);
  await expect(
    page.getByText(/Já pedido: 6 unidades, esperando o representante/)
  ).toBeVisible();
  await expect(
    page.getByText("Preço com o representante").first()
  ).toBeVisible();
  await expect(page.getByText(/Última compra: R\$\s120,00/)).toBeVisible();
});

test("a busca filtra o catálogo pelo servidor e guarda a fábrica", async ({
  page,
}) => {
  await page.goto(BETA);
  // Sem botão: Enter busca na hora (sem esperar a pausa de digitação).
  await page.getByLabel("Buscar produto").fill("chuveiro");
  await page.getByLabel("Buscar produto").press("Enter");

  await expect(page).toHaveURL(/q=chuveiro/);
  await expect(page).toHaveURL(/f=fab-beta/);
  await expect(page.getByText("Chuveiro Teste")).toBeVisible();
});

test("busca enquanto digita, sem recarregar, e campo vazio volta a lista toda", async ({
  page,
}) => {
  await page.goto(BETA);
  // Marca o documento: se a busca recarregasse a página, a marca sumiria.
  await page.evaluate(() => {
    (window as unknown as { __sameDocument: boolean }).__sameDocument = true;
  });

  const search = page.getByLabel("Buscar produto");
  await search.fill("chuveiro");
  await expect(page).toHaveURL(/q=chuveiro/);

  await search.fill("");
  await expect(page).not.toHaveURL(/q=/);
  await expect(page).toHaveURL(/f=fab-beta/);
  await expect(page.getByText("Sifão Teste").first()).toBeVisible();

  const sameDocument = await page.evaluate(
    () => (window as unknown as { __sameDocument?: boolean }).__sameDocument
  );
  expect(sameDocument).toBe(true);
});

test("adiciona, ajusta a quantidade e envia com recado, sem desconto", async ({
  page,
}) => {
  await page.goto(ALFA);

  await page
    .getByRole("button", { name: "Adicionar Torneira Teste à lista" })
    .click();
  await page
    .getByRole("button", { name: "Adicionar Registro Teste à lista" })
    .click();

  // A sugestão da reposição entra como quantidade, e embaixo do campo vem
  // quantas embalagens isso é.
  await expect(page.locator("#qty__prod-repor-1")).toHaveValue("24");
  await expect(
    page.getByText("2 embalagens de 12 un. = 24 unidades")
  ).toBeVisible();

  // O "+" e o "−" andam uma embalagem por vez.
  await page
    .getByRole("button", { name: "Uma embalagem a mais de Torneira Teste" })
    .click();
  await expect(page.locator("#qty__prod-repor-1")).toHaveValue("36");
  await page
    .getByRole("button", { name: "Uma embalagem a menos de Torneira Teste" })
    .click();
  await expect(page.locator("#qty__prod-repor-1")).toHaveValue("24");

  // Desconto é conversa com o representante, não campo da tela.
  await expect(page.locator("#discountPercent")).toHaveCount(0);

  await page.locator("#qty__prod-cat-1").fill("20");
  await page.locator("#note").fill("Entrega sexta");
  await page
    .getByRole("complementary", { name: "Minha lista" })
    .getByRole("button", { name: "Enviar ao representante" })
    .click();

  // Enviado, o portal leva à tela do pedido enviado — e o que foi enviado
  // aparece lá (o stub devolve o eco como recado).
  await expect(page).toHaveURL(
    new RegExp(`/p/${TOKEN}/enviados/sent-1\\?enviado=1$`)
  );
  await expect(page.getByText("Pedido enviado!")).toBeVisible();
  await expect(
    page.getByText(
      "Orçamento: prod-repor-1=24, prod-cat-1=20; desconto=-; recado=Entrega sexta"
    )
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Baixar PDF" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enviar por WhatsApp" })
  ).toBeVisible();

  // Voltando ao Fazer pedido, a lista daquela fábrica esvaziou.
  await page.goto(ALFA);
  await expect(page.getByText("Nenhum produto ainda")).toBeVisible();
});

test("tirar da lista devolve o botão Adicionar", async ({ page }) => {
  await page.goto(BETA);

  await page
    .getByRole("button", { name: "Adicionar Sifão Teste à lista" })
    .click();
  await page
    .getByRole("button", { name: "Tirar Sifão Teste da lista" })
    .click();

  await expect(
    page.getByRole("button", { name: "Adicionar Sifão Teste à lista" })
  ).toBeVisible();
  await expect(page.locator("#qty__prod-repor-2")).toHaveCount(0);
});

test("cada fábrica tem a sua lista", async ({ page }) => {
  await page.goto(ALFA);
  await page
    .getByRole("button", { name: "Adicionar Registro Teste à lista" })
    .click();
  await expect(page.locator("#qty__prod-cat-1")).toBeVisible();

  await page.goto(BETA);
  await expect(page.getByText("Nenhum produto ainda")).toBeVisible();

  // De volta à Alfa, a lista dela continua lá.
  await page.goto(ALFA);
  await expect(page.locator("#qty__prod-cat-1")).toBeVisible();
});

test("a quantidade respeita a embalagem mínima", async ({ page }) => {
  await page.goto(ALFA);
  await page
    .getByRole("button", { name: "Adicionar Torneira Teste à lista" })
    .click();

  // 13 não fecha embalagem: ao sair do campo, sobe para a próxima (24).
  const qty = page.locator("#qty__prod-repor-1");
  await qty.fill("13");
  await qty.blur();
  await expect(qty).toHaveValue("24");

  // Apagada, a quantidade não deixa enviar e diz o que falta.
  await qty.fill("");
  await page
    .getByRole("complementary", { name: "Minha lista" })
    .getByRole("button", { name: "Enviar ao representante" })
    .click();
  await expect(page.getByText("Informe a quantidade.")).toBeVisible();
  await expect(page.getByText(/^Orçamento:/)).toHaveCount(0);
});

test("o cabeçalho mostra o valor e envia pelo modal, com o mesmo recado da lista", async ({
  page,
}) => {
  await page.goto(ALFA);
  const send = page
    .getByRole("button", { name: "Enviar ao representante" })
    .first();

  // Lista vazia: o valor diz isso e o botão do cabeçalho não envia nada.
  await expect(page.getByText("Lista vazia")).toBeVisible();
  await expect(send).toBeDisabled();

  await page
    .getByRole("button", { name: "Adicionar Registro Teste à lista" })
    .click();
  await page.locator("#qty__prod-cat-1").fill("20");
  // O total estimado acompanha a lista, ao lado do botão.
  await expect(page.getByText(/^1 produto · R\$/)).toBeVisible();

  // O recado escrito na caixa lateral é o mesmo do modal.
  await page.locator("#note").fill("Entrega sexta");
  await send.click();
  const modal = page.getByRole("dialog", { name: "Enviar ao representante" });
  await expect(modal).toBeVisible();
  await expect(modal.locator("#note-modal")).toHaveValue("Entrega sexta");
  await modal.locator("#note-modal").fill("Entrega segunda");
  await modal.getByRole("button", { name: "Enviar", exact: true }).click();

  await expect(page).toHaveURL(
    new RegExp(`/p/${TOKEN}/enviados/sent-1\\?enviado=1$`)
  );
  await expect(
    page.getByText(
      "Orçamento: prod-cat-1=20; desconto=-; recado=Entrega segunda"
    )
  ).toBeVisible();
});
