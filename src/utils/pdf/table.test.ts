import { describe, expect, it } from "vitest";

import { layoutColumns, ReportColumn } from "./table";
import { PAGE } from "./theme";

interface Row {
  name: string;
}

const columns: ReportColumn<Row>[] = [
  { header: "A", width: 50, value: (row) => row.name },
  { header: "B", width: 25, value: () => "" },
  { header: "C", width: 25, align: "right", value: () => "" },
];

// A4 paisagem em pontos — o formato dos relatórios de lista.
const PAGE_W = 842;

describe("layoutColumns", () => {
  it("distribui as colunas proporcionalmente ao peso", () => {
    const [first, second] = layoutColumns(columns, PAGE_W);
    // Peso 50 contra 25: a primeira coluna tem o dobro da largura útil.
    expect(second.x - first.x).toBeCloseTo((second.maxWidth + 10) * 2, 1);
  });

  it("começa dentro da margem e não estoura a página", () => {
    const boxes = layoutColumns(columns, PAGE_W);
    expect(boxes[0].x).toBeGreaterThanOrEqual(PAGE.margin);
    const last = boxes[boxes.length - 1];
    expect(last.x).toBeLessThanOrEqual(PAGE_W - PAGE.margin);
  });

  it("ancora a coluna alinhada à direita no fim do próprio espaço", () => {
    const boxes = layoutColumns(columns, PAGE_W);
    // Coluna à direita: o x é o limite do texto, então fica adiante do início
    // da coluna anterior mais a largura dela.
    expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].maxWidth);
  });

  it("não devolve largura negativa quando há muitas colunas", () => {
    const many: ReportColumn<Row>[] = Array.from(
      { length: 40 },
      (_, index) => ({
        header: `H${index}`,
        width: 1,
        value: () => "",
      })
    );
    expect(layoutColumns(many, PAGE_W).every((box) => box.maxWidth > 0)).toBe(
      true
    );
  });
});
