import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { UPDATE_PRODUCT_STOCK_MUTATION } from "../../../gql";
import { useUpdateProductStock } from "./useUpdateProductStock";

const SCF = "scf1";

const stockMock = (
  productId: string,
  daysRemaining: number | null,
  ok = true
) => ({
  request: {
    query: UPDATE_PRODUCT_STOCK_MUTATION,
    variables: { sellerClientFactoryId: SCF, productId, daysRemaining },
  },
  result: {
    data: {
      updateProductStock: {
        __typename: "ProductStockResponse",
        status: ok,
        code: ok ? 200 : 400,
        message: ok ? "Estoque atualizado" : "Produto de outra fábrica",
        data: ok
          ? {
              __typename: "ClientProductInsightType",
              id: "cpi1",
              productId,
              daysRemaining,
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

const run = (mocks: unknown[], scf: string | null = SCF) => {
  const onSaved = vi.fn();
  const { result } = renderHook(() => useUpdateProductStock(scf, onSaved), {
    wrapper: wrapper(mocks),
  });
  return { result, onSaved };
};

describe("useUpdateProductStock", () => {
  it("registra o estoque que o cliente informou por telefone", async () => {
    // O backend corrige a previsão de esgotamento e recalcula o score na hora.
    const { result, onSaved } = run([stockMock("p1", 15)]);

    await act(() => result.current.save("p1", 15));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("apagar a resposta é uma resposta — manda nulo", async () => {
    const { result, onSaved } = run([stockMock("p1", null)]);

    await act(() => result.current.save("p1", null));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("sem o vínculo aberto não há a quem atribuir o estoque", async () => {
    const { result, onSaved } = run([], null);

    await act(() => result.current.save("p1", 15));

    expect(onSaved).not.toHaveBeenCalled();
  });

  it("recusa do backend não recarrega a tabela como se tivesse salvo", async () => {
    const { result, onSaved } = run([stockMock("p1", 15, false)]);

    await act(() => result.current.save("p1", 15));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSaved).not.toHaveBeenCalled();
  });
});
