import type { EChartsCoreOption } from "echarts/core";
import { describe, expect, it } from "vitest";

import { buildChartInsight } from "./chartInsight";
import { ChartInsightSpec } from "./interface";

// 15/07/2026 — usado para que "jul/26" caia no mês corrente nos testes de série
// temporal. Data fixa: a leitura de tendência depende de qual mês é "hoje".
const TODAY = new Date(2026, 6, 15);

const monthly = (
  labels: string[],
  series: { name: string; data: number[] }[]
): EChartsCoreOption =>
  ({
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: series.map((s) => ({ name: s.name, type: "line", data: s.data })),
  }) as EChartsCoreOption;

const ranked = (
  names: string[],
  series: { name: string; data: number[] }[]
): EChartsCoreOption =>
  ({
    xAxis: { type: "value" },
    yAxis: { type: "category", data: names },
    series: series.map((s) => ({ name: s.name, type: "bar", data: s.data })),
  }) as EChartsCoreOption;

describe("buildChartInsight — trend", () => {
  const spec: ChartInsightSpec = {
    kind: "trend",
    unit: "count",
    subject: "meses",
  };

  it("compara o último mês fechado com o anterior", () => {
    const option = monthly(
      ["abr/26", "mai/26", "jun/26"],
      [{ name: "Pedidos", data: [10, 10, 20] }]
    );
    const insight = buildChartInsight(option, spec, TODAY);
    expect(insight?.text).toBe("jun/26 fechou em 20, 100% acima de mai/26.");
    expect(insight?.note).toBeUndefined();
  });

  it("ignora o mês corrente na comparação e avisa que ele está em andamento", () => {
    // jul/26 é o mês de TODAY: entra no gráfico, mas não na conta — senão meio
    // mês comparado com um mês inteiro daria "caiu" o ano todo.
    const option = monthly(
      ["mai/26", "jun/26", "jul/26"],
      [{ name: "Pedidos", data: [10, 20, 3] }]
    );
    const insight = buildChartInsight(option, spec, TODAY);
    expect(insight?.text).toBe("jun/26 fechou em 20, 100% acima de mai/26.");
    expect(insight?.note).toBe("jul/26 ainda está em andamento.");
  });

  it("aponta sequência de queda a partir de três meses", () => {
    const option = monthly(
      ["mar/26", "abr/26", "mai/26", "jun/26"],
      [{ name: "Pedidos", data: [40, 30, 20, 10] }]
    );
    expect(buildChartInsight(option, spec, TODAY)?.text).toContain(
      "É o 3º mês seguido de queda."
    );
  });

  it("trata variação mínima como estabilidade", () => {
    const option = monthly(
      ["mai/26", "jun/26"],
      [{ name: "Pedidos", data: [100, 101] }]
    );
    expect(buildChartInsight(option, spec, TODAY)?.text).toBe(
      "jun/26 fechou em 101, praticamente igual a mai/26."
    );
  });

  it("não afirma nada com um único mês fechado", () => {
    const option = monthly(
      ["jun/26", "jul/26"],
      [{ name: "Pedidos", data: [10, 4] }]
    );
    expect(buildChartInsight(option, spec, TODAY)).toBeNull();
  });
});

describe("buildChartInsight — ranking", () => {
  // O eixo Y do ranking horizontal vem invertido (maior no fim do array): a
  // leitura tem que ordenar por valor, não confiar na posição.
  const option = ranked(
    ["Pequena", "Média", "Grande"],
    [{ name: "Faturamento", data: [100, 300, 600] }]
  );

  it("pega o topo por valor, não por posição", () => {
    const insight = buildChartInsight(
      option,
      { kind: "ranking", unit: "money", subject: "fábricas" },
      TODAY
    );
    expect(insight?.text).toContain("No topo: Grande");
  });

  it("só soma os primeiros quando os valores somam", () => {
    const additive = buildChartInsight(
      ranked(
        ["D", "C", "B", "A"],
        [{ name: "Faturamento", data: [100, 100, 200, 600] }]
      ),
      { kind: "ranking", unit: "count", subject: "clientes", additive: true },
      TODAY
    );
    expect(additive?.text).toContain("Os 3 primeiros somam 90%");

    const average = buildChartInsight(
      option,
      { kind: "ranking", unit: "money", subject: "fábricas" },
      TODAY
    );
    expect(average?.text).not.toContain("somam");
  });

  it("avisa quando estar no topo é problema", () => {
    const insight = buildChartInsight(
      option,
      { kind: "ranking", unit: "days", subject: "clientes", topIsBad: true },
      TODAY
    );
    expect(insight?.text).toContain("Quanto mais alto, mais urgente.");
  });
});

describe("buildChartInsight — demais leituras", () => {
  it("share: maior fatia da rosca", () => {
    const pie = {
      series: [
        {
          type: "pie",
          data: [
            { name: "Real PE", value: 30 },
            { name: "CimNor", value: 10 },
          ],
        },
      ],
    } as EChartsCoreOption;
    expect(
      buildChartInsight(
        pie,
        { kind: "share", unit: "count", subject: "fábricas" },
        TODAY
      )?.text
    ).toBe("Maior fatia: Real PE, com 75% do total, entre 2 fábricas.");
  });

  it("concentration: lê o acumulado no terceiro maior", () => {
    const option = ranked(
      ["A", "B", "C", "D"],
      [
        { name: "Faturamento", data: [600, 200, 100, 100] },
        { name: "Acumulado", data: [0.6, 0.8, 0.9, 1] },
      ]
    );
    expect(
      buildChartInsight(
        option,
        { kind: "concentration", unit: "money", subject: "clientes" },
        TODAY
      )?.text
    ).toBe("Os 3 maiores clientes concentram 90% do total.");
  });

  it("rate: pondera a taxa pelo volume de cada mês", () => {
    // 90 visitas a 10% e 10 visitas a 100% dão 19% no período — não 55%, que
    // seria a média simples das duas taxas.
    const option = monthly(
      ["mai/26", "jun/26"],
      [
        { name: "Visitas realizadas", data: [90, 10] },
        { name: "Viraram pedido", data: [0.1, 1] },
      ]
    );
    expect(
      buildChartInsight(
        option,
        { kind: "rate", unit: "percent", subject: "visitas" },
        TODAY
      )?.text
    ).toBe("No período, 19% viraram pedido. Em jun/26, 100%.");
  });

  it("stacked: cita o total só quando as séries somam", () => {
    const option = monthly(
      ["mai/26", "jun/26"],
      [
        { name: "Entregue", data: [30, 30] },
        { name: "Cancelado", data: [10, 10] },
      ]
    );
    expect(
      buildChartInsight(
        option,
        { kind: "stacked", unit: "count", subject: "pedidos", additive: true },
        TODAY
      )?.text
    ).toBe("80 pedidos no período: 75% entregue e 25% cancelado.");

    expect(
      buildChartInsight(
        option,
        { kind: "stacked", unit: "count", subject: "clientes" },
        TODAY
      )?.text
    ).toBe("No período: 75% entregue e 25% cancelado.");
  });

  it("compare: conta onde a segunda barra passa da primeira, ignorando sem previsão", () => {
    const option = ranked(
      ["Sem previsão", "No prazo", "Atrasada"],
      [
        { name: "Prazo prometido", data: [0, 10, 10] },
        { name: "Prazo real", data: [30, 8, 25] },
      ]
    );
    expect(
      buildChartInsight(
        option,
        { kind: "compare", unit: "days", subject: "fábricas" },
        TODAY
      )?.text
    ).toBe("Em 1 de 2 fábricas, prazo real passou de prazo prometido.");
  });

  it("leader: quem soma mais no período", () => {
    const option = monthly(
      ["mai/26", "jun/26"],
      [
        { name: "Ana", data: [100, 100] },
        { name: "Bruno", data: [300, 300] },
      ]
    );
    expect(
      buildChartInsight(
        option,
        { kind: "leader", unit: "count", subject: "vendedores" },
        TODAY
      )?.text
    ).toBe("No período, Bruno lidera com 600 — 75% do total.");
  });

  it("lê séries cuja cor varia por item (pontos {value, itemStyle})", () => {
    const option = {
      xAxis: { type: "value" },
      yAxis: { type: "category", data: ["No limite", "Atrasado"] },
      series: [
        {
          name: "Dias sem comprar",
          type: "bar",
          data: [
            { value: 30, itemStyle: { color: "#888" } },
            { value: 120, itemStyle: { color: "#c00" } },
          ],
        },
      ],
    } as EChartsCoreOption;
    expect(
      buildChartInsight(
        option,
        { kind: "ranking", unit: "days", subject: "clientes", topIsBad: true },
        TODAY
      )?.text
    ).toContain("No topo: Atrasado, com 120 dias.");
  });

  it("devolve null quando não há dados", () => {
    const empty = { series: [] } as EChartsCoreOption;
    expect(
      buildChartInsight(
        empty,
        { kind: "trend", unit: "money", subject: "meses" },
        TODAY
      )
    ).toBeNull();
  });
});
