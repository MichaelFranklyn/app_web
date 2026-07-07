import { describe, expect, it } from "vitest";

import { OrderCountPoint } from "./interface";
import { buildOrdersByFactoryDonutOption } from "./utils";

// Extrai o formatter do tooltip para testar o cálculo de percentual.
const getTooltipFormatter = (points: OrderCountPoint[]) => {
  const option = buildOrdersByFactoryDonutOption(points) as {
    tooltip: { formatter: (p: unknown) => string };
  };
  return option.tooltip.formatter;
};

describe("buildOrdersByFactoryDonutOption", () => {
  it("monta os dados da rosca (nome/valor) na ordem recebida", () => {
    const points: OrderCountPoint[] = [
      { entityId: "1", entityName: "Real PE", orderCount: 30 },
      { entityId: "2", entityName: "CimNor", orderCount: 10 },
    ];

    const option = buildOrdersByFactoryDonutOption(points) as {
      series: { data: { name: string; value: number }[] }[];
    };

    expect(option.series[0].data).toEqual([
      { name: "Real PE", value: 30 },
      { name: "CimNor", value: 10 },
    ]);
  });

  it("calcula o percentual sobre o total no tooltip", () => {
    const points: OrderCountPoint[] = [
      { entityId: "1", entityName: "Real PE", orderCount: 30 },
      { entityId: "2", entityName: "CimNor", orderCount: 10 },
    ];

    const formatter = getTooltipFormatter(points);
    // 30 de 40 = 75%
    expect(formatter({ name: "Real PE", value: 30 })).toContain("75% do total");
  });

  it("não divide por zero quando não há pedidos", () => {
    const formatter = getTooltipFormatter([]);
    expect(formatter({ name: "X", value: 0 })).toContain("0% do total");
  });
});
