import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAsyncAction } from "./useAsyncAction";

// O hook lê `toast` de @/components/Toast; isolamos com um spy para asseverar
// as chamadas sem depender da renderização/portal do ToastProvider.
const { toast } = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast }),
}));

describe("useAsyncAction", () => {
  beforeEach(() => toast.mockClear());

  it("sucesso: retorna o resultado, chama onSuccess e emite toast de sucesso", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAsyncAction());

    let returned: unknown;
    await act(async () => {
      returned = await result.current.execute(async () => "ok", {
        onSuccess,
        successMessage: "Salvo!",
      });
    });

    expect(returned).toBe("ok");
    expect(onSuccess).toHaveBeenCalledWith("ok");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", description: "Salvo!" })
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("sucesso sem successMessage não dispara toast", async () => {
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.execute(async () => 42);
    });

    expect(toast).not.toHaveBeenCalled();
  });

  it("erro: retorna undefined, chama onError e faz toast com a mensagem do erro", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useAsyncAction());

    let returned: unknown = "sentinela";
    await act(async () => {
      returned = await result.current.execute(
        async () => {
          throw new Error("Falhou aqui");
        },
        { onError }
      );
    });

    expect(returned).toBeUndefined();
    expect(onError).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "error", description: "Falhou aqui" })
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("erro: errorMessage sobrepõe a mensagem crua do erro", async () => {
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.execute(
        async () => {
          throw new Error("stack cru");
        },
        { errorMessage: "Não foi possível salvar" }
      );
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        description: "Não foi possível salvar",
      })
    );
  });

  it("isLoading é true durante a ação e volta a false ao terminar", async () => {
    const { result } = renderHook(() => useAsyncAction());

    let resolvePending!: (value: string) => void;
    const pending = new Promise<string>((resolve) => {
      resolvePending = resolve;
    });

    let exec!: Promise<unknown>;
    act(() => {
      exec = result.current.execute(() => pending);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePending("done");
      await exec;
    });

    expect(result.current.isLoading).toBe(false);
  });
});
