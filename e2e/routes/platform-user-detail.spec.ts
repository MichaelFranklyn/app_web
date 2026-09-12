import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Ficha da pessoa no console (`/platform/users/[id]`).
 *
 * Existe ao lado da ficha da empresa porque o chamado chega dos dois jeitos —
 * ora pela empresa ("ninguém da tal empresa entra"), ora pela pessoa ("fulano
 * perdeu a senha"). As duas ações de suporte são as mesmas, e é isso que os
 * testes prendem: a partir daqui também se libera acesso e se entra como.
 */
const URL = "/platform/users/puser-1";

const pessoa = (overrides: Record<string, unknown> = {}) => ({
  id: "puser-1",
  name: "Ana Ribeiro",
  email: "ana@metais.test",
  role: "SELLER",
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: "2026-02-20T00:00:00Z",
  companyId: "tenant-1",
  companyName: "Metais Horizonte",
  ...overrides,
});

const acao = (overrides: Record<string, unknown> = {}) => ({
  id: "act-1",
  createdAt: "2026-09-10T14:03:21Z",
  operation: "createOrder",
  status: "OK",
  errorMessage: null,
  durationMs: 240,
  ...overrides,
});

const handlers = (
  user: Record<string, unknown> = pessoa(),
  entries: Record<string, unknown>[] = [acao()]
) => ({
  PlatformUser: () => ({ platformUser: { status: true, data: user } }),
  PlatformUserActivity: () => ({
    user_activity: entries.length
      ? {
          edges: entries.map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
          totalCount: 37,
        }
      : emptyConnection(),
  }),
});

const abrir = async (
  page: import("@playwright/test").Page,
  extra: Record<string, (variables: Record<string, unknown>) => unknown> = {},
  user = pessoa(),
  entries = [acao()]
) => {
  await grantRole(page, "SU", { alsoJwt: true });
  const spy = await mockGraphql(page, { ...handlers(user, entries), ...extra });
  await page.goto(URL);
  return spy;
};

test("ficha da pessoa: quem é, de que empresa e o que ela fez", async ({
  page,
}) => {
  await abrir(page);

  await expect(page.getByText("Ana Ribeiro")).toBeVisible();
  await expect(page.getByText("ana@metais.test")).toBeVisible();
  await expect(page.getByText("Metais Horizonte")).toBeVisible();
  await expect(page.getByText("Vendedor", { exact: true })).toBeVisible();
  await expect(page.getByText("Hoje")).toBeVisible();
  // A contagem só aparece quando há linha: "0 de 0" descreveria um recorte
  // que não existe.
  await expect(
    page.getByText("As 1 ações mais recentes, de 37 nos últimos 90 dias.")
  ).toBeVisible();
});

test("ficha da pessoa: leva para a ficha da empresa dela", async ({ page }) => {
  await abrir(page);

  await expect(
    page.getByRole("link", { name: "abrir a ficha" })
  ).toHaveAttribute("href", "/platform/companies/tenant-1");
});

test("ficha da pessoa: conta que nunca entrou não se confunde com abandonada", async ({
  page,
}) => {
  // Uma é conta que nunca começou; a outra é conta abandonada. O suporte age
  // diferente em cada caso.
  await abrir(page, {}, pessoa({ lastLoginAt: null }), []);

  await expect(page.getByText("Nunca entrou")).toBeVisible();
  await expect(page.getByText("Nenhuma ação registrada")).toBeVisible();
});

test("ficha da pessoa: conta desativada diz que ela não consegue entrar", async ({
  page,
}) => {
  await abrir(page, {}, pessoa({ isActive: false }));

  await expect(page.getByText("Inativa")).toBeVisible();
  await expect(page.getByText("não consegue entrar")).toBeVisible();
});

test("ficha da pessoa: libera acesso pelo mesmo caminho da ficha da empresa", async ({
  page,
}) => {
  const spy = await abrir(page, {
    IssueTenantAccessLink: () => ({
      issueTenantAccessLink: {
        status: true,
        message: "ok",
        data: {
          link: "https://girus.app/change-password?token=xyz789",
          userEmail: "ana@metais.test",
          userName: "Ana Ribeiro",
        },
      },
    }),
  });

  await page.getByRole("button", { name: "Liberar acesso" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Gerar link" }).click();

  const variables = await spy.waitForCall("IssueTenantAccessLink");
  expect(variables).toEqual({ userId: "puser-1" });
  await expect(
    dialog.getByText("https://girus.app/change-password?token=xyz789")
  ).toBeVisible();
});

test("ficha da pessoa: entrar como troca a sessão e recarrega a página", async ({
  page,
}) => {
  // A troca acontece no SERVIDOR (o token é httpOnly) e a página recarrega de
  // verdade: um router.push manteria o cache do console numa sessão que agora é
  // de outra empresa.
  await grantRole(page, "SU", { alsoJwt: true });
  await mockGraphql(page, handlers());

  let sessionBody: unknown;
  await page.route("**/api/session", async (route) => {
    sessionBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true }),
    });
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Entrar como" }).click();

  // Recarrega de verdade e sai da ficha. O destino final depende de quem a
  // sessão passou a ser — aqui os cookies não mudam (a rota é interceptada), e
  // o SU acaba de volta no console; o que importa é que houve recarga.
  await page.waitForURL((url) => !url.pathname.startsWith("/platform/users"));
  expect(sessionBody).toEqual({
    action: "impersonate",
    input: { userId: "puser-1" },
  });
});
