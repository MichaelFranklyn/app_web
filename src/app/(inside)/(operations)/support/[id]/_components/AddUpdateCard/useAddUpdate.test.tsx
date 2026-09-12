import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/Toast";
import { ADD_SUPPORT_UPDATE_MUTATION } from "@/graphql/support";
import { useAddUpdate } from "./useAddUpdate";

const CASE = "sc1";

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: { query: ADD_SUPPORT_UPDATE_MUTATION, variables: { input } },
  result: {
    data: {
      addClientSupportUpdate: {
        __typename: "SupportUpdateResponse",
        status: ok,
        message: ok ? "Andamento registrado" : "Caso já encerrado",
        data: ok
          ? {
              __typename: "SupportUpdateType",
              id: "up1",
              kind: input.kind,
              body: input.body,
              statusFrom: "OPEN",
              statusTo: input.status,
              createdAt: "2026-09-12",
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

const run = (mocks: unknown[] = []) => {
  const onSaved = vi.fn();
  const { result } = renderHook(() => useAddUpdate({ caseId: CASE, onSaved }), {
    wrapper: wrapper(mocks),
  });
  return { result, onSaved };
};

describe("useAddUpdate", () => {
  it("o andamento e a mudança de situação são um ato só", async () => {
    // "Falei com a fábrica, eles vão trocar" é o que aconteceu E a razão de o
    // caso passar a "aguardando fábrica": um formulário, uma chamada.
    const { result, onSaved } = run([
      updateMock({
        caseId: CASE,
        body: "Falei com a fábrica",
        kind: "CONTACT_FACTORY",
        status: "WAITING_FACTORY",
        resolution: null,
      }),
    ]);

    act(() => {
      result.current.setBody("  Falei com a fábrica  ");
      result.current.setKind("CONTACT_FACTORY");
      result.current.setStatus("WAITING_FACTORY");
    });
    await act(() => result.current.submit());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("sem texto não há andamento a registrar", () => {
    const { result } = run([]);

    expect(result.current.isValid).toBe(false);
    act(() => result.current.setBody("   "));
    expect(result.current.isValid).toBe(false);
    act(() => result.current.setBody("Cliente ligou"));
    expect(result.current.isValid).toBe(true);
  });

  it("a solução por escrito só viaja quando o caso encerra", async () => {
    // Mandá-la sempre sobrescreveria a que já estava lá com um texto vazio.
    const { result, onSaved } = run([
      updateMock({
        caseId: CASE,
        body: "Sem novidade",
        kind: "NOTE",
        status: null,
        resolution: null,
      }),
    ]);

    act(() => {
      result.current.setBody("Sem novidade");
      result.current.setResolution("Trocaram a peça");
    });
    expect(result.current.isClosing).toBe(false);

    await act(() => result.current.submit());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("encerrando, a solução vai junto", async () => {
    const { result, onSaved } = run([
      updateMock({
        caseId: CASE,
        body: "Resolvido",
        kind: "NOTE",
        status: "RESOLVED",
        resolution: "Trocaram a peça",
      }),
    ]);

    act(() => {
      result.current.setBody("Resolvido");
      result.current.setStatus("RESOLVED");
      result.current.setResolution(" Trocaram a peça ");
    });
    expect(result.current.isClosing).toBe(true);

    await act(() => result.current.submit());

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("registrado, o formulário volta em branco para o próximo", async () => {
    const { result } = run([
      updateMock({
        caseId: CASE,
        body: "Cliente ligou",
        kind: "NOTE",
        status: null,
        resolution: null,
      }),
    ]);
    act(() => result.current.setBody("Cliente ligou"));

    await act(() => result.current.submit());

    await waitFor(() => expect(result.current.body).toBe(""));
    expect(result.current.status).toBe("");
    expect(result.current.kind).toBe("NOTE");
  });

  it("recusa do backend não limpa o que foi escrito", async () => {
    const { result, onSaved } = run([
      updateMock(
        {
          caseId: CASE,
          body: "Cliente ligou",
          kind: "NOTE",
          status: null,
          resolution: null,
        },
        false
      ),
    ]);
    act(() => result.current.setBody("Cliente ligou"));

    await act(() => result.current.submit());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.body).toBe("Cliente ligou");
    expect(onSaved).not.toHaveBeenCalled();
  });
});
