import { expect, test } from "../support/fixtures";

/**
 * A landing e os arquivos que os buscadores leem precisam responder SEM sessão.
 *
 * O teste existe porque o `proxy.ts` erra do lado seguro: ele manda para o
 * login tudo o que não está explicitamente liberado. Ao publicar a landing, a
 * raiz respondia 307 para o login; e, depois de liberá-la, `robots.txt` e
 * `sitemap.xml` continuavam redirecionando porque o `matcher` não os excluía —
 * o buscador receberia a tela de login no lugar do sitemap. Nenhum dos dois
 * aparece rodando o app logado, só numa requisição anônima como esta.
 */
// Sem sessão, de propósito: os specs de `e2e/routes/**` rodam no projeto
// "authenticated" (storageState de usuário logado), e é justamente o visitante
// anônimo — o buscador, o lead que chegou de um link — que este teste
// representa. Com cookie no navegador, os três casos passariam sem provar nada.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Páginas públicas de marketing", () => {
  test("a raiz abre sem sessão e mostra as portas de entrada", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);

    await expect(
      page.getByRole("heading", { name: /o comercial da sua representação/i })
    ).toBeVisible();
    // `exact` é obrigatório aqui: sem ele o `name` casa por trecho e os dois
    // "Testar 14 dias grátis" do corpo entrariam na conta do botão do topo.
    await expect(
      page.getByRole("link", { name: "Testar grátis", exact: true })
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: "Testar 14 dias grátis", exact: true })
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: "Entrar" }).first()
    ).toBeVisible();
  });

  test("as seções da página respondem às âncoras do topo", async ({ page }) => {
    await page.goto("/");

    // A página é uma só: os links do topo são âncoras, e cada uma precisa ter
    // destino. Âncora sem seção correspondente não quebra nada visivelmente —
    // só deixa de rolar, e ninguém percebe até um lead reclamar.
    for (const anchor of ["recursos", "como-funciona", "planos"]) {
      await expect(page.locator(`#${anchor}`)).toBeAttached();
    }

    await expect(
      page.getByRole("heading", { name: /da tabela de preço ao acerto/i })
    ).toBeVisible();
  });

  test("preços e páginas legais abrem sem sessão", async ({ page }) => {
    // Cada rota nova precisa entrar em `MARKETING_ROUTES` para o proxy deixar
    // passar. Esquecer a lista não quebra o build — a página só responde 307
    // para o login, e isso costuma ser descoberto pelo lead, não por nós.
    const routes = [
      { path: "/precos", heading: /quanto custa organizar o comercial/i },
      { path: "/termos", heading: /termos de uso/i },
      { path: "/privacidade", heading: /política de privacidade/i },
      { path: "/assinar", heading: /contratar o girus/i },
    ];

    for (const route of routes) {
      const response = await page.goto(route.path);

      expect(response?.status(), `status de ${route.path}`).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${route.path}$`));
      await expect(
        page.getByRole("heading", { name: route.heading, level: 1 })
      ).toBeVisible();
    }
  });

  test("robots.txt e sitemap.xml não caem no login", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Disallow: /dashboard");
    expect(robotsBody).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("<urlset");
    // O sitemap sai da mesma lista que o proxy libera; se as duas coisas
    // divergirem, é aqui que aparece.
    for (const route of ["/precos", "/termos", "/privacidade"]) {
      expect(sitemapBody, `sitemap anuncia ${route}`).toContain(route);
    }
    // `/assinar` é pública mas NÃO indexável: é meio de funil, e na busca
    // apareceria no lugar da página de preços.
    expect(sitemapBody).not.toContain("/assinar");
  });

  test("o checkout simulado vai do plano ao resultado", async ({ page }) => {
    await page.goto("/precos");
    await page.getByRole("link", { name: "Assinar o Pro" }).click();

    await expect(page).toHaveURL(/\/assinar\?plano=pro$/);
    // O aviso de simulação não é decoração: é o que impede alguém de achar que
    // está pagando de verdade. Se sumir da tela, este teste cai.
    await expect(
      page.getByText(/nenhum pagamento é processado/i)
    ).toBeVisible();

    await page.getByRole("button", { name: /continuar/i }).click();

    await page.getByLabel(/razão social/i).fill("Representações Demo LTDA");
    // `pressSequentially` nos campos com máscara: o `fill` escreve o valor de
    // uma vez e o imask reclama de mudança fora da máscara.
    await page.getByLabel(/cnpj/i).pressSequentially("11222333000181");
    await page.getByLabel(/e-mail/i).fill("financeiro@demo.com");
    await page.getByRole("button", { name: /ir para o pagamento/i }).click();

    await page
      .getByLabel(/número do cartão/i)
      .pressSequentially("4242424242424242");
    await page.getByLabel(/nome impresso/i).fill("MICHAEL F SILVA");
    await page.getByLabel(/validade/i).pressSequentially("1230");
    await page.getByLabel(/código de segurança/i).pressSequentially("123");
    await page.getByRole("button", { name: /confirmar assinatura/i }).click();

    await expect(
      page.getByRole("heading", { name: /assinatura simulada com sucesso/i })
    ).toBeVisible();
  });

  test("o sistema continua exigindo sessão", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login\?href=%2Fdashboard$/);
  });
});
