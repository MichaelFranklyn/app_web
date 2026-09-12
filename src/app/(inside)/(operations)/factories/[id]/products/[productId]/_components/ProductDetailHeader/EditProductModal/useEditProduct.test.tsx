import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Os catálogos da empresa vêm por `useCompleteList`, que tem teste próprio. */
vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: () => ({
    data: {
      product_categories_options: {
        edges: [
          { node: { id: "cat1", name: "Cimentos", segment: "Construção" } },
          { node: { id: "cat2", name: "Argamassas", segment: "Construção" } },
        ],
      },
      productUnits: {
        edges: [
          { node: { id: "u1", label: "Saco" } },
          { node: { id: "u2", label: "Caixa" } },
        ],
      },
      productUnitLabels: {
        edges: [
          { node: { id: "l1", label: "Pallet" } },
          { node: { id: "l2", label: "Fardo" } },
        ],
      },
    },
    error: undefined,
  }),
}));

import { Toast } from "@/components/Toast";
import { ProductDetail } from "../../../interface";
import { UPDATE_PRODUCT_MUTATION } from "./gql";
import { useEditProduct } from "./useEditProduct";

const product = (overrides: Partial<ProductDetail> = {}): ProductDetail =>
  ({
    id: "p1",
    name: "Cimento CP-II",
    sku: "CIM-50",
    unitPerPack: "12",
    ncm: "25232910",
    saleMultiple: null,
    isActive: true,
    unitId: "u1",
    unitLabelId: "l1",
    unit: { id: "u1", label: "Saco" },
    unitLabel: { id: "l1", label: "Pallet" },
    companyFactory: null,
    category: { id: "cat1", name: "Cimentos", segment: "Construção" },
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  }) as ProductDetail;

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_PRODUCT_MUTATION,
    variables: { id: "p1", input },
  },
  result: {
    data: {
      updateProduct: {
        __typename: "ProductResponse",
        status: ok,
        code: ok ? 200 : 400,
        message: ok ? "Produto atualizado" : "SKU já usado nesta fábrica",
        data: ok
          ? {
              __typename: "ProductType",
              id: "p1",
              name: "Cimento CP-II",
              sku: "CIM-50",
              ncm: "25232910",
              unitPerPack: "12",
              saleMultiple: null,
              isActive: true,
              unitId: "u1",
              unitLabelId: "l1",
              unit: { __typename: "UnitType", id: "u1", label: "Saco" },
              unitLabel: {
                __typename: "UnitLabelType",
                id: "l1",
                label: "Pallet",
              },
              category: {
                __typename: "CategoryType",
                id: "cat1",
                name: "Cimentos",
                segment: "Construção",
              },
              companyFactory: null,
              createdAt: "2026-01-01",
              updatedAt: "2026-09-12",
            }
          : null,
      },
    },
  },
});

/** O formulário como ele abre, já preenchido com o produto. */
const form = (extra: Record<string, unknown> = {}) => ({
  name: "Cimento CP-II",
  sku: "CIM-50",
  ncm: "25232910",
  unitPerPack: "12",
  saleMultiple: "",
  categoryId: { value: "cat1" },
  unitId: { value: "u1" },
  unitLabelId: { value: "l1" },
  isActive: { value: "true" },
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

const run = (mocks: unknown[] = [], detail = product()) => {
  const onSuccess = vi.fn();
  const { result } = renderHook(
    () => useEditProduct({ product: detail, onSuccess }),
    { wrapper: wrapper(mocks) }
  );
  act(() => result.current.setOpen(true));
  return { result, onSuccess };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useEditProduct — abrir", () => {
  it("abre com o produto preenchido, e o número sem zeros à toa", async () => {
    const { result } = run([], product({ unitPerPack: "12.0000" }));

    expect(result.current.initialData).toMatchObject({
      name: "Cimento CP-II",
      sku: "CIM-50",
      ncm: "25232910",
      unitPerPack: "12",
      saleMultiple: "",
    });
  });

  it("produto sem NCM nem múltiplo abre com os campos vazios", () => {
    const { result } = run([], product({ ncm: null, saleMultiple: null }));

    expect(result.current.initialData.ncm).toBe("");
    expect(result.current.initialData.saleMultiple).toBe("");
  });

  it("a categoria aparece com o segmento, como no seletor", () => {
    const { result } = run();

    expect(result.current.initialData.categoryId).toEqual({
      value: "cat1",
      label: "Cimentos · Construção",
    });
  });
});

describe("useEditProduct — salvar", () => {
  it("manda SÓ o que mudou", async () => {
    // Um update com o produto inteiro sobrescreveria campos que outra pessoa
    // acabou de mexer noutra aba.
    const { result, onSuccess } = run([updateMock({ name: "Cimento CP-IV" })]);

    await act(() =>
      result.current.handleSubmit(form({ name: "  Cimento CP-IV  " }))
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("sem nenhuma mudança, fecha sem ir ao servidor", async () => {
    // Sem mock de mutation: se ela fosse chamada, o teste falharia.
    const { result, onSuccess } = run([]);

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.open).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("apagar o NCM manda nulo — é diferente de não mexer", async () => {
    const { result, onSuccess } = run([updateMock({ ncm: null })]);

    await act(() => result.current.handleSubmit(form({ ncm: "  " })));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("aceita a vírgula decimal nas quantidades", async () => {
    const { result, onSuccess } = run([updateMock({ unitPerPack: 12.5 })]);

    await act(() => result.current.handleSubmit(form({ unitPerPack: "12,5" })));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("trocar categoria, unidade e rótulo viaja pelos ids", async () => {
    const { result, onSuccess } = run([
      updateMock({ categoryId: "cat2", unitId: "u2", unitLabelId: "l2" }),
    ]);

    await act(() =>
      result.current.handleSubmit(
        form({
          categoryId: { value: "cat2" },
          unitId: { value: "u2" },
          unitLabelId: { value: "l2" },
        })
      )
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("inativar o produto é uma mudança como outra qualquer", async () => {
    const { result, onSuccess } = run([updateMock({ isActive: false })]);

    await act(() =>
      result.current.handleSubmit(form({ isActive: { value: "false" } }))
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("recusa do backend mantém o modal aberto para corrigir", async () => {
    const { result, onSuccess } = run([updateMock({ sku: "CIM-99" }, false)]);

    await act(() => result.current.handleSubmit(form({ sku: "CIM-99" })));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
  });
});
