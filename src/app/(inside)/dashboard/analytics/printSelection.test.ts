import { describe, expect, it } from "vitest";

import { ChartPrintEntry } from "./analyticsPrintContext";
import {
  allChartKeys,
  chartKey,
  describeGroup,
  describeSelection,
  groupBySection,
  hasSomethingToPrint,
  isChartSelected,
  PrintSelection,
  selectedEntries,
  selectedInGroup,
  toggleChart,
  toggleSection,
} from "./printSelection";

/** Um gráfico registrado, como o `LazyChartCard` o anuncia. */
const entry = (
  section: string,
  title: string,
  top: number,
  step = ""
): ChartPrintEntry => ({
  id: `id-${section}-${title}`,
  title,
  section,
  sectionStep: step,
  getImage: () => "data:image/jpeg;base64,x",
  getTop: () => top,
});

const ENTRIES = [
  entry("Como o período fechou", "Faturamento por mês", 100, "Parte 1 de 7"),
  entry("Como o período fechou", "Pedidos por mês", 200, "Parte 1 de 7"),
  entry("Sua carteira", "Clientes em risco", 300, "Parte 4 de 7"),
];

const selection = (charts: string[], includeKpis = true): PrintSelection => ({
  charts,
  includeKpis,
});

const all = (): PrintSelection =>
  selection(allChartKeys(groupBySection(ENTRIES)));

describe("groupBySection", () => {
  it("agrupa por parte da história, na ordem em que os gráficos chegam", () => {
    const groups = groupBySection(ENTRIES);
    expect(groups.map((group) => group.section)).toEqual([
      "Como o período fechou",
      "Sua carteira",
    ]);
    expect(groups[0].charts.map((choice) => choice.title)).toEqual([
      "Faturamento por mês",
      "Pedidos por mês",
    ]);
    expect(groups[0].step).toBe("Parte 1 de 7");
  });

  it("não duplica o gráfico que se registrou duas vezes", () => {
    // Um card que remonta se anuncia de novo com outro id; a lista não pode
    // ganhar uma linha repetida por isso.
    const groups = groupBySection([
      ...ENTRIES,
      entry("Sua carteira", "Clientes em risco", 999),
    ]);
    expect(groups[1].charts).toHaveLength(1);
  });

  it("recolhe os gráficos sem seção num grupo próprio", () => {
    const groups = groupBySection([entry("", "Solto", 10)]);
    expect(groups[0].section).toBe("");
    expect(groups[0].charts).toHaveLength(1);
  });
});

describe("chartKey", () => {
  it("distingue gráficos de mesmo título em partes diferentes", () => {
    // São perguntas diferentes, e cada uma precisa ser escolhível sozinha.
    expect(chartKey({ section: "A", title: "Faturamento por mês" })).not.toBe(
      chartKey({ section: "B", title: "Faturamento por mês" })
    );
  });
});

describe("toggleChart", () => {
  it("desmarca o que estava marcado e vice-versa, sem mexer no resto", () => {
    const key = chartKey(ENTRIES[0]);
    const without = toggleChart(all(), key);
    expect(isChartSelected(without, key)).toBe(false);
    expect(without.charts).toHaveLength(2);
    expect(isChartSelected(toggleChart(without, key), key)).toBe(true);
  });

  it("não altera a seleção recebida", () => {
    const before = all();
    toggleChart(before, chartKey(ENTRIES[0]));
    expect(before.charts).toHaveLength(3);
  });
});

describe("toggleSection", () => {
  const groups = groupBySection(ENTRIES);

  it("tira a parte inteira quando ela estava inteira", () => {
    const result = toggleSection(all(), groups[0]);
    expect(selectedInGroup(result, groups[0])).toBe(0);
    // A outra parte fica intacta.
    expect(selectedInGroup(result, groups[1])).toBe(1);
  });

  it("completa a parte que estava pela metade, em vez de esvaziá-la", () => {
    const half = selection([chartKey(ENTRIES[0]), chartKey(ENTRIES[2])]);
    const result = toggleSection(half, groups[0]);
    expect(selectedInGroup(result, groups[0])).toBe(2);
  });

  it("não repete a chave que já estava marcada", () => {
    const half = selection([chartKey(ENTRIES[0])]);
    const result = toggleSection(half, groups[0]);
    expect(new Set(result.charts).size).toBe(result.charts.length);
  });
});

describe("hasSomethingToPrint", () => {
  it("só os indicadores não fazem um documento", () => {
    expect(hasSomethingToPrint(selection([], true))).toBe(false);
    expect(hasSomethingToPrint(selection([chartKey(ENTRIES[0])], false))).toBe(
      true
    );
  });
});

describe("selectedEntries", () => {
  it("devolve só os gráficos escolhidos, na ordem de registro", () => {
    const chosen = selectedEntries(
      ENTRIES,
      selection([chartKey(ENTRIES[2]), chartKey(ENTRIES[0])])
    );
    expect(chosen.map((item) => item.title)).toEqual([
      "Faturamento por mês",
      "Clientes em risco",
    ]);
  });

  it("ignora chave que não corresponde a gráfico nenhum", () => {
    expect(selectedEntries(ENTRIES, selection(["parte fantasma"]))).toEqual([]);
  });
});

describe("describeGroup", () => {
  const groups = groupBySection(ENTRIES);

  it("parte inteira diz só quantos gráficos tem", () => {
    // "2 de 2" é ruído: a caixa marcada já contou essa história.
    expect(describeGroup(all(), groups[0])).toBe("Parte 1 de 7 · 2 gráficos");
    expect(describeGroup(all(), groups[1])).toBe("Parte 4 de 7 · 1 gráfico");
  });

  it("parte pela metade mostra a fração", () => {
    const half = selection([chartKey(ENTRIES[0])]);
    expect(describeGroup(half, groups[0])).toBe("Parte 1 de 7 · 1 de 2");
  });

  it("sem posição na história, só a contagem", () => {
    const [group] = groupBySection([entry("", "Solto", 10)]);
    expect(describeGroup(selection([]), group)).toBe("0 de 1");
  });
});

describe("describeSelection", () => {
  it("diz o que vai sair antes do clique", () => {
    expect(describeSelection(all(), 3)).toBe("Todos os 3 gráficos da página");
    expect(describeSelection(selection([chartKey(ENTRIES[0])]), 3)).toBe(
      "1 de 3 gráficos"
    );
    expect(describeSelection(selection([]), 3)).toBe(
      "Nenhum gráfico escolhido"
    );
  });
});
