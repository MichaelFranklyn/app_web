import { jsPDF } from "jspdf";
import { describe, expect, it } from "vitest";

import { layoutColumns } from "@/utils/pdf/table";

import { commissionsPdfColumns } from "./pdfColumns";

/** A4 paisagem em pontos — a orientação padrão dos relatórios. */
const PAGE_W = 842;

/**
 * Mede as colunas do papel com a MESMA régua que o jsPDF usa para desenhá-las.
 *
 * O relatório do escritório tem doze colunas na mesma folha, e três delas
 * carregam dinheiro na casa das centenas de milhares. Chutar peso não resolve:
 * na primeira tentativa os cabeçalhos "COMISSÃO EMPRESA" e "VALOR PARCELA"
 * saíram cortados no meio, e um papel de conferência com cabeçalho cortado não
 * serve para conferir nada. Aqui a largura é medida de verdade — este teste é o
 * que impede o próximo ajuste de peso de estourar em silêncio.
 */
const measure = (withOffice: boolean) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const columns = commissionsPdfColumns(withOffice);
  const boxes = layoutColumns(columns, PAGE_W);

  return columns.map((column, index) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    const header = pdf.getTextWidth(column.header);
    return {
      header: column.header,
      width: header,
      maxWidth: boxes[index].maxWidth,
    };
  });
};

/** O pior caso de cada coluna de dinheiro, medido na fonte das linhas. */
const moneyWidth = (text: string): number => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  return pdf.getTextWidth(text);
};

describe("commissionsPdfColumns", () => {
  it("nenhum cabeçalho é cortado, nas duas versões do papel", () => {
    for (const withOffice of [false, true]) {
      for (const column of measure(withOffice)) {
        const quem = withOffice ? "gestor" : "vendedor";
        expect(
          column.width,
          `${column.header} (${quem}) precisa de ${column.width.toFixed(0)}pt e tem ${column.maxWidth.toFixed(0)}pt`
        ).toBeLessThanOrEqual(column.maxWidth);
      }
    }
  });

  it("cabe o pior valor de cada coluna de dinheiro", () => {
    // A parcela é o valor da NOTA e chega às centenas de milhares; a comissão é
    // um percentual dela, então o pior caso é uma ordem de grandeza menor.
    // Perder um dígito aqui é pior do que não imprimir — o número sai plausível
    // e errado.
    const gestor = measure(true);
    const cabe = (header: string, pior: string) => {
      const column = gestor.find((c) => c.header === header);
      expect(column, header).toBeDefined();
      expect(
        column!.maxWidth,
        `${header} precisa de ${moneyWidth(pior).toFixed(0)}pt para "${pior}" e tem ${column!.maxWidth.toFixed(0)}pt`
      ).toBeGreaterThanOrEqual(moneyWidth(pior));
    };

    cabe("VALOR PARCELA", "R$ 124.509,90");
    cabe("COMISSÃO", "R$ 45.570,40");
    cabe("AO VENDEDOR", "R$ 45.570,40");
    cabe("ESCRITÓRIO", "R$ 45.570,40");
  });

  it("não corta a nota fiscal, que é a chave da conferência", () => {
    // A planilha da fábrica casa com a parcela PELA NOTA: meia nota não casa
    // com nada, e a conferência volta a ser cliente + valor no olho.
    const nota = measure(true).find((c) => c.header === "NOTA")!;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);

    expect(nota.maxWidth).toBeGreaterThanOrEqual(pdf.getTextWidth("128455-1"));
  });

  it("a repartição entra depois da comissão da empresa, na ordem da leitura", () => {
    // Os totais do papel são endereçados por ÍNDICE (ver `buildTotals`, no
    // content): trocar a ordem aqui põe o total debaixo da coluna errada.
    const headers = commissionsPdfColumns(true).map((c) => c.header);

    expect(headers.slice(6, 10)).toEqual([
      "VALOR PARCELA",
      "COMISSÃO",
      "AO VENDEDOR",
      "ESCRITÓRIO",
    ]);
    // Sem a repartição, a comissão continua sendo a coluna 7.
    expect(commissionsPdfColumns(false)[7].header).toBe("COMISSÃO");
  });
});
