import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { UPDATE_COMPANY_MUTATION } from "./gql";
import { useSaveCompany } from "./useSaveCompany";

const COMPANY = "comp1";

const saveMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_COMPANY_MUTATION,
    variables: { id: COMPANY, input },
  },
  result: {
    data: {
      updateCompany: {
        __typename: "CompanyResponse",
        status: ok,
        message: ok ? "Dados atualizados" : "CEP inválido",
        data: ok
          ? {
              __typename: "CompanyType",
              id: COMPANY,
              segment: "Construção",
              phone: null,
              whatsapp: null,
              website: null,
              addressZip: null,
              addressStreet: null,
              addressNumber: null,
              addressComplement: null,
              addressNeighborhood: null,
              addressCity: null,
              addressState: null,
              logoUrl: null,
              avatarUrl: null,
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
  const onSaved = vi.fn();
  const { result } = renderHook(() => useSaveCompany(COMPANY, onSaved), {
    wrapper: wrapper(mocks),
  });
  return { result, onSaved };
};

describe("useSaveCompany", () => {
  it("grava o pedaço que a tela mandou — o input é parcial", async () => {
    // Todos os assuntos da tela de empresa passam pela mesma mutation.
    const { result, onSaved } = run([saveMock({ segment: "Construção" })]);

    await act(() => result.current.save({ segment: "Construção" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("quem chamou é avisado antes da tela recarregar", async () => {
    // O `afterSave` é o fechamento do modal; o `onSaved` refaz a leitura.
    const ordem: string[] = [];
    const { result, onSaved } = run([saveMock({ logoBase64: "AAA" })]);
    onSaved.mockImplementation(() => ordem.push("onSaved"));

    await act(() =>
      result.current.save({ logoBase64: "AAA" }, () => ordem.push("afterSave"))
    );

    await waitFor(() => expect(ordem).toEqual(["afterSave", "onSaved"]));
  });

  it("recusa do backend não avisa a tela de que salvou", async () => {
    const { result, onSaved } = run([
      saveMock({ addressZip: "00000-000" }, false),
    ]);

    await act(() => result.current.save({ addressZip: "00000-000" }));

    await waitFor(() => expect(result.current.isSaving).toBe(false));
    expect(onSaved).not.toHaveBeenCalled();
  });
});
