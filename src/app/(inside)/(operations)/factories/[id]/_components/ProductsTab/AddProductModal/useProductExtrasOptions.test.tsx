import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Impostos, tabelas e níveis vêm por `useCompleteList` (com teste próprio). */
const { data, refetchRules } = vi.hoisted(() => ({
  data: {
    rules: [] as { id: string; name: string }[],
    lists: [] as { id: string; name: string; isActive: boolean }[],
    tiers: [] as { id: string; name: string }[],
  },
  refetchRules: vi.fn(),
}));

vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: (query: unknown) => {
    const name = JSON.stringify(query);
    if (name.includes("AddProductTaxRules")) {
      return {
        data: { taxRules: { edges: data.rules.map((node) => ({ node })) } },
        error: undefined,
        refetch: refetchRules,
      };
    }
    if (name.includes("AddProductPriceLists")) {
      return {
        data: {
          factoryPriceLists: { edges: data.lists.map((node) => ({ node })) },
        },
        error: undefined,
        refetch: vi.fn(),
      };
    }
    return {
      data: { priceTiers: { edges: data.tiers.map((node) => ({ node })) } },
      error: undefined,
      refetch: vi.fn(),
    };
  },
}));

import { Toast } from "@/components/Toast";
import { CREATE_TAX_RULE_MUTATION } from "./gql";
import { useProductExtrasOptions } from "./useProductExtrasOptions";

const ruleMock = (name: string, ok = true) => ({
  request: {
    query: CREATE_TAX_RULE_MUTATION,
    variables: { input: { name } },
  },
  result: {
    data: {
      createTaxRule: {
        __typename: "TaxRuleResponse",
        status: ok,
        message: ok ? "ok" : "Imposto já cadastrado",
        data: ok ? { __typename: "TaxRuleType", id: "tr-novo", name } : null,
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

const run = (mocks: unknown[] = []) =>
  renderHook(() => useProductExtrasOptions(true, "cf1"), {
    wrapper: wrapper(mocks),
  }).result;

beforeEach(() => {
  vi.clearAllMocks();
  data.rules = [{ id: "tr1", name: "IPI" }];
  data.lists = [
    { id: "pl1", name: "Tabela 2026", isActive: true },
    { id: "pl2", name: "Tabela 2025", isActive: false },
  ];
  data.tiers = [{ id: "t1", name: "Platina" }];
});

describe("useProductExtrasOptions", () => {
  it("marca qual tabela de preço está valendo", () => {
    // Sem isso, o cadastro de preço cairia na tabela velha sem ninguém notar.
    const result = run();

    expect(result.current.priceListOptions).toEqual([
      { value: "pl1", label: "Tabela 2026 (ativa)" },
      { value: "pl2", label: "Tabela 2025" },
    ]);
  });

  it("entrega impostos e níveis da fábrica como opções", () => {
    const result = run();

    expect(result.current.taxRuleOptions).toEqual([
      { value: "tr1", label: "IPI" },
    ]);
    expect(result.current.tierOptions).toEqual([
      { value: "t1", label: "Platina" },
    ]);
  });

  it("fábrica sem tabela nem nível não quebra o passo de preços", () => {
    data.lists = [];
    data.tiers = [];
    const result = run();

    expect(result.current.priceListOptions).toEqual([]);
    expect(result.current.tierOptions).toEqual([]);
  });

  it("criar o imposto no meio do cadastro devolve o id REAL", async () => {
    const result = run([ruleMock("ST")]);

    let created: unknown;
    await act(async () => {
      created = await result.current.handleCreateTaxRule("ST");
    });

    expect(created).toEqual({ value: "tr-novo", label: "ST" });
    expect(refetchRules).toHaveBeenCalledOnce();
  });

  it("recusa RELANÇA — o select não pode ganhar opção falsa", async () => {
    const result = run([ruleMock("IPI", false)]);

    await expect(result.current.handleCreateTaxRule("IPI")).rejects.toThrow(
      /imposto/i
    );
  });
});
