import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** As três listas do catálogo vêm por `useCompleteList` (com teste próprio). */
const { catalog, refetchUnits, refetchLabels } = vi.hoisted(() => ({
  catalog: {
    categories: [] as { id: string; name: string }[],
    units: [] as { id: string; label: string }[],
    labels: [] as { id: string; label: string }[],
  },
  refetchUnits: vi.fn(),
  refetchLabels: vi.fn(),
}));

vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: (query: unknown) => {
    const name = JSON.stringify(query);
    if (name.includes("ProductCategoriesOptions")) {
      return {
        data: {
          productCategories: {
            edges: catalog.categories.map((node) => ({ node })),
          },
        },
        error: undefined,
        refetch: vi.fn(),
      };
    }
    if (name.includes("ProductUnitsOptions")) {
      return {
        data: {
          productUnits: { edges: catalog.units.map((node) => ({ node })) },
        },
        error: undefined,
        refetch: refetchUnits,
      };
    }
    return {
      data: {
        productUnitLabels: { edges: catalog.labels.map((node) => ({ node })) },
      },
      error: undefined,
      refetch: refetchLabels,
    };
  },
}));

import { Toast } from "@/components/Toast";
import {
  CREATE_PRODUCT_UNIT_LABEL_MUTATION,
  CREATE_PRODUCT_UNIT_MUTATION,
} from "./gql";
import { useProductCatalogOptions } from "./useProductCatalogOptions";

const unitMock = (
  label: string,
  ok = true,
  message = "Unidade já cadastrada"
) => ({
  request: {
    query: CREATE_PRODUCT_UNIT_MUTATION,
    variables: { input: { label } },
  },
  result: {
    data: {
      createProductUnit: {
        __typename: "ProductUnitResponse",
        status: ok,
        message: ok ? "ok" : message,
        data: ok
          ? { __typename: "ProductUnitType", id: "u-novo", label }
          : null,
      },
    },
  },
});

const labelMock = (label: string, ok = true) => ({
  request: {
    query: CREATE_PRODUCT_UNIT_LABEL_MUTATION,
    variables: { input: { label } },
  },
  result: {
    data: {
      createProductUnitLabel: {
        __typename: "ProductUnitLabelResponse",
        status: ok,
        message: ok ? "ok" : "Rótulo já cadastrado",
        data: ok
          ? { __typename: "ProductUnitLabelType", id: "l-novo", label }
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

const run = (mocks: unknown[] = []) =>
  renderHook(() => useProductCatalogOptions(true), {
    wrapper: wrapper(mocks),
  }).result;

beforeEach(() => {
  vi.clearAllMocks();
  catalog.categories = [{ id: "cat1", name: "Cimentos" }];
  catalog.units = [{ id: "u1", label: "Saco" }];
  catalog.labels = [{ id: "l1", label: "Pallet" }];
});

describe("useProductCatalogOptions", () => {
  it("entrega o catálogo da empresa como opções de select", () => {
    const result = run();

    expect(result.current.categoryOptions).toEqual([
      { value: "cat1", label: "Cimentos" },
    ]);
    expect(result.current.unitOptions).toEqual([
      { value: "u1", label: "Saco" },
    ]);
    expect(result.current.labelOptions).toEqual([
      { value: "l1", label: "Pallet" },
    ]);
  });

  it("catálogo vazio devolve lista vazia, e não quebra o formulário", () => {
    catalog.categories = [];
    catalog.units = [];
    catalog.labels = [];
    const result = run();

    expect(result.current.categoryOptions).toEqual([]);
    expect(result.current.unitOptions).toEqual([]);
  });

  it("criar a unidade no meio do cadastro devolve a opção com o id REAL", async () => {
    // Sem o id do backend, o select criaria uma opção-fantasma com o texto
    // digitado no lugar do id.
    const result = run([unitMock("Bombona")]);

    let created: unknown;
    await act(async () => {
      created = await result.current.handleCreateUnit("  Bombona  ");
    });

    expect(created).toEqual({ value: "u-novo", label: "Bombona" });
    expect(refetchUnits).toHaveBeenCalledOnce();
  });

  it("o rótulo de embalagem segue o mesmo caminho", async () => {
    const result = run([labelMock("Fardo")]);

    let created: unknown;
    await act(async () => {
      created = await result.current.handleCreateLabel("Fardo");
    });

    expect(created).toEqual({ value: "l-novo", label: "Fardo" });
    expect(refetchLabels).toHaveBeenCalledOnce();
  });

  it("recusa do backend RELANÇA — o select não pode ganhar opção falsa", async () => {
    const result = run([unitMock("Saco", false)]);

    await expect(result.current.handleCreateUnit("Saco")).rejects.toThrow(
      /unidade/i
    );
    expect(refetchUnits).not.toHaveBeenCalled();
  });
});
