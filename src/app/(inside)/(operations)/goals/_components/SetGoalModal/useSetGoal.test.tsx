import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { GoalRow } from "../../interface";
import { SET_SELLER_GOAL_MUTATION } from "../../gql";
import { useSetGoal } from "./useSetGoal";

const PERIOD = "2026-09-01";
const sellerOptions = [{ label: "Rafael", value: "s1" }];
const factoryOptions = [{ label: "HERC", value: "f1" }];

const goalRow = (overrides: Partial<GoalRow> = {}): GoalRow =>
  ({
    goalId: "g1",
    sellerId: "s1",
    factoryId: "f1",
    periodMonth: PERIOD,
    seller: { id: "s1", name: "Rafael" },
    factory: {
      id: "f1",
      nomeFantasia: "HERC",
      nickname: null,
      razaoSocial: "HERC SA",
    },
    targetInvoicedAmount: "80000",
    targetOrderedAmount: null,
    targetPositivations: 20,
    targetVisits: null,
    invoicedAmount: "0",
    orderedAmount: "0",
    positivations: 0,
    visits: 0,
    ...overrides,
  }) as GoalRow;

const saveMock = (targets: Record<string, number | null>, ok = true) => ({
  request: {
    query: SET_SELLER_GOAL_MUTATION,
    variables: {
      input: {
        sellerId: "s1",
        factoryId: "f1",
        periodMonth: PERIOD,
        targetInvoicedAmount: null,
        targetOrderedAmount: null,
        targetPositivations: null,
        targetVisits: null,
        ...targets,
      },
    },
  },
  result: {
    data: {
      setSellerGoal: {
        __typename: "GoalResponse",
        status: ok,
        message: ok ? "Meta salva" : "Mês já fechado",
        data: ok ? { __typename: "GoalType", id: "g1" } : null,
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
  mocks: unknown[] = [],
  props: Partial<Parameters<typeof useSetGoal>[0]> = {}
) => {
  const onSaved = vi.fn();
  const { result } = renderHook(
    () =>
      useSetGoal({
        periodMonthIso: PERIOD,
        sellerOptions,
        factoryOptions,
        onSaved,
        ...props,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onSaved };
};

const fields = (result: ReturnType<typeof run>["result"]) =>
  result.current.steps[0].sections[0].fields.map((field) => field.name);

const form = (extra: Record<string, unknown> = {}) => ({
  sellerId: { value: "s1" },
  factoryId: { value: "f1" },
  targetInvoicedAmount: "",
  targetOrderedAmount: "",
  targetPositivations: "",
  targetVisits: "",
  ...extra,
});

describe("useSetGoal", () => {
  it("meta nova pergunta de quem é e de que fábrica", () => {
    const { result } = run();

    expect(fields(result)).toContain("sellerId");
    expect(fields(result)).toContain("factoryId");
    expect(result.current.isEditing).toBe(false);
  });

  it("editando uma meta, vendedor e fábrica não se trocam", () => {
    // Trocar um deles seria outra meta, não a edição desta.
    const { result } = run([], { row: goalRow() });

    expect(fields(result)).not.toContain("sellerId");
    expect(fields(result)).not.toContain("factoryId");
    expect(result.current.isEditing).toBe(true);
  });

  it("na tela de um vendedor, a meta já nasce dele", () => {
    const { result } = run([], { fixedSellerId: "s1" });

    expect(fields(result)).not.toContain("sellerId");
    expect(fields(result)).toContain("factoryId");
  });

  it("abre com os alvos já definidos, e vazio no que não se acompanha", () => {
    const { result } = run([], { row: goalRow() });

    expect(result.current.initialData).toMatchObject({
      targetInvoicedAmount: "80000",
      targetOrderedAmount: "",
      targetPositivations: 20,
      targetVisits: "",
    });
  });

  it("campo em branco é indicador sem meta — e não zero", async () => {
    // Zero é uma meta de verdade ("não vender"); em branco é "não acompanhar".
    const { result, onSaved } = run([
      saveMock({ targetVisits: 40, targetPositivations: 0 }),
    ]);

    await act(() =>
      result.current.handleSubmit(
        form({ targetVisits: "40", targetPositivations: "0" })
      )
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("aceita a vírgula decimal que a pessoa digita", async () => {
    const { result, onSaved } = run([
      saveMock({ targetInvoicedAmount: 80000.5 }),
    ]);

    await act(() =>
      result.current.handleSubmit(form({ targetInvoicedAmount: "80000,50" }))
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("meta sem nenhum alvo não é meta", async () => {
    const { result, onSaved } = run();

    await expect(result.current.handleSubmit(form())).rejects.toThrow(
      /ao menos uma meta/
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("sem vendedor ou fábrica, nem tenta salvar", async () => {
    const { result } = run();

    await expect(
      result.current.handleSubmit(form({ factoryId: null, targetVisits: "40" }))
    ).rejects.toThrow("Escolha o vendedor e a fábrica da meta.");
  });

  it("recusa do backend mantém o modal aberto para corrigir", async () => {
    const { result, onSaved } = run([saveMock({ targetVisits: 40 }, false)]);

    act(() => result.current.handleClose(true));
    await act(() => result.current.handleSubmit(form({ targetVisits: "40" })));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSaved).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
  });
});
