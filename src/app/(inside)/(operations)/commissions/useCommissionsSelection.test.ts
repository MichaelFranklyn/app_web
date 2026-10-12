import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommissionRow } from "./interface";
import { useCommissionsSelection } from "./useCommissionsSelection";
import {
  type CommissionAudience,
  type CommissionTab,
  type FactoryGroup,
  type YearMonth,
} from "./utils";

const row = (installmentId: string, isReceivable: boolean) =>
  ({ installmentId, isReceivable }) as CommissionRow;

const ROWS = [row("a", true), row("b", false), row("c", true)];
const GROUPS = [
  { factoryId: "f1", name: "Alfa", rows: ROWS },
] as unknown as FactoryGroup[];
const OCTOBER: YearMonth = { year: 2026, month: 10 };

interface Scope {
  month: YearMonth;
  tab: CommissionTab;
  sellerId: string | null;
  audience: CommissionAudience;
}

const START: Scope = {
  month: OCTOBER,
  tab: "receivable",
  sellerId: null,
  audience: "office",
};

const setup = () =>
  renderHook(
    (scope: Scope) =>
      useCommissionsSelection({ rows: ROWS, groups: GROUPS, ...scope }),
    { initialProps: START }
  );

describe("useCommissionsSelection", () => {
  it("separa do lote as parcelas que dá para receber", () => {
    const { result } = setup();
    act(() => result.current.toggleAll("f1", ["a", "b", "c"]));

    expect(result.current.ids).toEqual(["a", "b", "c"]);
    expect(result.current.receivableIds).toEqual(["a", "c"]);
  });

  it("o rótulo do lote diz a fábrica e o mês", () => {
    const { result } = setup();
    // Sem nada marcado não há fábrica dona do lote: fica só o mês.
    expect(result.current.scopeLabel).toBe("outubro de 2026");

    act(() => result.current.toggle("f1", "a"));
    expect(result.current.scopeLabel).toBe("Alfa · outubro de 2026");
  });

  it.each<[string, Partial<Scope>]>([
    ["mês", { month: { year: 2026, month: 11 } }],
    ["situação", { tab: "received" }],
    ["vendedor", { sellerId: "s-2" }],
    ["ótica", { audience: "seller" }],
  ])("trocar de %s limpa a seleção", (_label, change) => {
    const { result, rerender } = setup();
    act(() => result.current.toggle("f1", "a"));
    expect(result.current.count).toBe(1);

    rerender({ ...START, ...change });

    expect(result.current.count).toBe(0);
    expect(result.current.receivableIds).toEqual([]);
  });

  it("render sem mudança de recorte mantém o lote", () => {
    const { result, rerender } = setup();
    act(() => result.current.toggle("f1", "a"));
    rerender(START);
    expect(result.current.ids).toEqual(["a"]);
  });
});
