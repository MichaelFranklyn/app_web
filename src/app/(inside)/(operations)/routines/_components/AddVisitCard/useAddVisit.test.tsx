import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { RoutineCapacity, VisitScheduleDay } from "../../interface";
import {
  CREATE_VISIT_DAY_MUTATION,
  CREATE_VISIT_ITEM_MUTATION,
  SELLER_CLIENT_LINKS_QUERY,
} from "./gql";
import { useAddVisit } from "./useAddVisit";

const SELLER = "s1";
const DATE = "2026-09-15";
const SCHEDULE = "sch-1";

const CAPACITY: RoutineCapacity = {
  maxVisitsPerDay: 2,
  maxRemoteContactsPerDay: 1,
  isRemoteContactEnabled: true,
};

const linksMock = (links: [string, string][]) => ({
  request: {
    query: SELLER_CLIENT_LINKS_QUERY,
    variables: {
      input: {
        filters: [{ field: "seller_id", operator: "eq", value: SELLER }],
        first: 200,
      },
    },
  },
  maxUsageCount: 10,
  result: {
    data: {
      seller_client_links: {
        __typename: "SellerClientFactoryConnection",
        edges: links.map(([id, name]) => ({
          __typename: "SellerClientFactoryEdge",
          node: {
            __typename: "SellerClientFactoryType",
            id,
            client: {
              __typename: "ClientType",
              id: `c-${id}`,
              razaoSocial: name,
              nomeFantasia: null,
            },
            factory: {
              __typename: "FactoryType",
              id: "f1",
              razaoSocial: "HERC SA",
              nomeFantasia: "HERC",
              nickname: null,
            },
          },
        })),
        totalCount: links.length,
      },
    },
  },
});

const item = (id: string, contactType: string, linkId?: string) => ({
  id,
  contactType,
  clientFactoryLink: linkId ? { id: linkId } : null,
});

const day = (
  id: string,
  items: ReturnType<typeof item>[] = []
): VisitScheduleDay => ({ id, date: DATE, items }) as VisitScheduleDay;

const createItemMock = (input: Record<string, unknown>, ok = true) => ({
  request: { query: CREATE_VISIT_ITEM_MUTATION, variables: { input } },
  result: {
    data: {
      createVisitScheduleItem: {
        __typename: "VisitItemResponse",
        status: ok,
        message: ok ? "Agendada" : "Cliente já visitado hoje",
        data: ok ? { __typename: "VisitScheduleItemType", id: "novo" } : null,
      },
    },
  },
});

const createDayMock = (ok = true) => ({
  request: {
    query: CREATE_VISIT_DAY_MUTATION,
    variables: {
      input: { scheduleId: SCHEDULE, date: DATE, departureType: "HOME" },
    },
  },
  result: {
    data: {
      createVisitScheduleDay: {
        __typename: "VisitDayResponse",
        status: ok,
        message: ok ? "Dia criado" : "Semana fechada",
        data: ok
          ? { __typename: "VisitScheduleDayType", id: "dia-novo" }
          : null,
      },
    },
  },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (
  mocks: unknown[],
  params: {
    day?: VisitScheduleDay | null;
    capacity?: RoutineCapacity;
  } = {}
) => {
  const onOpenChange = vi.fn();
  const onDone = vi.fn();
  const { result } = renderHook(
    () =>
      useAddVisit({
        open: true,
        onOpenChange,
        day: params.day ?? null,
        date: DATE,
        scheduleId: SCHEDULE,
        sellerId: SELLER,
        capacity: params.capacity ?? CAPACITY,
        onDone,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onOpenChange, onDone };
};

describe("useAddVisit — a carteira oferecida", () => {
  it("não oferece de novo quem já está no dia", async () => {
    const { result } = run(
      [
        linksMock([
          ["l1", "Alto"],
          ["l2", "Zeta"],
        ]),
      ],
      { day: day("d1", [item("i1", "IN_PERSON", "l1")]) }
    );

    await waitFor(() =>
      expect(result.current.options.map((o) => o.value)).toEqual(["l2"])
    );
  });

  it("dia que nunca teve rota é sinalizado", async () => {
    const { result } = run([linksMock([["l1", "Alto"]])]);

    expect(result.current.isDayWithoutRoute).toBe(true);
  });
});

describe("useAddVisit — agendar", () => {
  it("entra no fim da fila do dia", async () => {
    const { result, onDone, onOpenChange } = run(
      [
        linksMock([["l2", "Zeta"]]),
        createItemMock({
          scheduleDayId: "d1",
          sellerClientFactoryId: "l2",
          plannedOrder: 2,
          contactType: "IN_PERSON",
        }),
      ],
      { day: day("d1", [item("i1", "IN_PERSON", "l1")]) }
    );
    await waitFor(() => expect(result.current.options).toHaveLength(1));

    act(() => result.current.setSelectedLinkId("l2"));
    await act(async () => {
      result.current.handlePrimary();
    });

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("dia sem rota nasce partindo da casa do vendedor", async () => {
    // Mesma origem da geração automática — a rota não pode começar do nada.
    const { result, onDone } = run([
      linksMock([["l1", "Alto"]]),
      createDayMock(),
      createItemMock({
        scheduleDayId: "dia-novo",
        sellerClientFactoryId: "l1",
        plannedOrder: 1,
        contactType: "IN_PERSON",
      }),
    ]);
    await waitFor(() => expect(result.current.options).toHaveLength(1));

    act(() => result.current.setSelectedLinkId("l1"));
    await act(async () => {
      result.current.handlePrimary();
    });

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
  });

  it("não há teto: o dia com muitas visitas agenda direto, sem confirmação", async () => {
    // Decisão de 18/10/2026: a quantidade de visitas é do vendedor.
    const cheio = day("d1", [
      item("i1", "IN_PERSON", "l1"),
      item("i2", "IN_PERSON", "l2"),
    ]);
    const { result, onDone } = run(
      [
        linksMock([["l3", "Novo"]]),
        createItemMock({
          scheduleDayId: "d1",
          sellerClientFactoryId: "l3",
          plannedOrder: 3,
          contactType: "IN_PERSON",
        }),
      ],
      { day: cheio }
    );
    await waitFor(() => expect(result.current.options).toHaveLength(1));

    act(() => result.current.setSelectedLinkId("l3"));
    await act(async () => {
      result.current.handlePrimary();
    });
    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
  });

  it("sem cliente escolhido, o botão não faz nada", async () => {
    const { result, onDone } = run([linksMock([["l1", "Alto"]])]);

    act(() => result.current.handlePrimary());

    expect(onDone).not.toHaveBeenCalled();
  });

  it("dia que não pôde ser criado não agenda visita nenhuma", async () => {
    const { result, onDone } = run([
      linksMock([["l1", "Alto"]]),
      createDayMock(false),
    ]);
    await waitFor(() => expect(result.current.options).toHaveLength(1));

    act(() => result.current.setSelectedLinkId("l1"));
    await act(async () => {
      result.current.handlePrimary();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onDone).not.toHaveBeenCalled();
  });
});
