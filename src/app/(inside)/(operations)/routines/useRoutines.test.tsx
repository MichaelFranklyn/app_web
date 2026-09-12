import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, replace, getCookie } = vi.hoisted(() => ({
  state: { sp: new URLSearchParams() },
  replace: vi.fn(),
  getCookie: vi.fn(() => ({ role: "SELLER" }) as { role?: string } | null),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/routines",
  useRouter: () => ({ replace }),
}));
vi.mock("@/utils/cookies/clientCookie", () => ({ getCookie }));

import { getCurrentWeekMondayIso } from "@/utils/format/date";
import {
  ROUTINE_SELLERS_QUERY,
  VISIT_SCHEDULE_CONFIG_QUERY,
  VISIT_SCHEDULES_QUERY,
} from "./gql";
import { useRoutines } from "./useRoutines";

const WEEK = getCurrentWeekMondayIso();

const sellersMock = (sellers: { id: string; name: string }[]) => ({
  request: {
    query: ROUTINE_SELLERS_QUERY,
    variables: { input: { first: 200 } },
  },
  maxUsageCount: 10,
  result: {
    data: {
      routine_sellers: {
        __typename: "UserTypeConnection",
        edges: sellers.map((seller) => ({
          __typename: "UserTypeEdge",
          node: { __typename: "UserType", ...seller },
        })),
      },
    },
  },
});

const scheduleMock = (sellerId: string | null, weekStart = WEEK) => ({
  request: {
    query: VISIT_SCHEDULES_QUERY,
    variables: {
      input: {
        first: 1,
        filters: [
          { field: "week_start", operator: "eq", value: weekStart },
          ...(sellerId
            ? [{ field: "seller_id", operator: "eq", value: sellerId }]
            : []),
        ],
      },
    },
  },
  maxUsageCount: 10,
  result: {
    data: {
      visit_schedules: {
        __typename: "VisitScheduleConnection",
        edges: [],
      },
    },
  },
});

const configMock = (
  sellerId: string,
  node: Record<string, unknown> | null = null
) => ({
  request: {
    query: VISIT_SCHEDULE_CONFIG_QUERY,
    variables: {
      input: {
        first: 1,
        filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
      },
    },
  },
  maxUsageCount: 10,
  result: {
    data: {
      visit_schedule_configs: {
        __typename: "VisitScheduleConfigConnection",
        edges: node
          ? [
              {
                __typename: "VisitScheduleConfigEdge",
                node: {
                  __typename: "VisitScheduleConfigType",
                  id: "cfg-1",
                  sellerId,
                  ...node,
                },
              },
            ]
          : [],
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
  renderHook(() => useRoutines(), { wrapper: wrapper(mocks) }).result;

/** O último endereço escrito na barra, já em parâmetros. */
const lastParams = () =>
  new URLSearchParams(String(replace.mock.calls.at(-1)?.[0]).split("?")[1]);

beforeEach(() => {
  state.sp = new URLSearchParams();
  replace.mockClear();
  getCookie.mockReturnValue({ role: "SELLER" });
});

describe("useRoutines — de quem é a rotina", () => {
  it("vendedor vê a própria rotina, sem seletor", async () => {
    const result = run([scheduleMock(null)]);

    await waitFor(() => expect(result.current.showSkeleton).toBe(false));
    expect(result.current.canSelectSeller).toBe(false);
    expect(result.current.sellers).toEqual([]);
  });

  it("gestor escolhe, e o primeiro da lista abre por padrão", async () => {
    getCookie.mockReturnValue({ role: "OWNER" });
    const result = run([
      sellersMock([
        { id: "s1", name: "Rafael" },
        { id: "s2", name: "Bruna" },
      ]),
      scheduleMock("s1"),
      configMock("s1"),
    ]);

    await waitFor(() => expect(result.current.canSelectSeller).toBe(true));
    await waitFor(() => expect(lastParams().get("sellerId")).toBe("s1"));
  });

  it("o vendedor escolhido mora na URL — voltar à rotina reencontra a dele", async () => {
    // Sem isso, sair para abrir um cliente e voltar cairia no primeiro da lista.
    getCookie.mockReturnValue({ role: "ADMIN" });
    state.sp = new URLSearchParams("sellerId=s2");
    const result = run([
      sellersMock([
        { id: "s1", name: "Rafael" },
        { id: "s2", name: "Bruna" },
      ]),
      scheduleMock("s2"),
      configMock("s2"),
    ]);

    await waitFor(() =>
      expect(result.current.selectedSellerName).toBe("Bruna")
    );
    expect(result.current.effectiveSellerId).toBe("s2");
  });

  it("enquanto o gestor não tem vendedor, a tela espera — e não trava em carregando", async () => {
    // A query da agenda fica pulada; considerar o `loading` dela deixaria o
    // skeleton para sempre.
    getCookie.mockReturnValue({ role: "OWNER" });
    const result = run([sellersMock([])]);

    await waitFor(() => expect(result.current.hasNoSellers).toBe(true));
    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("troca de vendedor escreve na URL, sem rolar a página", async () => {
    getCookie.mockReturnValue({ role: "OWNER" });
    const result = run([
      sellersMock([{ id: "s1", name: "Rafael" }]),
      scheduleMock("s1"),
      configMock("s1"),
    ]);

    await waitFor(() => expect(result.current.canSelectSeller).toBe(true));
    act(() => result.current.setSelectedSellerId("s9"));

    expect(lastParams().get("sellerId")).toBe("s9");
    expect(replace.mock.calls.at(-1)?.[1]).toEqual({ scroll: false });
  });
});

describe("useRoutines — o que a tela lembra", () => {
  it("a visualização também mora na URL, e o kanban é o padrão", async () => {
    const result = run([scheduleMock(null)]);

    expect(result.current.viewMode).toBe("kanban");
    act(() => result.current.setViewMode("radar"));
    expect(lastParams().get("view")).toBe("radar");
  });

  it("visualização desconhecida na URL não quebra a tela", async () => {
    state.sp = new URLSearchParams("view=galaxia");
    const result = run([scheduleMock(null)]);

    expect(result.current.viewMode).toBe("kanban");
  });

  it("a semana anda para trás e para a frente, e volta para a atual", async () => {
    const result = run([scheduleMock(null)]);

    expect(result.current.isCurrentWeek).toBe(true);
    act(() => result.current.handlePrevWeek());
    expect(result.current.isCurrentWeek).toBe(false);
    act(() => result.current.handleNextWeek());
    expect(result.current.weekStart).toBe(WEEK);

    act(() => result.current.handlePrevWeek());
    act(() => result.current.handleCurrentWeek());
    expect(result.current.isCurrentWeek).toBe(true);
  });
});

describe("useRoutines — os tetos do dia", () => {
  it("vendedor sem configuração herda os mesmos limites do backend", async () => {
    // A rotina não pode ficar sem limite: o legado sem config usa o padrão.
    state.sp = new URLSearchParams("sellerId=s1");
    getCookie.mockReturnValue({ role: "OWNER" });
    const result = run([
      sellersMock([{ id: "s1", name: "Rafael" }]),
      scheduleMock("s1"),
      configMock("s1"),
    ]);

    await waitFor(() =>
      expect(result.current.capacity).toEqual({
        maxVisitsPerDay: 10,
        maxRemoteContactsPerDay: 5,
        isRemoteContactEnabled: true,
      })
    );
  });

  it("com configuração, valem os tetos do vendedor", async () => {
    state.sp = new URLSearchParams("sellerId=s1");
    getCookie.mockReturnValue({ role: "OWNER" });
    const result = run([
      sellersMock([{ id: "s1", name: "Rafael" }]),
      scheduleMock("s1"),
      configMock("s1", {
        maxVisitsPerDay: 6,
        maxRemoteContactsPerDay: 2,
        isRemoteContactEnabled: false,
      }),
    ]);

    await waitFor(() =>
      expect(result.current.capacity).toEqual({
        maxVisitsPerDay: 6,
        maxRemoteContactsPerDay: 2,
        isRemoteContactEnabled: false,
      })
    );
  });
});
