import { EXPIRED_VISIT_TOKEN, WEEK_VISIT_TOKEN } from "../support/stub-backend";
import { expect, test } from "../support/fixtures";

/**
 * A folha de resposta da rota do dia, ponta a ponta.
 *
 * Vale um E2E — e não só testes de unidade — pelas mesmas razões do portal do
 * cliente, mais uma que é só desta tela:
 *
 *  • **Ela tem que abrir SEM sessão.** O `proxy.ts` erra do lado seguro e manda
 *    para o login tudo que não está liberado. `/r/` entrou na liberação por
 *    prefixo junto com `/p/`; um redirecionamento aqui deixaria o vendedor numa
 *    tela de login às 20h, com a folha na mão.
 *
 *  • **O envio é Server Action.** O POST sai do servidor do Next, sem Apollo e
 *    sem rota de API. Nenhum teste de unidade cobre o caminho do clique até a
 *    requisição.
 *
 *  • **É a única porta do sistema que ESCREVE sem usuário logado.** Se o link
 *    morto deixasse de mostrar a tela de recusa e passasse a renderizar o
 *    formulário vazio, o defeito seria invisível em tudo menos aqui.
 */
// Sem sessão, de propósito: quem abre este link é um vendedor no celular, fora
// do app. Com o storageState do usuário logado, o teste provaria menos.
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "token-de-resposta-do-dia";

test.describe("Folha de resposta da rota", () => {
  test("abre sem sessão e lista as paradas do dia", async ({ page }) => {
    const response = await page.goto(`/r/${TOKEN}`);

    // 200, e não 307 para o login: é o que a liberação por prefixo garante.
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/r/${TOKEN}$`));

    // O cabeçalho existe para o vendedor reconhecer de quem é a página antes de
    // digitar o dia de trabalho dele.
    await expect(
      page.getByRole("heading", { name: "Empresa Teste" })
    ).toBeVisible();
    await expect(page.getByText("Orlando Vendedor · 21/09/2026")).toBeVisible();

    await expect(page.getByText("Depósito Central")).toBeVisible();
    await expect(page.getByText("Casa do Construtor")).toBeVisible();
    // As fábricas situam a parada: numa folha de oito clientes, o nome sozinho
    // não distingue a visita da Alfa da visita da Beta.
    await expect(
      page.getByText("Fábrica Alfa, Fábrica Beta · Feira de Santana/BA")
    ).toBeVisible();
  });

  test("parada pendente abre em branco e a já respondida abre preenchida", async ({
    page,
  }) => {
    await page.goto(`/r/${TOKEN}`);

    // Em branco é o que separa "não respondi" de "respondi": um seletor já
    // marcado gravaria um desfecho que o vendedor não deu.
    await expect(page.locator('select[name="status__stop-1"]')).toHaveValue("");
    await expect(page.locator('input[name="order__stop-1"]')).not.toBeChecked();

    await expect(page.locator('select[name="status__stop-2"]')).toHaveValue(
      "COMPLETED"
    );
    await expect(page.locator('select[name="outcome__stop-2"]')).toHaveValue(
      "SOLD"
    );
    await expect(page.locator('textarea[name="notes__stop-2"]')).toHaveValue(
      "cliente pediu para voltar dia 5"
    );
    // O sistema já achou o pedido sozinho; perguntar de novo faria o registro
    // parecer perdido.
    await expect(page.locator('input[name="order__stop-2"]')).toBeChecked();
  });

  test("o vendedor responde uma parada e recebe a confirmação", async ({
    page,
  }) => {
    await page.goto(`/r/${TOKEN}`);

    await page
      .locator('select[name="status__stop-1"]')
      .selectOption("COMPLETED");
    await page.locator('input[name="order__stop-1"]').check();
    await page.locator('textarea[name="notes__stop-1"]').fill("levou 3 caixas");

    await page.getByRole("button", { name: /enviar respostas/i }).click();

    await expect(
      page.getByText("1 visita registrada. 1 pedido vinculado.")
    ).toBeVisible();
  });

  test("não envia nada quando nenhuma situação foi escolhida", async ({
    page,
  }) => {
    await page.goto(`/r/${TOKEN}`);

    // A parada 2 já vem respondida, então o formulário NÃO está vazio: o que se
    // prende aqui é o caso do vendedor que só escreveu observação, sem dizer o
    // que aconteceu. Limpar a situação dela deixa o envio de fato vazio.
    await page.locator('select[name="status__stop-2"]').selectOption("");
    await page.locator('textarea[name="notes__stop-1"]').fill("passei lá");

    await page.getByRole("button", { name: /enviar respostas/i }).click();

    await expect(
      page.getByText("Escolha o que aconteceu em pelo menos uma visita.")
    ).toBeVisible();
  });

  test("link morto mostra a recusa, e não um formulário vazio", async ({
    page,
  }) => {
    const response = await page.goto(`/r/${EXPIRED_VISIT_TOKEN}`);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Este link não está mais válido" })
    ).toBeVisible();
    // A prova de que não é o formulário renderizado sem dados.
    await expect(
      page.getByRole("button", { name: /enviar respostas/i })
    ).toHaveCount(0);
  });
});

test.describe("Folha de resposta da semana", () => {
  test("mostra o intervalo e separa as paradas por dia", async ({ page }) => {
    const response = await page.goto(`/r/${WEEK_VISIT_TOKEN}`);
    expect(response?.status()).toBe(200);

    await expect(
      page.getByText("Orlando Vendedor · Semana de 21/09/2026 a 27/09/2026")
    ).toBeVisible();
    // Uma folha, vários dias: sem o título do dia, duas paradas de dias
    // diferentes seriam indistinguíveis.
    await expect(page.getByText("segunda-feira, 21/09/2026")).toBeVisible();
    await expect(page.getByText("quarta-feira, 23/09/2026")).toBeVisible();
    await expect(page.getByText("Depósito Central")).toBeVisible();
    await expect(page.getByText("Casa do Construtor")).toBeVisible();
  });
});
