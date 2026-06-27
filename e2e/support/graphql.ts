import type { Page, Route } from "@playwright/test";

/**
 * Intercepta o endpoint GraphQL no browser e responde por `operationName`,
 * deixando os fluxos E2E determinísticos e independentes do backend.
 *
 * Cada entrada de `handlers` recebe as `variables` da operação e devolve o
 * objeto `data` da resposta GraphQL. Operações sem handler caem no `fallback`,
 * que por padrão responde `{ data: {} }` (suficiente para queries não críticas).
 */
type GraphqlBody = {
  operationName?: string;
  variables?: Record<string, unknown>;
};
type Handler = (variables: Record<string, unknown>) => unknown;

export async function mockGraphql(
  page: Page,
  handlers: Record<string, Handler>,
  fallback: Handler = () => ({})
): Promise<void> {
  await page.route("**/graphql", async (route: Route) => {
    const body = route.request().postDataJSON() as GraphqlBody | null;
    const op = body?.operationName ?? "";
    const handler = handlers[op] ?? fallback;
    const data = handler(body?.variables ?? {});

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });
}

/** Conexão Relay vazia — formato padrão de lista paginada (useTableData). */
export function emptyConnection() {
  return {
    edges: [],
    pageInfo: { hasNextPage: false, endCursor: null },
    totalCount: 0,
  };
}

/** Token de 3 segmentos só para satisfazer o cookie/Bearer — não é validado nos mocks. */
export const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlMmUtdXNlciJ9.e2e-signature";

/** Payload de sucesso do login, no formato esperado por LoginContent. */
export function loginSuccess(overrides: Record<string, unknown> = {}) {
  return {
    login: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        accessToken: FAKE_JWT,
        refreshToken: FAKE_JWT,
        userId: "user-e2e-1",
        userName: "Vendedor Teste",
        companyName: "Empresa Teste",
        role: "SELLER",
        ...overrides,
      },
    },
  };
}

/** Payload de falha do login (credenciais inválidas). */
export function loginFailure(
  message = "Credenciais inválidas. Verifique seu e-mail e senha."
) {
  return {
    login: { status: false, code: 401, message, data: null },
  };
}

/** Respostas vazias para as 3 queries que o dashboard dispara ao montar. */
export const emptyDashboardQueries: Record<string, Handler> = {
  OrdersByPeriod: () => ({ orders_by_period: { edges: [], totalCount: 0 } }),
  CompanyClientsCount: () => ({ company_clients_count: { totalCount: 0 } }),
  SchedulesByPeriod: () => ({ schedules_by_period: { edges: [] } }),
};
