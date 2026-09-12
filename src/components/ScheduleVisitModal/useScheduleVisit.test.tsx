import { CombinedGraphQLErrors } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import {
  CLIENT_LINKS_FOR_VISIT_QUERY,
  SCHEDULE_MANUAL_VISIT_MUTATION,
  WALLET_CLIENTS_FOR_VISIT_QUERY,
} from "./gql";
import { AUTO_FACTORY, useScheduleVisit } from "./useScheduleVisit";

const DATE = "2026-09-15";

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

const linksMock = (clientId: string, nodes: unknown[]) => ({
  request: {
    query: CLIENT_LINKS_FOR_VISIT_QUERY,
    variables: {
      input: {
        filters: [{ field: "client_id", operator: "eq", value: clientId }],
        first: 200,
      },
    },
  },
  maxUsageCount: 10,
  result: {
    data: {
      sellerClientFactoryList: {
        __typename: "SellerClientFactoryConnection",
        edges: nodes.map((node) => ({
          __typename: "SellerClientFactoryEdge",
          node,
        })),
        totalCount: nodes.length,
      },
    },
  },
});

const walletMock = (sellerId: string, clients: [string, string][]) => ({
  request: {
    query: WALLET_CLIENTS_FOR_VISIT_QUERY,
    variables: {
      input: {
        filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
        first: 200,
      },
    },
  },
  maxUsageCount: 10,
  result: {
    data: {
      sellerClientFactoryList: {
        __typename: "SellerClientFactoryConnection",
        edges: clients.map(([id, name]) => ({
          __typename: "SellerClientFactoryEdge",
          node: {
            __typename: "SellerClientFactoryType",
            id: `scf-${id}`,
            client: {
              __typename: "ClientType",
              id,
              razaoSocial: name,
              nomeFantasia: null,
            },
          },
        })),
        totalCount: clients.length,
      },
    },
  },
});

const scheduleMock = (
  input: Record<string, unknown>,
  outcome: "ok" | "dayFull" | "refused" = "ok"
) => ({
  request: { query: SCHEDULE_MANUAL_VISIT_MUTATION, variables: { input } },
  ...(outcome === "dayFull"
    ? {
        error: new CombinedGraphQLErrors({
          errors: [
            {
              message: "O dia 15/09 já tem 10 visitas (o teto do vendedor).",
              extensions: { error_type: "DAY_FULL" },
            },
          ],
        }),
      }
    : {
        result: {
          data: {
            scheduleManualVisit: {
              __typename: "VisitResponse",
              status: outcome === "ok",
              message: outcome === "ok" ? "Visita marcada" : "Cliente inativo",
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
      }),
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
    clientId?: string;
    sellerId?: string;
    defaultDate?: string;
  } = {}
) => {
  const onOpenChange = vi.fn();
  const onScheduled = vi.fn();
  const { result } = renderHook(
    () =>
      useScheduleVisit({
        open: true,
        onOpenChange,
        clientId: params.clientId,
        sellerId: params.sellerId,
        defaultDate: params.defaultDate ?? DATE,
        onScheduled,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onOpenChange, onScheduled };
};

const baseInput = {
  clientId: "c1",
  date: DATE,
  sellerId: "s1",
  factoryId: null,
  contactType: "IN_PERSON",
  notes: null,
  allowOverCapacity: false,
};

describe("useScheduleVisit — quem e onde", () => {
  it("abre no dia que a tela pediu, presencial e com a fábrica pelo sistema", async () => {
    // Quem manda na fábrica é o score, no backend.
    const { result } = run([linksMock("c1", [link("s1", "f1", "Rafael")])], {
      clientId: "c1",
    });

    expect(result.current.contactType).toBe("IN_PERSON");
    expect(result.current.factoryId).toBe(AUTO_FACTORY);
    expect(result.current.isValid).toBe(true);
  });

  it("um vendedor só no cliente não vira pergunta", async () => {
    // Um select de resposta obrigatória e única é só um passo a mais.
    const { result } = run([linksMock("c1", [link("s1", "f1", "Rafael")])], {
      clientId: "c1",
    });

    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));
    expect(result.current.needsSellerChoice).toBe(false);
  });

  it("com dois vendedores no cliente, a tela pergunta de quem é a visita", async () => {
    const { result } = run(
      [
        linksMock("c1", [
          link("s1", "f1", "Rafael"),
          link("s2", "f2", "Bruna"),
        ]),
      ],
      { clientId: "c1" }
    );

    await waitFor(() => expect(result.current.needsSellerChoice).toBe(true));
    expect(result.current.sellerOptions).toHaveLength(2);
  });

  it("as fábricas oferecidas são as que o vendedor escolhido atende", async () => {
    const { result } = run(
      [
        linksMock("c1", [
          link("s1", "f1", "Rafael"),
          link("s2", "f2", "Bruna"),
        ]),
      ],
      { clientId: "c1" }
    );

    await waitFor(() => expect(result.current.factoryOptions).toHaveLength(3));
    act(() => result.current.setSelectedSellerId("s1"));

    await waitFor(() =>
      expect(result.current.factoryOptions.map((o) => o.value)).toEqual([
        AUTO_FACTORY,
        "f1",
      ])
    );
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

  it("sem cliente ou sem data, não dá para marcar", async () => {
    const { result } = run([walletMock("s1", [])], { sellerId: "s1" });

    expect(result.current.isValid).toBe(false);
    act(() => result.current.setSelectedClientId("c1"));
    expect(result.current.isValid).toBe(true);
    act(() => result.current.setDate(null));
    expect(result.current.isValid).toBe(false);
  });
});

describe("useScheduleVisit — marcar", () => {
  it("marca a visita com a fábrica decidida pelo sistema", async () => {
    const { result, onOpenChange, onScheduled } = run(
      [linksMock("c1", [link("s1", "f1", "Rafael")]), scheduleMock(baseInput)],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));

    await act(() => result.current.submit(false));

    await waitFor(() => expect(onScheduled).toHaveBeenCalledOnce());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("fábrica escolhida à mão viaja no lugar do automático", async () => {
    const { result, onScheduled } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock({ ...baseInput, factoryId: "f1" }),
      ],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));

    act(() => result.current.setFactoryId("f1"));
    await act(() => result.current.submit(false));

    await waitFor(() => expect(onScheduled).toHaveBeenCalledOnce());
  });

  it("contato remoto é marcado como remoto, com a observação escrita", async () => {
    const { result, onScheduled } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock({
          ...baseInput,
          contactType: "REMOTE",
          notes: "ligar de manhã",
        }),
      ],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));

    act(() => {
      result.current.setContactType("REMOTE");
      result.current.setNotes("  ligar de manhã  ");
    });
    await act(() => result.current.submit(false));

    await waitFor(() => expect(onScheduled).toHaveBeenCalledOnce());
  });

  it("dia cheio não é beco: a recusa vira o aviso de confirmar mesmo assim", async () => {
    // Quem está com o cliente no telefone é quem decide furar o teto.
    const { result, onScheduled } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock(baseInput, "dayFull"),
      ],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));

    await act(() => result.current.submit(false));

    await waitFor(() =>
      expect(result.current.dayFullMessage).toContain("já tem 10 visitas")
    );
    expect(onScheduled).not.toHaveBeenCalled();
  });

  it("trocar o dia apaga o aviso — ele falava do teto do outro", async () => {
    const { result } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock(baseInput, "dayFull"),
      ],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));
    await act(() => result.current.submit(false));
    await waitFor(() => expect(result.current.dayFullMessage).not.toBeNull());

    act(() => result.current.setDate(new Date("2026-09-16T12:00:00")));

    await waitFor(() => expect(result.current.dayFullMessage).toBeNull());
  });

  it("confirmando, a visita entra acima do teto", async () => {
    const { result, onScheduled } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock({ ...baseInput, allowOverCapacity: true }),
      ],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));

    await act(() => result.current.submit(true));

    await waitFor(() => expect(onScheduled).toHaveBeenCalledOnce());
  });

  it("recusa que não é de lotação não vira aviso de dia cheio", async () => {
    const { result, onScheduled } = run(
      [
        linksMock("c1", [link("s1", "f1", "Rafael")]),
        scheduleMock(baseInput, "refused"),
      ],
      { clientId: "c1" }
    );
    await waitFor(() => expect(result.current.selectedSellerId).toBe("s1"));

    await act(() => result.current.submit(false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.dayFullMessage).toBeNull();
    expect(onScheduled).not.toHaveBeenCalled();
  });
});
