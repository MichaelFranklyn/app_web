import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => state.sp,
  usePathname: () => "/test",
}));

import { useLocalTable } from "./useLocalTable";

interface Row {
  id: string;
  name: string;
  seller: string | null;
  amount: number;
  date: string | null;
}

const ROWS: Row[] = [
  { id: "1", name: "Zoraide", seller: "Ana", amount: 300, date: "2026-03-01" },
  { id: "2", name: "ácaro", seller: "Bruno", amount: 1000, date: null },
  { id: "3", name: "Brito", seller: "Ana", amount: 20, date: "2026-01-15" },
  { id: "4", name: "carla", seller: null, amount: 1000, date: "2026-02-10" },
];

const COLUMNS = {
  name: (r: Row) => r.name,
  amount: (r: Row) => r.amount,
  date: (r: Row) => r.date,
};

const FIELDS = {
  seller: {
    type: "select" as const,
    match: (r: Row, v: string) => r.seller === v,
  },
  search: {
    type: "text" as const,
    debounce: 0,
    match: (r: Row, v: string) =>
      r.name.toLowerCase().includes(v.toLowerCase()),
  },
};

const run = (sp = "") => {
  state.sp = new URLSearchParams(sp);
  return renderHook(() =>
    useLocalTable<Row>({ items: ROWS, columns: COLUMNS, fields: FIELDS })
  ).result;
};

const ids = (rows: Row[]) => rows.map((r) => r.id);

const lastUrlParams = () =>
  new URLSearchParams(
    decodeURIComponent(replace.mock.calls.at(-1)![0] as string).split("?")[1]
  );

beforeEach(() => {
  state.sp = new URLSearchParams();
  replace.mockClear();
  vi.spyOn(window.history, "replaceState").mockImplementation(
    (_state, _unused, url) => replace(url)
  );
});

describe("useLocalTable — ordenação", () => {
  it("sem sort na URL, devolve a lista na ordem de origem", () => {
    expect(ids(run().current.displayedData)).toEqual(["1", "2", "3", "4"]);
  });

  it("ordena texto ignorando acento e caixa (pt-BR)", () => {
    // "ácaro" tem de vir antes de "Brito", não depois de "Zoraide" — que é onde
    // uma comparação por código de caractere o jogaria.
    const r = run("sortBy=name&sortDir=asc");
    expect(ids(r.current.displayedData)).toEqual(["2", "3", "4", "1"]);
  });

  it("ordena número por grandeza, não como texto", () => {
    // Como texto, "300" viria depois de "1000".
    const r = run("sortBy=amount&sortDir=asc");
    expect(ids(r.current.displayedData)).toEqual(["3", "1", "2", "4"]);
  });

  it("célula vazia vai para o fim nas DUAS direções", () => {
    // O "—" não é a menor data, é a ausência de data.
    expect(ids(run("sortBy=date&sortDir=asc").current.displayedData)).toEqual([
      "3",
      "4",
      "1",
      "2",
    ]);
    expect(ids(run("sortBy=date&sortDir=desc").current.displayedData)).toEqual([
      "1",
      "4",
      "3",
      "2",
    ]);
  });

  it("empate preserva a ordem de origem (sort estável)", () => {
    // 2 e 4 empatam em 1000 e mantêm a ordem em que chegaram, nas duas direções.
    expect(
      ids(run("sortBy=amount&sortDir=desc").current.displayedData).slice(0, 2)
    ).toEqual(["2", "4"]);
  });

  it("não reordena o array de origem", () => {
    const before = ids(ROWS);
    run("sortBy=amount&sortDir=desc");
    expect(ids(ROWS)).toEqual(before);
  });

  it("coluna desconhecida na URL é ignorada", () => {
    const r = run("sortBy=inventada&sortDir=asc");
    expect(r.current.sort.key).toBeNull();
    expect(ids(r.current.displayedData)).toEqual(["1", "2", "3", "4"]);
  });

  it("ciclo de 3 estados: direção da coluna → inversa → ordem de origem", () => {
    const first = run();
    act(() => first.current.sort.onSort("amount", "desc"));
    expect(lastUrlParams().get("sortBy")).toBe("amount");
    expect(lastUrlParams().get("sortDir")).toBe("desc");

    const second = run("sortBy=amount&sortDir=desc");
    act(() => second.current.sort.onSort("amount", "desc"));
    expect(lastUrlParams().get("sortDir")).toBe("asc");

    // 3º clique devolve a lista à ordem em que ela chegou.
    const third = run("sortBy=amount&sortDir=asc");
    act(() => third.current.sort.onSort("amount", "desc"));
    expect(lastUrlParams().has("sortBy")).toBe(false);
    expect(lastUrlParams().has("sortDir")).toBe(false);
  });

  it("o 3º clique respeita o sortFirst da coluna", () => {
    // Coluna de texto começa em asc: quem zera é o desc, não o asc.
    const r = run("sortBy=name&sortDir=desc");
    act(() => r.current.sort.onSort("name", "asc"));
    expect(lastUrlParams().has("sortBy")).toBe(false);
  });
});

describe("useLocalTable — filtros", () => {
  it("filtra por select e conta as duas totalizações", () => {
    const r = run("seller=Ana");
    expect(ids(r.current.displayedData)).toEqual(["1", "3"]);
    // `totalItems` alimenta o rodapé; `totalUnfiltered` separa "lista vazia" de
    // "nada encontrado" no estado vazio.
    expect(r.current.totalItems).toBe(2);
    expect(r.current.totalUnfiltered).toBe(4);
  });

  it("filtros se somam em E", () => {
    const r = run("seller=Ana&search=brit");
    expect(ids(r.current.displayedData)).toEqual(["3"]);
  });

  it("filtro e ordenação convivem", () => {
    const r = run("seller=Ana&sortBy=amount&sortDir=asc");
    expect(ids(r.current.displayedData)).toEqual(["3", "1"]);
  });

  it("valor vazio não filtra nada", () => {
    expect(ids(run("seller=").current.displayedData)).toHaveLength(4);
  });
});
