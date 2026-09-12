import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Catálogos (categoria, unidade, rótulo, imposto, tabela) e a foto têm hooks
 * próprios: aqui entram como dublês, para o que se prende ser o cadastro —
 * produto primeiro, impostos e preços depois, e o que falha vira aviso.
 */
const { catalog, extras, photo } = vi.hoisted(() => ({
  catalog: {
    categoryOptions: [{ value: "cat1", label: "Cimentos" }],
    unitOptions: [{ value: "u1", label: "Saco" }],
    labelOptions: [{ value: "l1", label: "Pallet" }],
    handleCreateUnit: vi.fn(),
    handleCreateLabel: vi.fn(),
  },
  extras: {
    taxRuleOptions: [{ value: "tr1", label: "IPI" }],
    priceListOptions: [{ value: "pl1", label: "Tabela 2026" }],
    tierOptions: [{ value: "t1", label: "Platina" }],
    handleCreateTaxRule: vi.fn(),
  },
  photo: {
    reset: vi.fn(),
    toLogoInput: vi.fn(async () => ({})),
  },
}));

vi.mock("../useProductCatalogOptions", () => ({
  useProductCatalogOptions: () => catalog,
}));
vi.mock("./useProductExtrasOptions", () => ({
  useProductExtrasOptions: () => extras,
}));
vi.mock("@/components/LogoUpload", () => ({ useLogoUpload: () => photo }));

import { Toast } from "@/components/Toast";
import {
  ADD_TAX_TO_PRODUCT_MUTATION,
  CREATE_PRICE_LIST_ITEM_MUTATION,
  CREATE_PRODUCT_MUTATION,
} from "./gql";
import { useAddProduct } from "./useAddProduct";

const COMPANY_FACTORY = "cf1";

const createdProduct = {
  __typename: "ProductType",
  id: "p-novo",
  sku: "CIM-50",
  name: "Cimento CP-II",
  ncm: null,
  imageUrl: null,
  unitPerPack: "12.0000",
  isActive: true,
  unitId: "u1",
  unitLabelId: "l1",
  unit: { __typename: "UnitType", id: "u1", label: "Saco" },
  unitLabel: { __typename: "UnitLabelType", id: "l1", label: "Pallet" },
  category: { __typename: "CategoryType", id: "cat1", name: "Cimentos" },
};

const createMock = (
  input: Record<string, unknown>,
  ok = true,
  message = "Produto criado"
) => ({
  request: { query: CREATE_PRODUCT_MUTATION, variables: { input } },
  result: {
    data: {
      createProduct: {
        __typename: "ProductResponse",
        status: ok,
        message,
        data: ok ? createdProduct : null,
      },
    },
  },
});

const taxMock = (rate: string, ok = true) => ({
  request: {
    query: ADD_TAX_TO_PRODUCT_MUTATION,
    variables: {
      input: { productId: "p-novo", taxRuleId: "tr1", rate },
    },
  },
  result: {
    data: {
      addTaxToProduct: {
        __typename: "ProductTaxResponse",
        status: ok,
        message: ok ? "ok" : "Alíquota inválida",
        data: ok ? { __typename: "ProductTaxType", id: "pt1" } : null,
      },
    },
  },
});

const priceMock = (unitPrice: number, ok = true) => ({
  request: {
    query: CREATE_PRICE_LIST_ITEM_MUTATION,
    variables: {
      input: {
        productId: "p-novo",
        priceListId: "pl1",
        tierId: "t1",
        unitPrice,
      },
    },
  },
  result: {
    data: {
      createPriceListItem: {
        __typename: "PriceListItemResponse",
        status: ok,
        message: ok ? "ok" : "Já existe preço para este nível",
        data: ok ? { __typename: "PriceListItemType", id: "pli1" } : null,
      },
    },
  },
});

const baseInput = {
  companyFactoryId: COMPANY_FACTORY,
  categoryId: "cat1",
  unitId: "u1",
  unitLabelId: "l1",
  sku: "CIM-50",
  name: "Cimento CP-II",
  ncm: null,
  unitPerPack: 12,
  saleMultiple: null,
};

const form = (extra: Record<string, unknown> = {}) => ({
  categoryId: { value: "cat1" },
  unitId: { value: "u1" },
  unitLabelId: { value: "l1" },
  sku: "  CIM-50  ",
  name: "Cimento CP-II",
  ncm: "",
  unitPerPack: "12",
  saleMultiple: "0",
  taxes: [],
  prices: [],
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

const run = (mocks: unknown[] = []) => {
  const onChanged = vi.fn();
  const onAddOptimistic = vi.fn();
  const { result } = renderHook(
    () =>
      useAddProduct({
        companyFactoryId: COMPANY_FACTORY,
        onChanged,
        onAddOptimistic,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onChanged, onAddOptimistic };
};

beforeEach(() => {
  vi.clearAllMocks();
  photo.toLogoInput.mockResolvedValue({});
});

describe("useAddProduct — o produto", () => {
  it("cadastra com os dados do formulário, aparados", async () => {
    const { result, onAddOptimistic, onChanged } = run([createMock(baseInput)]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() =>
      expect(onAddOptimistic).toHaveBeenCalledWith(
        expect.objectContaining({ id: "p-novo" })
      )
    );
    expect(onChanged).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(false);
  });

  it("NCM em branco e múltiplo zerado viram ausência, não texto vazio", async () => {
    // O backend distingue "sem NCM" de "NCM vazio"; múltiplo 0 não é múltiplo.
    const { result, onChanged } = run([createMock(baseInput)]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("a foto entra no mesmo cadastro, quando há uma", async () => {
    // Ela fica fora do FormBuilder (não há campo de imagem), mas viaja junto.
    photo.toLogoInput.mockResolvedValue({ imageBase64: "AAA" });
    const { result, onChanged } = run([
      createMock({ ...baseInput, imageBase64: "AAA" }),
    ]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("recusa do backend não insere produto nenhum na lista", async () => {
    const { result, onAddOptimistic } = run([
      createMock(baseInput, false, "SKU já cadastrado nesta fábrica"),
    ]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onAddOptimistic).not.toHaveBeenCalled();
  });
});

describe("useAddProduct — impostos e preços", () => {
  const comExtras = {
    taxes: [{ taxRuleId: { value: "tr1" }, rate: "3,25" }],
    prices: [
      {
        priceListId: { value: "pl1" },
        tierId: { value: "t1" },
        unitPrice: "89,52",
      },
    ],
  };

  it("são gravados depois do produto, um a um", async () => {
    // Eles exigem o produto já criado — e o usuário não precisa abrir o
    // detalhe só para completá-los.
    const { result, onChanged } = run([
      createMock(baseInput),
      taxMock("3.25"),
      priceMock(89.52),
    ]);

    await act(() => result.current.handleSubmit(form(comExtras)));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("linha que falha não desfaz o produto — vira pendência", async () => {
    const { result, onAddOptimistic } = run([
      createMock(baseInput),
      taxMock("3.25", false),
      priceMock(89.52),
    ]);

    await act(() => result.current.handleSubmit(form(comExtras)));

    await waitFor(() => expect(onAddOptimistic).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("linha pela metade trava o envio antes de criar o produto", async () => {
    // Imposto sem alíquota (ou alíquota sem imposto) é engano de digitação: o
    // produto não pode nascer com metade do que a pessoa quis cadastrar.
    const { result, onAddOptimistic } = run([]);

    await act(() =>
      result.current.handleSubmit(
        form({ taxes: [{ taxRuleId: { value: "tr1" }, rate: "" }] })
      )
    );

    expect(onAddOptimistic).not.toHaveBeenCalled();
  });

  it("linha em branco é ignorada, e não vira erro", async () => {
    // O FormBuilder deixa uma linha vazia no fim; ela não é uma pendência.
    const { result, onChanged } = run([createMock(baseInput)]);

    await act(() =>
      result.current.handleSubmit(
        form({ taxes: [{ taxRuleId: null, rate: "" }] })
      )
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });
});

describe("useAddProduct — o wizard", () => {
  it("fechar devolve o formulário e a foto ao início", () => {
    const { result } = run([]);

    act(() => result.current.handleClose(false));

    expect(result.current.step).toBe(0);
    expect(photo.reset).toHaveBeenCalled();
  });

  it("sabe quando está no último passo", () => {
    const { result } = run([]);

    expect(result.current.isLastStep).toBe(false);
    expect(result.current.steps.length).toBeGreaterThan(1);
  });
});
