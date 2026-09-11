import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQueryErrorToast } from "./useQueryErrorToast";

const { toast } = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock("@/components/Toast", () => ({ useToast: () => ({ toast }) }));

describe("useQueryErrorToast", () => {
  beforeEach(() => toast.mockClear());

  it("sem erro, não avisa nada", () => {
    renderHook(() => useQueryErrorToast(undefined));
    expect(toast).not.toHaveBeenCalled();
  });

  it("avisa uma única vez, mesmo com novos renders", () => {
    const erro = new Error("falhou");
    const { rerender } = renderHook(({ e }) => useQueryErrorToast(e), {
      initialProps: { e: erro as unknown },
    });

    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith({
      title: "Erro ao carregar",
      description: "Não foi possível carregar algumas opções. Tente novamente.",
      variant: "error",
    });

    rerender({ e: erro });
    rerender({ e: erro });
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it("aceita mensagem própria", () => {
    renderHook(() => useQueryErrorToast(new Error("x"), "Sem fábricas."));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Sem fábricas." })
    );
  });

  it("volta a avisar depois que a query se recupera", () => {
    // O reset é o que permite notificar uma falha FUTURA: sem ele, a primeira
    // queda calaria o aviso pelo resto da vida do componente.
    const { rerender } = renderHook(({ e }) => useQueryErrorToast(e), {
      initialProps: { e: new Error("1") as unknown },
    });
    expect(toast).toHaveBeenCalledTimes(1);

    rerender({ e: undefined });
    expect(toast).toHaveBeenCalledTimes(1);

    rerender({ e: new Error("2") });
    expect(toast).toHaveBeenCalledTimes(2);
  });
});
