import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { IMPORT_PRODUCTS_MUTATION } from "./gql";
import { ImportProductRow } from "./interface";
import { useProductImport } from "./hook";

const COMPANY_FACTORY = "cf1";

const row = (sku: string): ImportProductRow => ({
  sku,
  name: `Produto ${sku}`,
  category: "Cimentos",
  unit: "Saco",
  unitLabel: "Pallet",
  unitPerPack: 12,
});

const importMock = (
  rows: ImportProductRow[],
  data: {
    total: number;
    created: number;
    skipped: number;
    failed: number;
  } | null,
  message = "3 produtos importados"
) => ({
  request: {
    query: IMPORT_PRODUCTS_MUTATION,
    variables: { input: { companyFactoryId: COMPANY_FACTORY, rows } },
  },
  result: {
    data: {
      importProducts: {
        __typename: "ImportProductsResponse",
        status: data !== null,
        message,
        data: data
          ? {
              __typename: "ImportProductsResult",
              ...data,
              errors: [],
              ignored: [],
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

const run = (mocks: unknown[]) => {
  const onChanged = vi.fn();
  const { result } = renderHook(
    () => useProductImport(COMPANY_FACTORY, onChanged),
    { wrapper: wrapper(mocks) }
  );
  return { result, onChanged };
};

describe("useProductImport", () => {
  it("guarda o resumo da importação e recarrega a lista", async () => {
    const rows = [row("CIM-50"), row("ARG-20")];
    const { result, onChanged } = run([
      importMock(rows, { total: 2, created: 2, skipped: 0, failed: 0 }),
    ]);

    await act(() => result.current.runImport(rows));

    await waitFor(() => expect(result.current.result?.created).toBe(2));
    expect(onChanged).toHaveBeenCalledOnce();
  });

  it("importação que não criou nada não mexe na lista", async () => {
    // Todas as linhas já existiam: a tabela na tela continua a mesma.
    const rows = [row("CIM-50")];
    const { result, onChanged } = run([
      importMock(
        rows,
        { total: 1, created: 0, skipped: 1, failed: 0 },
        "1 produto já cadastrado"
      ),
    ]);

    await act(() => result.current.runImport(rows));

    await waitFor(() => expect(result.current.result?.skipped).toBe(1));
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("importação parcial ainda atualiza a lista com o que entrou", async () => {
    const rows = [row("CIM-50"), row("ARG-20")];
    const { result, onChanged } = run([
      importMock(rows, { total: 2, created: 1, skipped: 0, failed: 1 }),
    ]);

    await act(() => result.current.runImport(rows));

    await waitFor(() => expect(result.current.result?.failed).toBe(1));
    expect(onChanged).toHaveBeenCalledOnce();
  });

  it("recusa do backend não deixa resumo na tela", async () => {
    const rows = [row("CIM-50")];
    const { result, onChanged } = run([
      importMock(rows, null, "Fábrica sem catálogo"),
    ]);

    await act(() => result.current.runImport(rows));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.result).toBeNull();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("importar de novo começa sem o resumo anterior", async () => {
    const rows = [row("CIM-50")];
    const { result } = run([
      importMock(rows, { total: 1, created: 1, skipped: 0, failed: 0 }),
    ]);
    await act(() => result.current.runImport(rows));
    await waitFor(() => expect(result.current.result).not.toBeNull());

    act(() => result.current.resetResult());

    expect(result.current.result).toBeNull();
  });
});
