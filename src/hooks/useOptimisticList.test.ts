import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOptimisticList } from "./useOptimisticList";

interface Row {
  id: string;
  name: string;
  active?: boolean;
}

const seed = (): Row[] => [
  { id: "1", name: "Um" },
  { id: "2", name: "Dois" },
];

describe("useOptimisticList", () => {
  it("inicia com os dados fornecidos", () => {
    const { result } = renderHook(() =>
      useOptimisticList<Row>({ initialData: seed() })
    );
    expect(result.current.items.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("addOptimistic insere o item no topo", () => {
    const { result } = renderHook(() =>
      useOptimisticList<Row>({ initialData: seed() })
    );
    act(() => result.current.addOptimistic({ id: "3", name: "Três" }));
    expect(result.current.items.map((i) => i.id)).toEqual(["3", "1", "2"]);
  });

  it("updateOptimistic altera apenas o item com o id correspondente", () => {
    const { result } = renderHook(() =>
      useOptimisticList<Row>({ initialData: seed() })
    );
    act(() => result.current.updateOptimistic("2", { name: "Editado" }));
    expect(result.current.items.find((i) => i.id === "2")?.name).toBe(
      "Editado"
    );
    expect(result.current.items.find((i) => i.id === "1")?.name).toBe("Um");
  });

  it("removeOptimistic tira o item da lista", () => {
    const { result } = renderHook(() =>
      useOptimisticList<Row>({ initialData: seed() })
    );
    act(() => result.current.removeOptimistic("1"));
    expect(result.current.items.map((i) => i.id)).toEqual(["2"]);
  });

  it("rollback restaura o estado anterior à última operação", () => {
    const { result } = renderHook(() =>
      useOptimisticList<Row>({ initialData: seed() })
    );
    act(() => result.current.removeOptimistic("1"));
    act(() => result.current.rollback());
    expect(result.current.items.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("commit fixa o estado otimista (rollback vira no-op)", () => {
    const { result } = renderHook(() =>
      useOptimisticList<Row>({ initialData: seed() })
    );
    act(() => result.current.removeOptimistic("1"));
    act(() => result.current.commit());
    act(() => result.current.rollback());
    expect(result.current.items.map((i) => i.id)).toEqual(["2"]);
  });

  it("re-sincroniza quando initialData muda (refetch do servidor)", () => {
    const { result, rerender } = renderHook(
      ({ data }) => useOptimisticList<Row>({ initialData: data }),
      { initialProps: { data: seed() } }
    );
    act(() => result.current.removeOptimistic("1"));
    expect(result.current.items.map((i) => i.id)).toEqual(["2"]);

    rerender({ data: [{ id: "9", name: "Servidor" }] });
    expect(result.current.items.map((i) => i.id)).toEqual(["9"]);
  });
});
