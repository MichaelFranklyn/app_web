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
type Variables = Record<string, unknown>;
type Handler = (variables: Variables) => unknown;

/**
 * Espião das operações interceptadas. Como o mock casa por `operationName` e
 * ignora as variáveis, o `spy` é o que permite afirmar QUE PAYLOAD o front
 * enviou de fato (ex.: os itens mapeados numa importação), não só que a tela
 * reagiu à resposta.
 */
export interface GraphqlSpy {
  /** Todas as variables recebidas por essa operação, na ordem de chegada. */
  calls(op: string): Variables[];
  /** Variables da última chamada dessa operação (ou undefined se não houve). */
  lastVariables(op: string): Variables | undefined;
  /** Espera até a operação ser chamada ≥1 vez e devolve as variables dela. */
  waitForCall(op: string, timeoutMs?: number): Promise<Variables>;
}

export async function mockGraphql(
  page: Page,
  handlers: Record<string, Handler>,
  fallback: Handler = () => ({})
): Promise<GraphqlSpy> {
  const recorded = new Map<string, Variables[]>();

  await page.route("**/graphql", async (route: Route) => {
    const body = route.request().postDataJSON() as GraphqlBody | null;
    const op = body?.operationName ?? "";
    const variables = body?.variables ?? {};

    const list = recorded.get(op) ?? [];
    list.push(variables);
    recorded.set(op, list);

    const handler = handlers[op] ?? fallback;
    const data = handler(variables);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });

  return {
    calls: (op) => recorded.get(op) ?? [],
    lastVariables: (op) => recorded.get(op)?.at(-1),
    async waitForCall(op, timeoutMs = 10_000) {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        const last = recorded.get(op)?.at(-1);
        if (last) return last;
        if (Date.now() > deadline) {
          throw new Error(
            `Operação GraphQL "${op}" não foi chamada em ${timeoutMs}ms.`
          );
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    },
  };
}

/** Conexão Relay vazia — formato padrão de lista paginada (useTableData). */
export function emptyConnection() {
  return {
    edges: [],
    pageInfo: { hasNextPage: false, endCursor: null },
    totalCount: 0,
  };
}

/**
 * Token de 3 segmentos só para satisfazer o cookie/Bearer — não é validado nos
 * mocks, mas o PAYLOAD é lido pelo servidor (roleGuard/requireAdminPage): sem
 * `role` admin, /sellers e /users redirecionam para /dashboard.
 * Payload: {"sub":"e2e-user","role":"owner"}
 */
export const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlMmUtdXNlciIsInJvbGUiOiJvd25lciJ9.e2e-signature";

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
        // O estado autenticado padrão é um VENDEDOR (várias specs assumem o
        // comportamento sem seletor de vendedor). Specs de ações admin trocam
        // o papel do cookie com grantRole(page, "OWNER") — ver support/role.ts.
        // O guard server-side usa o FAKE_JWT (role owner), que deixa passar.
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

/**
 * `order.data` da ORDER_DETAIL_QUERY — fonte única para os specs de orders/[id].
 *
 * Precisa espelhar a SELEÇÃO da query, não só o que o teste afirma: o
 * `InvoiceOrderModal`, montado no header, lê `availablePaymentTerms.length` e
 * `installments.length` já no render. Ambos são não-nulos no schema, então
 * omiti-los devolve `undefined` e derruba a página inteira.
 */
export function orderDetailData(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    orderDate: "2026-06-22",
    totalAmount: "1000.00",
    commissionAmount: "100.00",
    status: "DRAFT",
    freightType: null,
    fileUrl: null,
    isFileParsed: false,
    notes: null,
    createdAt: "2026-06-22T00:00:00Z",
    invoicedAt: null,
    paymentTermId: null,
    commissionCalcBasis: "FATURAMENTO",
    seller: { id: "s-1", name: "Vendedor" },
    client: { id: "c-1", razaoSocial: "Cliente LTDA", nomeFantasia: "Cliente" },
    factory: {
      id: "f-1",
      nomeFantasia: "Fábrica",
      razaoSocial: "Fábrica LTDA",
    },
    paymentTerm: null,
    availablePaymentTerms: [],
    installments: [],
    ...overrides,
  };
}
