import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Ficha da empresa no console (`/platform/companies/[id]`) — a tela por onde o
 * suporte responde ao chamado: quem é a conta, em que situação está, quem são
 * as pessoas e as duas ações que se fazem sobre elas.
 *
 * A página é SSR (o stub responde `PlatformTenant` e as listas); o que a tela
 * MOSTRA vem do `page.route` de cada teste. O console é de quem é da
 * plataforma, então todo teste troca o papel antes do primeiro `goto` —
 * inclusive no JWT, que é o que o guard server-side lê.
 */
const URL = "/platform/companies/tenant-1";

const tenant = (overrides: Record<string, unknown> = {}) => ({
  id: "tenant-1",
  cnpj: "11.222.333/0001-81",
  razaoSocial: "Metais Horizonte LTDA",
  nomeFantasia: "Metais Horizonte",
  segment: "Metais",
  plan: "pro",
  logoUrl: null,
  isActive: true,
  suspendedAt: null,
  suspensionReason: null,
  trialEndsAt: null,
  maxUsers: null,
  maxSellers: null,
  createdAt: "2026-01-10T00:00:00Z",
  usersCount: 4,
  sellersCount: 3,
  clientsCount: 120,
  factoriesCount: 6,
  ordersCount: 80,
  ordersInPeriod: 12,
  gmvInPeriod: "154000.00",
  lastLoginAt: "2026-09-10T12:00:00Z",
  lastOrderDate: "2026-09-09",
  ...overrides,
});

const user = (overrides: Record<string, unknown> = {}) => ({
  id: "puser-1",
  name: "Ana Ribeiro",
  email: "ana@metais.test",
  role: "OWNER",
  isActive: true,
  lastLoginAt: "2026-09-10T12:00:00Z",
  companyId: "tenant-1",
  companyName: "Metais Horizonte",
  ...overrides,
});

const connection = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

const activitySummary = {
  platformActivitySummary: {
    status: true,
    data: {
      totalActions: 10,
      totalErrors: 0,
      byOperation: [{ key: "createOrder", total: 10, errors: 0 }],
      byDay: [{ key: "2026-09-10", total: 10, errors: 0 }],
    },
  },
};

/** Respostas comuns da ficha; cada teste sobrescreve o que lhe interessa. */
const fichaHandlers = (
  tenantData: Record<string, unknown> = tenant(),
  users: Record<string, unknown>[] = [user()]
) => ({
  PlatformTenant: () => ({
    platformTenant: { status: true, data: tenantData },
  }),
  PlatformTenantUsers: () => ({ tenant_users: connection(users) }),
  PlatformTenantAudit: () => ({ tenant_audit: emptyConnection() }),
  PlatformTenantActivity: () => ({ tenant_activity: emptyConnection() }),
  PlatformTenantActivitySummary: () => activitySummary,
});

const abrirFicha = async (
  page: import("@playwright/test").Page,
  handlers: Record<string, (variables: Record<string, unknown>) => unknown> = {}
) => {
  await grantRole(page, "SU", { alsoJwt: true });
  const spy = await mockGraphql(page, { ...fichaHandlers(), ...handlers });
  await page.goto(URL);
  return spy;
};

test("ficha da empresa: identifica a conta e lista as pessoas", async ({
  page,
}) => {
  await abrirFicha(page);

  await expect(page.getByText("Metais Horizonte").first()).toBeVisible();
  await expect(
    page.getByText("11.222.333/0001-81 · Metais · plano pro")
  ).toBeVisible();
  await expect(page.getByText("Ana Ribeiro")).toBeVisible();
  await expect(page.getByText("ana@metais.test")).toBeVisible();
});

test("ficha da empresa: teste correndo aparece como prazo, não como 'ativa'", async ({
  page,
}) => {
  // É o caso mais acionável do console: conta em teste com dias contados é fila
  // comercial, e um selo de "Ativa" a esconderia.
  const emTeste = tenant({
    plan: "trial",
    trialEndsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  });
  await grantRole(page, "SU", { alsoJwt: true });
  await mockGraphql(page, fichaHandlers(emTeste));
  await page.goto(URL);

  await expect(page.getByText("Em teste")).toBeVisible();
  await expect(
    page.getByText(/Faltam \d+ dias para o fim do teste/)
  ).toBeVisible();
});

test("ficha da empresa: suspender exige motivo e registra o texto", async ({
  page,
}) => {
  // O motivo é o que explica a suspensão meses depois, na auditoria.
  const spy = await abrirFicha(page, {
    SetTenantStatus: () => ({
      setTenantStatus: {
        status: true,
        message: "ok",
        data: {
          id: "tenant-1",
          isActive: false,
          suspendedAt: "2026-09-11T00:00:00Z",
          suspensionReason: "Inadimplência desde 07/2026",
        },
      },
    }),
  });

  await page.getByRole("button", { name: "Suspender" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Suspender empresa")).toBeVisible();

  // Sem motivo, o formulário não deixa ir à rede.
  await dialog.getByRole("button", { name: "Suspender" }).click();
  await expect(dialog.getByText(/é obrigatório/)).toBeVisible();
  expect(spy.calls("SetTenantStatus")).toHaveLength(0);

  await dialog
    .getByRole("textbox", { name: "Motivo" })
    .fill("Inadimplência desde 07/2026");
  await dialog.getByRole("button", { name: "Suspender" }).click();

  const variables = await spy.waitForCall("SetTenantStatus");
  expect(variables).toEqual({
    companyId: "tenant-1",
    input: { isActive: false, reason: "Inadimplência desde 07/2026" },
  });
  await expect(page.getByText("Empresa suspensa.")).toBeVisible();
});

test("ficha da empresa: conta suspensa oferece reativar, sem pedir motivo", async ({
  page,
}) => {
  const suspensa = tenant({
    isActive: false,
    suspendedAt: "2026-08-01T00:00:00Z",
    suspensionReason: "Inadimplência desde 07/2026",
  });

  await grantRole(page, "SU", { alsoJwt: true });
  const spy = await mockGraphql(page, {
    ...fichaHandlers(suspensa),
    SetTenantStatus: () => ({
      setTenantStatus: {
        status: true,
        message: "ok",
        data: {
          id: "tenant-1",
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
        },
      },
    }),
  });
  await page.goto(URL);

  await expect(page.getByText("Suspensa")).toBeVisible();
  await expect(page.getByText("Inadimplência desde 07/2026")).toBeVisible();

  await page.getByRole("button", { name: "Reativar" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Reativar" }).click();

  const variables = await spy.waitForCall("SetTenantStatus");
  expect(variables).toEqual({
    companyId: "tenant-1",
    input: { isActive: true, reason: null },
  });
});

test("ficha da empresa: muda o teto de pessoas do contrato", async ({
  page,
}) => {
  // Campo vazio na tela significa "vale o teto do plano"; preenchido é override
  // do contrato, e os quatro campos vão sempre no input.
  const spy = await abrirFicha(page, {
    PlanCatalog: () => ({
      planCatalog: {
        status: true,
        code: 200,
        message: "ok",
        data: [
          {
            code: "pro",
            label: "Pro",
            features: ["ROUTINES", "ANALYTICS"],
            limits: [
              { key: "USERS", label: "Pessoas", limit: 10 },
              { key: "SELLERS", label: "Vendedores", limit: 5 },
            ],
          },
        ],
      },
    }),
    UpdateTenantPlan: () => ({
      updateTenantPlan: {
        status: true,
        message: "ok",
        data: {
          id: "tenant-1",
          plan: "pro",
          trialEndsAt: null,
          maxUsers: 25,
          maxSellers: null,
        },
      },
    }),
  });

  await page.getByRole("button", { name: "Plano e limites" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Plano e limites")).toBeVisible();

  await dialog
    .getByRole("spinbutton", { name: "Máximo de pessoas" })
    .fill("25");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  const variables = await spy.waitForCall("UpdateTenantPlan");
  expect(variables).toEqual({
    companyId: "tenant-1",
    input: {
      plan: "pro",
      trialEndsAt: null,
      maxUsers: 25,
      maxSellers: null,
    },
  });
  await expect(page.getByText("Plano atualizado.")).toBeVisible();
});

test("ficha da empresa: libera acesso e mostra o link na tela", async ({
  page,
}) => {
  // Não há envio de e-mail no sistema: esta janela é o único canal de entrega.
  await abrirFicha(page, {
    IssueTenantAccessLink: () => ({
      issueTenantAccessLink: {
        status: true,
        message: "ok",
        data: {
          link: "https://girus.app/change-password?token=abc123",
          userEmail: "ana@metais.test",
          userName: "Ana Ribeiro",
        },
      },
    }),
  });

  await page.getByRole("button", { name: "Liberar acesso" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("Gera um link para Ana Ribeiro definir a própria senha.")
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Gerar link" }).click();

  await expect(
    dialog.getByText("https://girus.app/change-password?token=abc123")
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Copiar link" })
  ).toBeVisible();
});

test("ficha da empresa: não oferece 'entrar como' para um SU", async ({
  page,
}) => {
  // O backend recusa, e o botão some para não prometer o que não se pode fazer.
  await grantRole(page, "SU", { alsoJwt: true });
  await mockGraphql(
    page,
    fichaHandlers(tenant(), [
      user({ id: "su-1", name: "Suporte Girus", role: "SU" }),
      user({ id: "puser-2", name: "Bruno Alves", email: "bruno@metais.test" }),
    ])
  );
  await page.goto(URL);

  const linhaSu = page.getByRole("row").filter({ hasText: "Suporte Girus" });
  await expect(
    linhaSu.getByRole("button", { name: "Entrar como" })
  ).toHaveCount(0);

  const linhaBruno = page.getByRole("row").filter({ hasText: "Bruno Alves" });
  await expect(
    linhaBruno.getByRole("button", { name: "Entrar como" })
  ).toBeVisible();
});

test("ficha da empresa: empresa sem pessoas explica o que aconteceu", async ({
  page,
}) => {
  await grantRole(page, "SU", { alsoJwt: true });
  await mockGraphql(page, fichaHandlers(tenant(), []));
  await page.goto(URL);

  await expect(page.getByText("Nenhuma pessoa cadastrada")).toBeVisible();
});
