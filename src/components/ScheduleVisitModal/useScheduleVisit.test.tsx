import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import {
  CLIENT_LINKS_FOR_VISIT_QUERY,
  COMPANY_CLIENTS_FOR_VISIT_QUERY,
  SCHEDULE_MANUAL_VISIT_MUTATION,
  SCHEDULE_PEOPLE_QUERY,
  WALLET_CLIENTS_FOR_VISIT_QUERY,
} from "./gql";
import { ScheduleVisitModalProps } from "./interface";
import { AUTO_FACTORY, useScheduleVisit } from "./useScheduleVisit";

const user = vi.hoisted(() => ({
  current: null as null | {
    userId: string;
    userName: string;
    role: string;
    sellerId: string | null;
  },
}));
vi.mock("@/hooks/useUserData", () => ({
  useUserData: () => ({ userData: user.current }),
}));

const DATE = "2026-09-15";

const connection = (key: string, nodes: unknown[]) => ({
  [key]: {
    __typename: "Connection",
    edges: nodes.map((node) => ({ __typename: "Edge", node })),
    totalCount: nodes.length,
  },
});

const link = (sellerId: string, factoryId: string, sellerName: string) => ({
  __typename: "SellerClientFactoryType",
  id: `${sellerId}-${factoryId}`,
  sellerId,
  factoryId,
  seller: { __typename: "UserType", id: sellerId, name: sellerName },
  factory: {
    __typename: "FactoryType",
    id: factoryId,
    razaoSocial: "HERC SA",
    nomeFantasia: factoryId === "f1" ? "HERC" : "Silvana",
  },
});

const clientNode = (id: string, name: string) => ({
  __typename: "SellerClientFactoryType",
  id: `scf-${id}`,
  client: {
    __typename: "ClientType",
    id,
    razaoSocial: name,
    nomeFantasia: null,
  },
});

const listMock = (
  query: unknown,
  field: string,
  value: string,
  key: string,
  nodes: unknown[]
) => ({
  request: {
    query,
    variables: {
      input: { filters: [{ field, operator: "eq", value }], first: 200 },
    },
  },
  maxUsageCount: 10,
  result: { data: connection(key, nodes) },
});

const linksMock = (clientId: string, nodes: unknown[]) =>
  listMock(
    CLIENT_LINKS_FOR_VISIT_QUERY,
    "client_id",
    clientId,
    "sellerClientFactoryList",
    nodes
  );

const walletMock = (sellerId: string, clients: [string, string][]) =>
  listMock(
    WALLET_CLIENTS_FOR_VISIT_QUERY,
    "seller_id",
    sellerId,
    "sellerClientFactoryList",
    clients.map(([id, name]) => clientNode(id, name))
  );

const companyClientsMock = (clients: [string, string][]) => ({
  request: {
    query: COMPANY_CLIENTS_FOR_VISIT_QUERY,
    variables: { input: { first: 20 } },
  },
  maxUsageCount: 10,
  result: {
    data: connection(
      "schedule_clients",
      clients.map(([id, name]) => ({
        ...clientNode(id, name),
        __typename: "CompanyClientType",
      }))
    ),
  },
});

const peopleMock = (people: [string, string, string | null][]) => ({
  request: {
    query: SCHEDULE_PEOPLE_QUERY,
    variables: { input: { first: 200, order: { by: "name", dir: "asc" } } },
  },
  maxUsageCount: 10,
  result: {
    data: {
      schedule_people: {
        __typename: "UserConnection",
        edges: people.map(([id, name, sellerId]) => ({
          __typename: "UserEdge",
          node: {
            __typename: "UserType",
            id,
            name,
            isActive: true,
            seller: sellerId
              ? { __typename: "SellerType", id: sellerId }
              : null,
          },
        })),
      },
    },
  },
});

const scheduleMock = (
  input: Record<string, unknown>,
  outcome: "ok" | "refused" = "ok"
) => ({
  request: { query: SCHEDULE_MANUAL_VISIT_MUTATION, variables: { input } },
  result: {
    data: {
      scheduleManualVisit: {
        __typename: "VisitResponse",
        status: outcome === "ok",
        message: outcome === "ok" ? "Marcada" : "Cliente inativo",
        data:
          outcome === "ok"
            ? {
                __typename: "VisitScheduleItemType",
                id: "v1",
                scheduleDayId: "d1",
                plannedOrder: 3,
                contactType: input.contactType,
              }
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
  params: Partial<ScheduleVisitModalProps> = {}
) => {
  const onOpenChange = vi.fn();
  const onScheduled = vi.fn();
  const { result } = renderHook(
    () =>
      useScheduleVisit({
        open: true,
        onOpenChange,
        defaultDate: DATE,
        onScheduled,
        ...params,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onOpenChange, onScheduled };
};

const baseInput = {
  clientId: "c1",
  date: DATE,
  contactType: "IN_PERSON",
  sellerId: "s1",
  ownerUserId: null,
  factoryId: null,
  reason: null,
  orderId: null,
  returnItemId: null,
  notes: null,
};

beforeEach(() => {
  user.current = {
    userId: "u-seller",
    userName: "Rafael",
    role: "SELLER",
    sellerId: "s1",
  };
});

describe("useScheduleVisit — a rota de quem vende", () => {
  it("abre no dia pedido, como visita, com a fábrica pelo sistema", () => {
    const { result } = run([linksMock("c1", [link("s1", "f1", "Rafael")])], {
      clientId: "c1",
    });

    expect(result.current.contactType).toBe("IN_PERSON");
    expect(result.current.factoryId).toBe(AUTO_FACTORY);
    expect(result.current.isValid).toBe(true);
  });

  it("sem cliente definido, oferece a carteira do vendedor em ordem", async () => {
    const { result } = run(
      [
        walletMock("s1", [
          ["c2", "ZETA COMERCIO"],
          ["c1", "ALTO CONSTRUCAO"],
        ]),
      ],
      { sellerId: "s1" }
    );

    await waitFor(() =>
      expect(result.current.clientOptions.map((o) => o.label)).toEqual([
        "ALTO CONSTRUCAO",
        "ZETA COMERCIO",
      ])
    );
    expect(result.current.isClientFixed).toBe(false);
  });

  it("as fábricas oferecidas são as que o dono da agenda atende", async () => {
    const { result } = run(
      [
        linksMock("c1", [
          link("s1", "f1", "Rafael"),
          link("s2", "f2", "Bruna"),
        ]),
      ],
      { clientId: "c1", sellerId: "s1" }
    );

    await waitFor(() =>
      expect(result.current.factoryOptions.map((o) => o.value)).toEqual([
        AUTO_FACTORY,
        "f1",
      ])
    );
  });

  it("sem cliente ou sem data, não dá para marcar", () => {
    const { result } = run([walletMock("s1", [])], { sellerId: "s1" });

    expect(result.current.isValid).toBe(false);
    act(() => result.current.setSelectedClientId("c1"));
    expect(result.current.isValid).toBe(true);
    act(() => result.current.setDate(null));
    expect(result.current.isValid).toBe(false);
  });
});

describe("useScheduleVisit — o combinado", () => {
  it("ligação leva motivo, pedido e retorno, com o texto limpo", async () => {
    const { result, onScheduled, onOpenChange } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock({
          ...baseInput,
          contactType: "REMOTE",
          reason: "Retornar sobre o orçamento",
          orderId: "o1",
          returnItemId: "ret-1",
          notes: "ligar de manhã",
        }),
      ],
      {
        clientId: "c1",
        sellerId: "s1",
        orderId: "o1",
        returnItemId: "ret-1",
        contactType: "REMOTE",
      }
    );

    act(() => {
      result.current.setReason(" Retornar sobre o orçamento ");
      result.current.setNotes("  ligar de manhã  ");
    });
    await act(() => result.current.submit());

    await waitFor(() => expect(onScheduled).toHaveBeenCalledOnce());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("recusa do backend não fecha o modal nem avisa que marcou", async () => {
    const { result, onScheduled } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock(baseInput, "refused"),
      ],
      { clientId: "c1", sellerId: "s1" }
    );

    await act(() => result.current.submit());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onScheduled).not.toHaveBeenCalled();
  });
});

describe("useScheduleVisit — a agenda de quem não vende", () => {
  const office = { id: "u-office", name: "Bia", sellerId: null };

  it("só recebe ligação, e os clientes são os da empresa", async () => {
    const { result } = run([companyClientsMock([["c9", "LOJA DO BAIRRO"]])], {
      owner: office,
    });

    expect(result.current.agenda.callsOnly).toBe(true);
    expect(result.current.contactType).toBe("REMOTE");
    await waitFor(() =>
      expect(result.current.clientOptions.map((o) => o.label)).toEqual([
        "LOJA DO BAIRRO",
      ])
    );
  });

  it("marca na agenda dela, sem vendedor", async () => {
    const { result, onScheduled } = run(
      [
        linksMock("c1", []),
        scheduleMock({
          ...baseInput,
          contactType: "REMOTE",
          sellerId: null,
          ownerUserId: "u-office",
        }),
      ],
      { clientId: "c1", owner: office }
    );

    await act(() => result.current.submit());

    await waitFor(() => expect(onScheduled).toHaveBeenCalledOnce());
  });
});

describe("useScheduleVisit — o gestor escolhe a agenda", () => {
  beforeEach(() => {
    user.current = {
      userId: "u-boss",
      userName: "Dono",
      role: "OWNER",
      sellerId: null,
    };
  });

  const people = peopleMock([
    ["u-bia", "Bia", null],
    ["u-rafa", "Rafael", "s1"],
  ]);

  it("quem vende vem antes, e quem não vende é marcado como escritório", async () => {
    const { result } = run([people]);

    await waitFor(() =>
      expect(result.current.agenda.options.map((o) => o.label)).toEqual([
        "Rafael",
        "Bia (escritório)",
      ])
    );
    expect(result.current.agenda.canChoose).toBe(true);
  });

  it("escolher a pessoa troca a carteira e limpa o cliente escolhido", async () => {
    const { result } = run([
      people,
      walletMock("s1", [["c1", "ALTO CONSTRUCAO"]]),
    ]);
    await waitFor(() => expect(result.current.agenda.options).toHaveLength(2));

    act(() => result.current.pickOwner("u-rafa"));
    await waitFor(() => expect(result.current.clientOptions).toHaveLength(1));
    act(() => result.current.setSelectedClientId("c1"));
    act(() => result.current.pickOwner("u-bia"));

    expect(result.current.selectedClientId).toBeNull();
    expect(result.current.agenda.callsOnly).toBe(true);
  });

  it("com o cliente fixado, sugere quem o atende e esconde quem não atende", async () => {
    const { result } = run(
      [
        peopleMock([
          ["u-bia", "Bia", null],
          ["u-rafa", "Rafael", "s1"],
          ["u-bruna", "Bruna", "s2"],
        ]),
        linksMock("c1", [link("s1", "f1", "Rafael")]),
      ],
      { clientId: "c1" }
    );

    await waitFor(() => expect(result.current.agenda.owner?.id).toBe("u-rafa"));
    expect(result.current.agenda.options.map((o) => o.value)).toEqual([
      "u-rafa",
      "u-bia",
    ]);
  });
});
