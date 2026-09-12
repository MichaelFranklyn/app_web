import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/** O seed do SSR tem teste próprio (useSeedQuery); aqui o cache começa frio. */
vi.mock("@/hooks/useSeedQuery", () => ({ useSeedQuery: () => {} }));

import {
  PLATFORM_TENANT_QUERY,
  TENANT_ACTIVITY_QUERY,
  TENANT_ACTIVITY_SUMMARY_QUERY,
  TENANT_AUDIT_QUERY,
  TENANT_USERS_QUERY,
} from "./gql";
import { TenantDetailContentProps } from "./interface";
import {
  activityVariables,
  auditVariables,
  useTenantDetail,
  usersVariables,
} from "./useTenantDetail";

const COMPANY = "comp1";

const tenantMock = (razaoSocial: string, usage = 5) => ({
  request: { query: PLATFORM_TENANT_QUERY, variables: { id: COMPANY } },
  maxUsageCount: usage,
  result: {
    data: {
      platformTenant: {
        __typename: "PlatformTenantResponse",
        status: true,
        code: 200,
        message: "ok",
        data: {
          __typename: "PlatformTenantType",
          id: COMPANY,
          cnpj: "51909936000170",
          razaoSocial,
          nomeFantasia: "Alto",
          segment: "Construção",
          plan: "PRO",
          logoUrl: null,
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
          trialEndsAt: null,
          maxUsers: 10,
          maxSellers: 5,
          createdAt: "2026-01-01",
          usersCount: 4,
          sellersCount: 2,
          clientsCount: 120,
          factoriesCount: 3,
          ordersCount: 300,
          ordersInPeriod: 12,
          gmvInPeriod: "45000.00",
          lastLoginAt: "2026-09-11",
        },
      },
    },
  },
});

const usersMock = (names: string[]) => ({
  request: { query: TENANT_USERS_QUERY, variables: usersVariables(COMPANY) },
  maxUsageCount: 5,
  result: {
    data: {
      tenant_users: {
        __typename: "PlatformUserConnection",
        edges: names.map((name, index) => ({
          __typename: "PlatformUserEdge",
          node: {
            __typename: "PlatformUserType",
            id: `u${index}`,
            name,
            email: `${name}@alto.com`,
            role: "SELLER",
            isActive: true,
            lastLoginAt: null,
            companyId: COMPANY,
            companyName: "Alto",
          },
        })),
        totalCount: names.length,
      },
    },
  },
});

const auditMock = (actions: string[], usage = 5) => ({
  request: { query: TENANT_AUDIT_QUERY, variables: auditVariables(COMPANY) },
  maxUsageCount: usage,
  result: {
    data: {
      tenant_audit: {
        __typename: "PlatformAuditConnection",
        edges: actions.map((action, index) => ({
          __typename: "PlatformAuditEdge",
          node: {
            __typename: "PlatformAuditType",
            id: `au${index}`,
            createdAt: "2026-09-12",
            action,
            actorEmail: "su@girus.app",
            targetLabel: "Alto",
            reason: null,
            payload: null,
          },
        })),
        totalCount: actions.length,
      },
    },
  },
});

const activityMock = (total: number) => ({
  request: {
    query: TENANT_ACTIVITY_QUERY,
    variables: activityVariables(COMPANY),
  },
  maxUsageCount: 5,
  result: {
    data: {
      tenant_activity: {
        __typename: "PlatformActivityConnection",
        edges: Array.from({ length: total }, (_, index) => ({
          __typename: "PlatformActivityEdge",
          node: {
            __typename: "PlatformActivityType",
            id: `a${index}`,
            createdAt: "2026-09-12",
            operation: "createOrder",
            status: "OK",
            errorMessage: null,
            userEmail: "rafael@alto.com",
            userRole: "SELLER",
          },
        })),
        totalCount: total,
      },
    },
  },
});

const summaryMock = {
  request: {
    query: TENANT_ACTIVITY_SUMMARY_QUERY,
    variables: { companyId: COMPANY },
  },
  maxUsageCount: 5,
  result: {
    data: {
      platformActivitySummary: {
        __typename: "PlatformActivitySummaryResponse",
        status: true,
        data: {
          __typename: "PlatformActivitySummaryType",
          totalActions: 120,
          totalErrors: 3,
          byOperation: [
            {
              __typename: "PlatformActivityBucket",
              key: "createOrder",
              total: 40,
              errors: 1,
            },
          ],
          byDay: [
            {
              __typename: "PlatformActivityBucket",
              key: "2026-09-12",
              total: 12,
              errors: 0,
            },
          ],
        },
      },
    },
  },
};

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[]) =>
  renderHook(
    () => useTenantDetail({ id: COMPANY } as TenantDetailContentProps),
    { wrapper: wrapper(mocks) }
  ).result;

const painel = [
  tenantMock("ALTO CONSTRUCAO LTDA"),
  usersMock(["Michael", "Rafael"]),
  auditMock(["update_plan"]),
  activityMock(2),
  summaryMock,
];

describe("useTenantDetail", () => {
  it("junta ficha, pessoas, trilha e uso na mesma tela", async () => {
    const result = run(painel);

    await waitFor(() =>
      expect(result.current.tenant?.razaoSocial).toBe("ALTO CONSTRUCAO LTDA")
    );
    await waitFor(() => expect(result.current.users).toHaveLength(2));
    await waitFor(() => expect(result.current.auditEntries).toHaveLength(1));
    await waitFor(() => expect(result.current.activityTotal).toBe(2));
    await waitFor(() =>
      expect(result.current.activitySummary?.totalActions).toBe(120)
    );
  });

  it("cada lista tem default próprio — nada de undefined na tela", async () => {
    const result = run([tenantMock("ALTO")]);

    await waitFor(() => expect(result.current.tenant).not.toBeNull());
    expect(result.current.users).toEqual([]);
    expect(result.current.auditEntries).toEqual([]);
    expect(result.current.activityEntries).toEqual([]);
    expect(result.current.activityTotal).toBe(0);
    expect(result.current.activitySummary).toBeNull();
  });

  it("depois de suspender ou trocar o plano, refaz as consultas juntas", async () => {
    // Um refetch parcial deixaria a auditoria da própria tela desatualizada
    // logo após a ação que ela deveria registrar.
    // Cada mock serve UMA vez aqui: é o segundo par que o refetch tem de pegar.
    const result = run([
      tenantMock("ALTO CONSTRUCAO LTDA", 1),
      usersMock(["Michael", "Rafael"]),
      auditMock(["update_plan"], 1),
      activityMock(2),
      summaryMock,
      tenantMock("ALTO CONSTRUCAO SA"),
      usersMock(["Michael", "Rafael"]),
      auditMock(["update_plan", "suspend_company"]),
      activityMock(2),
    ]);
    await waitFor(() => expect(result.current.users).toHaveLength(2));

    await act(async () => {
      result.current.refetchAll();
    });

    await waitFor(() =>
      expect(result.current.tenant?.razaoSocial).toBe("ALTO CONSTRUCAO SA")
    );
    await waitFor(() => expect(result.current.auditEntries).toHaveLength(2));
  });

  it("os dois modais de ação começam fechados", () => {
    const result = run(painel);

    expect(result.current.statusModalOpen).toBe(false);
    expect(result.current.planModalOpen).toBe(false);
  });
});
