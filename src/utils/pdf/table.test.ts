import { jsPDF } from "jspdf";
import { describe, expect, it, vi } from "vitest";

import { drawReportTable, layoutColumns, ReportColumn } from "./table";
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

// ── drawReportTable ──────────────────────────────────────────────────────────
// Usa o jsPDF de verdade (é ele quem sabe a altura da página e mede o texto) e
// espia o que foi desenhado. O que importa aqui é a GRADE: cabeçalho repetido,
// quebra de página e a faixa de totais colada sob os valores que ela soma.

interface Linha {
  cliente: string;
  fantasia: string | null;
  valor: string;
}

const linha = (n: number): Linha => ({
  cliente: `Cliente ${n}`,
  fantasia: `Fantasia ${n}`,
  valor: `R$ ${n},00`,
});

const colunasSimples: ReportColumn<Linha>[] = [
  { header: "Cliente", width: 60, value: (r) => r.cliente },
  {
    header: "Valor",
    width: 40,
    align: "right",
    bold: true,
    value: (r) => r.valor,
  },
];

const montar = () => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const text = vi.spyOn(pdf, "text");
  const rect = vi.spyOn(pdf, "rect");
  const onNewPage = vi.fn(() => {
    pdf.addPage();
    return PAGE.margin;
  });
  const written = () => text.mock.calls.map((call) => String(call[0]));
  return { pdf, text, rect, onNewPage, written };
};

describe("drawReportTable", () => {
  it("escreve o cabeçalho e uma linha por registro", () => {
    const { pdf, onNewPage, written } = montar();

    drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [linha(1), linha(2)],
      startY: PAGE.margin,
      onNewPage,
    });

    expect(written()).toEqual(
      expect.arrayContaining(["Cliente", "Valor", "Cliente 1", "R$ 2,00"])
    );
    expect(onNewPage).not.toHaveBeenCalled();
  });

  it("devolve o y livre abaixo da tabela", () => {
    const { pdf, onNewPage } = montar();

    const y = drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [linha(1)],
      startY: PAGE.margin,
      onNewPage,
    });

    expect(y).toBeGreaterThan(PAGE.margin);
  });

  it("abre página nova e REPETE o cabeçalho quando a folha acaba", () => {
    // Sem repetir, a partir da segunda folha as colunas viram números sem nome.
    const { pdf, onNewPage, written } = montar();

    drawReportTable(pdf, {
      columns: colunasSimples,
      rows: Array.from({ length: 60 }, (_, i) => linha(i + 1)),
      startY: PAGE.margin,
      onNewPage,
    });

    expect(onNewPage).toHaveBeenCalled();
    const vezes = written().filter((t) => t === "Cliente").length;
    expect(vezes).toBe(onNewPage.mock.calls.length + 1);
  });

  it("zebra as linhas ímpares para o olho não trocar de linha no meio", () => {
    const { pdf, rect, onNewPage } = montar();

    drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [linha(1), linha(2), linha(3), linha(4)],
      startY: PAGE.margin,
      onNewPage,
    });

    // 1 retângulo de cabeçalho + 2 faixas (as linhas de índice 1 e 3).
    expect(rect).toHaveBeenCalledTimes(3);
  });

  it("linha com segunda informação é mais alta que a linha simples", () => {
    const { pdf, onNewPage } = montar();
    const comum = drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [linha(1)],
      startY: PAGE.margin,
      onNewPage,
    });

    const outro = montar();
    const comSub = drawReportTable(outro.pdf, {
      columns: [
        { ...colunasSimples[0], sub: (r) => r.fantasia },
        colunasSimples[1],
      ],
      rows: [linha(1)],
      startY: PAGE.margin,
      onNewPage: outro.onNewPage,
    });

    expect(comSub).toBeGreaterThan(comum);
    expect(outro.written()).toContain("Fantasia 1");
  });

  it("sub nula não desenha segunda linha", () => {
    const { pdf, onNewPage, written } = montar();

    drawReportTable(pdf, {
      columns: [{ ...colunasSimples[0], sub: () => null }, colunasSimples[1]],
      rows: [linha(1)],
      startY: PAGE.margin,
      onNewPage,
    });

    expect(written()).not.toContain("Fantasia 1");
  });

  it("texto que não cabe na coluna sai com reticências", () => {
    const { pdf, onNewPage, written } = montar();

    drawReportTable(pdf, {
      columns: [
        { header: "Cliente", width: 1, value: (r) => r.cliente },
        { header: "X", width: 99, value: () => "" },
      ],
      rows: [{ ...linha(1), cliente: "Cliente com nome muito longo mesmo" }],
      startY: PAGE.margin,
      onNewPage,
    });

    const cortado = written().find((t) => t.endsWith("…"));
    expect(cortado).toBeDefined();
    expect(cortado!.length).toBeLessThan(
      "Cliente com nome muito longo mesmo".length
    );
  });

  it("a faixa de totais cai sob as colunas que ela soma", () => {
    const { pdf, text, onNewPage, written } = montar();

    drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [linha(1), linha(2)],
      startY: PAGE.margin,
      onNewPage,
      totals: { 1: "R$ 3,00" },
      totalsLabel: "TOTAL",
    });

    expect(written()).toContain("TOTAL");

    // Mesmo x da coluna de valores: é isso que faz o total cair debaixo dela.
    const xValor = text.mock.calls.find((c) => String(c[0]) === "R$ 1,00")?.[1];
    const xTotal = text.mock.calls.find((c) => String(c[0]) === "R$ 3,00")?.[1];
    expect(xTotal).toBe(xValor);
  });

  it("não deixa o total abrir a última página sozinho", () => {
    // A última linha reserva também a altura da faixa: a quebra tem que
    // acontecer ANTES dela, não entre a tabela e o seu fechamento.
    const { pdf, onNewPage } = montar();

    const semTotais = montar();
    drawReportTable(semTotais.pdf, {
      columns: colunasSimples,
      rows: Array.from({ length: 36 }, (_, i) => linha(i + 1)),
      startY: PAGE.margin,
      onNewPage: semTotais.onNewPage,
    });

    drawReportTable(pdf, {
      columns: colunasSimples,
      rows: Array.from({ length: 36 }, (_, i) => linha(i + 1)),
      startY: PAGE.margin,
      onNewPage,
      totals: { 1: "R$ 100,00" },
      totalsLabel: "TOTAL",
    });

    expect(onNewPage.mock.calls.length).toBeGreaterThanOrEqual(
      semTotais.onNewPage.mock.calls.length
    );
  });

  it("totais sem rótulo e sem valor em coluna nenhuma ainda fecham a tabela", () => {
    const { pdf, onNewPage } = montar();

    const y = drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [linha(1)],
      startY: PAGE.margin,
      onNewPage,
      totals: {},
    });

    expect(y).toBeGreaterThan(PAGE.margin);
  });

  it("tabela sem linhas sai só com o cabeçalho", () => {
    const { pdf, onNewPage, written } = montar();

    drawReportTable(pdf, {
      columns: colunasSimples,
      rows: [],
      startY: PAGE.margin,
      onNewPage,
    });

    expect(written()).toEqual(["Cliente", "Valor"]);
  });
});
