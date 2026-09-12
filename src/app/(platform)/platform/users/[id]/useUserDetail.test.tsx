import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/** O seed do SSR tem teste próprio (useSeedQuery); aqui o cache começa frio. */
vi.mock("@/hooks/useSeedQuery", () => ({ useSeedQuery: () => {} }));

import { PLATFORM_USER_QUERY, USER_ACTIVITY_QUERY } from "./gql";
import { UserDetailContentProps } from "./interface";
import { useUserDetail } from "./useUserDetail";
import { activityVariables } from "./utils";

const USER = "u1";

const userMock = (found = true) => ({
  request: { query: PLATFORM_USER_QUERY, variables: { id: USER } },
  maxUsageCount: 5,
  result: {
    data: {
      platformUser: {
        __typename: "PlatformUserResponse",
        status: found,
        code: found ? 200 : 404,
        message: found ? "ok" : "Usuário não encontrado",
        data: found
          ? {
              __typename: "PlatformUserType",
              id: USER,
              name: "Michael",
              email: "michael@alto.com",
              role: "OWNER",
              isActive: true,
              lastLoginAt: "2026-09-10",
              createdAt: "2026-01-01",
              companyId: "comp1",
              companyName: "Alto",
            }
          : null,
      },
    },
  },
});

const activityMock = (operations: string[]) => ({
  request: {
    query: USER_ACTIVITY_QUERY,
    variables: activityVariables(USER),
  },
  maxUsageCount: 5,
  result: {
    data: {
      user_activity: {
        __typename: "PlatformActivityConnection",
        edges: operations.map((operation, index) => ({
          __typename: "PlatformActivityEdge",
          node: {
            __typename: "PlatformActivityType",
            id: `a${index}`,
            createdAt: "2026-09-12",
            operation,
            status: "OK",
            errorMessage: null,
            durationMs: 120,
          },
        })),
        totalCount: operations.length,
      },
    },
  },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */
    <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[]) =>
  renderHook(() => useUserDetail({ id: USER } as UserDetailContentProps), {
    wrapper: wrapper(mocks),
  }).result;

describe("useUserDetail", () => {
  it("traz a pessoa e o que ela fez, recortado por ela", async () => {
    const result = run([userMock(), activityMock(["createOrder", "login"])]);

    await waitFor(() => expect(result.current.user?.name).toBe("Michael"));
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(result.current.total).toBe(2);
  });

  it("pessoa sem atividade não é pessoa sem registro", async () => {
    const result = run([userMock(), activityMock([])]);

    await waitFor(() => expect(result.current.user).not.toBeNull());
    expect(result.current.entries).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("usuário não encontrado não vira tela com campos vazios", async () => {
    const result = run([userMock(false), activityMock([])]);

    await waitFor(() => expect(result.current.userLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });
});
