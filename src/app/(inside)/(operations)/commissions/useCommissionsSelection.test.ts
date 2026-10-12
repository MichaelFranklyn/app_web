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
  { factoryId: "f1", name: "Alfa", count: 3 },
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

/** A seleção com as linhas da página aberta já registradas, como o cartão faz. */
const setup = (loaded: CommissionRow[] = ROWS) => {
  const hook = renderHook(
    (scope: Scope) => useCommissionsSelection({ groups: GROUPS, ...scope }),
    { initialProps: START }
  );
  act(() => hook.result.current.register("f1", loaded));
  return hook;
};

describe("useCommissionsSelection", () => {
  it("separa do lote as parcelas que dá para receber", () => {
    const { result } = setup();
    act(() => result.current.toggleAll("f1", ["a", "b", "c"]));

    expect(result.current.ids).toEqual(["a", "b", "c"]);
    expect(result.current.receivableIds).toEqual(["a", "c"]);
  });

  it("o lote guarda o conteúdo das parcelas, mesmo as de outra página", () => {
    // Página 1 registrada e marcada; depois o cartão troca para a página 2.
    const { result } = setup([row("a", true)]);
    act(() => result.current.togglePage("f1", ["a"]));
    act(() => result.current.register("f1", [row("z", true)]));
    act(() => result.current.togglePage("f1", ["z"]));

    expect(result.current.ids).toEqual(["a", "z"]);
    expect(result.current.selectedRows.map((r) => r.installmentId)).toEqual([
      "a",
      "z",
    ]);
    expect(result.current.receivableIds).toEqual(["a", "z"]);
  });

  it("uma busca nova atualiza o estado das parcelas já marcadas", () => {
    const { result } = setup();
    act(() => result.current.toggle("f1", "a"));
    expect(result.current.receivableIds).toEqual(["a"]);

    // A parcela foi recebida por outra ação e a página voltou do servidor.
    act(() => result.current.register("f1", [row("a", false)]));
    expect(result.current.receivableIds).toEqual([]);
  });

  it("o rótulo do lote diz a fábrica, o mês e quanto dela foi marcado", () => {
    const { result } = setup();
    // Sem nada marcado não há fábrica dona do lote: fica só o mês.
    expect(result.current.scopeLabel).toBe("outubro de 2026");
    expect(result.current.scopeSentence).toBe("");

    act(() => result.current.toggle("f1", "a"));
    expect(result.current.scopeLabel).toBe(
      "Alfa · outubro de 2026 · 1 de 3 parcelas desta fábrica"
    );
    expect(result.current.scopeSentence).toBe(
      "Esta ação vale para a parcela selecionada de Alfa (outubro de 2026)."
    );
  });

  it("diz quantas das marcadas estão em outra página antes da ação em lote", () => {
    // Página 1 marcada inteira; o cartão troca para a página 2 e marca mais uma.
    const { result } = setup([row("a", true), row("b", true)]);
    act(() => result.current.togglePage("f1", ["a", "b"]));
    act(() => result.current.register("f1", [row("z", true)]));
    act(() => result.current.togglePage("f1", ["z"]));

    expect(result.current.scopeLabel).toBe(
      "Alfa · outubro de 2026 · todas as parcelas desta fábrica · 2 estão em outra página"
    );
    expect(result.current.scopeSentence).toBe(
      "Esta ação vale para as 3 parcelas selecionadas de Alfa (outubro de 2026) — 2 delas não estão na página aberta."
    );
  });

  it("na aba de boletos em atraso o alcance não cita um mês", () => {
    const { result } = renderHook(() =>
      useCommissionsSelection({ groups: GROUPS, ...START, tab: "overdue" })
    );
    act(() => result.current.register("f1", ROWS));
    act(() => result.current.toggle("f1", "a"));
    expect(result.current.scopeLabel).toContain("todos os vencimentos");
    expect(result.current.scopeLabel).not.toContain("outubro");
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
