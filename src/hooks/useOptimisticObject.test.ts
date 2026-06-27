import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOptimisticObject } from "./useOptimisticObject";

interface Factory {
  id: string;
  name: string;
  active: boolean;
}

const seed = (): Factory => ({ id: "1", name: "Fábrica", active: true });

describe("useOptimisticObject", () => {
  it("inicia com o objeto fornecido", () => {
    const { result } = renderHook(() =>
      useOptimisticObject<Factory>({ initialData: seed() })
    );
    expect(result.current.data).toEqual(seed());
  });

  it("updateOptimistic faz merge parcial dos campos", () => {
    const { result } = renderHook(() =>
      useOptimisticObject<Factory>({ initialData: seed() })
    );
    act(() => result.current.updateOptimistic({ active: false }));
    expect(result.current.data).toEqual({
      id: "1",
      name: "Fábrica",
      active: false,
    });
  });

  it("rollback restaura o valor anterior à última atualização", () => {
    const { result } = renderHook(() =>
      useOptimisticObject<Factory>({ initialData: seed() })
    );
    act(() => result.current.updateOptimistic({ name: "Editada" }));
    act(() => result.current.rollback());
    expect(result.current.data.name).toBe("Fábrica");
  });

  it("commit fixa o valor (rollback vira no-op)", () => {
    const { result } = renderHook(() =>
      useOptimisticObject<Factory>({ initialData: seed() })
    );
    act(() => result.current.updateOptimistic({ name: "Editada" }));
    act(() => result.current.commit());
    act(() => result.current.rollback());
    expect(result.current.data.name).toBe("Editada");
  });

  it("re-sincroniza quando initialData muda (refetch/load)", () => {
    const { result, rerender } = renderHook(
      ({ data }) => useOptimisticObject<Factory>({ initialData: data }),
      { initialProps: { data: seed() } }
    );
    act(() => result.current.updateOptimistic({ name: "Local" }));
    rerender({ data: { id: "1", name: "Servidor", active: true } });
    expect(result.current.data.name).toBe("Servidor");
  });
});
