import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A carteira do vendedor vem por `useCompleteList`, que tem teste próprio. */
const { wallet } = vi.hoisted(() => ({ wallet: { nodes: [] as unknown[] } }));

vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: () => ({
    data: {
      sellerClientFactoryList: {
        edges: wallet.nodes.map((node) => ({ node })),
      },
    },
    error: undefined,
  }),
}));

import { Toast } from "@/components/Toast";
import {
  CREATE_FIXED_SCHEDULE_MUTATION,
  UPDATE_FIXED_SCHEDULE_MUTATION,
} from "../gql";
import { FixedScheduleNode } from "../interface";
import { useFixedScheduleForm } from "./useFixedScheduleForm";

const SELLER = "s1";

const walletNode = (clientId: string, name: string) => ({
  clientId,
  client: { id: clientId, razaoSocial: name, nomeFantasia: null },
});

const schedule = (
  overrides: Partial<FixedScheduleNode> = {}
): FixedScheduleNode =>
  ({
    id: "fs1",
    clientId: "c1",
    weekday: 2,
    intervalWeeks: 2,
    startsOn: "2026-09-01",
    endsOn: null,
    isActive: true,
    notes: "Sempre de manhã",
    nextOccurrences: ["2026-09-15", "2026-09-29"],
    client: { id: "c1", razaoSocial: "ALTO", nomeFantasia: null },
    ...overrides,
  }) as FixedScheduleNode;

const node = () => ({
  __typename: "FixedScheduleType",
  id: "fs1",
  clientId: "c1",
  weekday: 3,
  intervalWeeks: 2,
  startsOn: "2026-09-01",
  endsOn: null,
  isActive: true,
  notes: null,
  nextOccurrences: [],
  client: {
    __typename: "ClientType",
    id: "c1",
    razaoSocial: "ALTO",
    nomeFantasia: null,
  },
});

const createMock = (
  input: Record<string, unknown>,
  ok = true,
  message = "Dia fixo marcado"
) => ({
  request: { query: CREATE_FIXED_SCHEDULE_MUTATION, variables: { input } },
  result: {
    data: {
      createFixedSchedule: {
        __typename: "FixedScheduleResponse",
        status: ok,
        message,
        data: ok ? node() : null,
      },
    },
  },
});

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_FIXED_SCHEDULE_MUTATION,
    variables: { id: "fs1", input },
  },
  result: {
    data: {
      updateFixedSchedule: {
        __typename: "FixedScheduleResponse",
        status: ok,
        message: ok ? "Dia fixo atualizado" : "Não cabe nesse dia",
        data: ok ? node() : null,
      },
    },
  },
});

const form = (extra: Record<string, unknown> = {}) => ({
  clientId: { value: "c1" },
  weekday: { value: "3" },
  intervalWeeks: { value: "2" },
  startsOn: "2026-09-01",
  endsOn: "",
  notes: "",
  ...extra,
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
  mocks: unknown[] = [],
  params: {
    schedule?: FixedScheduleNode;
    takenClientIds?: string[];
  } = {}
) => {
  const onDone = vi.fn();
  const { result } = renderHook(
    () =>
      useFixedScheduleForm({
        sellerId: SELLER,
        schedule: params.schedule,
        takenClientIds: params.takenClientIds,
        onDone,
      }),
    { wrapper: wrapper(mocks) }
  );
  act(() => result.current.handleClose(true));
  return { result, onDone };
};

type TestField = {
  name: string;
  options?: { label: string; value: string }[];
};

const fields = (result: ReturnType<typeof run>["result"]) =>
  result.current.steps[0].sections[0].fields as TestField[];

beforeEach(() => {
  vi.clearAllMocks();
  wallet.nodes = [walletNode("c1", "ALTO"), walletNode("c2", "ZETA")];
});

describe("useFixedScheduleForm — escolher o cliente", () => {
  it("oferece a carteira do vendedor, sem repetir quem tem duas fábricas", () => {
    wallet.nodes = [
      walletNode("c1", "ALTO"),
      walletNode("c1", "ALTO"),
      walletNode("c2", "ZETA"),
    ];
    const { result } = run();
    const clientField = fields(result).find((f) => f.name === "clientId")!;

    expect(clientField.options?.map((o) => o.value)).toEqual(["c1", "c2"]);
  });

  it("quem já tem dia marcado sai da lista", () => {
    // Dois compromissos fixos para o mesmo cliente seriam a mesma visita duas
    // vezes na semana.
    const { result } = run([], { takenClientIds: ["c1"] });
    const clientField = fields(result).find((f) => f.name === "clientId")!;

    expect(clientField.options?.map((o) => o.value)).toEqual(["c2"]);
  });

  it("carteira sem ninguém livre é dita pela tela", () => {
    const { result } = run([], { takenClientIds: ["c1", "c2"] });

    expect(result.current.hasClients).toBe(false);
  });

  it("editando, o cliente não se troca — ele É o compromisso", () => {
    const { result } = run([], { schedule: schedule() });

    expect(fields(result).map((f) => f.name)).not.toContain("clientId");
    expect(result.current.isEditing).toBe(true);
    expect(result.current.hasClients).toBe(true);
  });
});

describe("useFixedScheduleForm — salvar", () => {
  it("marca o dia fixo com a cadência escolhida", async () => {
    const { result, onDone } = run([
      createMock({
        sellerId: SELLER,
        clientId: "c1",
        weekday: 3,
        intervalWeeks: 2,
        startsOn: "2026-09-01",
        endsOn: null,
        notes: null,
      }),
    ]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("editando, muda só a recorrência do compromisso", async () => {
    const { result, onDone } = run(
      [
        updateMock({
          weekday: 3,
          intervalWeeks: 2,
          startsOn: "2026-09-01",
          endsOn: null,
          notes: "de manhã",
        }),
      ],
      { schedule: schedule() }
    );

    await act(() => result.current.handleSubmit(form({ notes: " de manhã " })));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
  });

  it("abre com a recorrência que o compromisso já tem", () => {
    const { result } = run([], { schedule: schedule() });

    expect(result.current.initialData).toMatchObject({
      startsOn: "2026-09-01",
      notes: "Sempre de manhã",
    });
    expect(result.current.initialData?.weekday).toMatchObject({ value: "2" });
  });

  it("a recusa fica NA TELA, para o gestor reler enquanto corrige", async () => {
    // "Este dia não cabe, escolha outro" é uma decisão a tomar — num toast que
    // some, ela desaparece antes de a pessoa mexer nos campos.
    const { result, onDone } = run([
      createMock(
        {
          sellerId: SELLER,
          clientId: "c1",
          weekday: 3,
          intervalWeeks: 2,
          startsOn: "2026-09-01",
          endsOn: null,
          notes: null,
        },
        false,
        "Quarta-feira já está cheia para este vendedor."
      ),
    ]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() =>
      expect(result.current.refusal).toBe(
        "Quarta-feira já está cheia para este vendedor."
      )
    );
    expect(onDone).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
  });

  it("reabrir o modal apaga a recusa do dia anterior", async () => {
    const { result } = run([
      createMock(
        {
          sellerId: SELLER,
          clientId: "c1",
          weekday: 3,
          intervalWeeks: 2,
          startsOn: "2026-09-01",
          endsOn: null,
          notes: null,
        },
        false,
        "Quarta-feira já está cheia."
      ),
    ]);
    await act(() => result.current.handleSubmit(form()));
    await waitFor(() => expect(result.current.refusal).not.toBeNull());

    act(() => result.current.handleClose(false));
    act(() => result.current.handleClose(true));

    await waitFor(() => expect(result.current.refusal).toBeNull());
  });

  it("sem cliente escolhido, não tenta criar", async () => {
    const { result, onDone } = run([]);

    await act(() => result.current.handleSubmit(form({ clientId: null })));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onDone).not.toHaveBeenCalled();
  });
});
