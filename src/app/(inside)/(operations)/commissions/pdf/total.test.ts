import { describe, expect, it, vi } from "vitest";

import { Pdf } from "@/utils/pdf/theme";
import { OFFICE_LENS, SELLER_LENS } from "../../../_shared/commissions";
import { drawMonthTotal, MonthTotals } from "./total";

/** Papel de mentira: guarda o que foi escrito, ignora onde foi escrito. */
const fakePdf = (pageHeight = 842) => {
  const texts: string[] = [];
  const pdf = {
    internal: {
      pageSize: { getWidth: () => 595, getHeight: () => pageHeight },
    },
    setFont: () => {},
    setFontSize: () => {},
    setTextColor: () => {},
    setFillColor: () => {},
    setDrawColor: () => {},
    line: () => {},
    roundedRect: () => {},
    text: (value: string) => {
      texts.push(value);
    },
  };
  return { pdf: pdf as unknown as Pdf, texts };
};

const totals = (overrides: Partial<MonthTotals> = {}): MonthTotals => ({
  receivable: 3000,
  received: 2000,
  pending: 900,
  next: {
    month: { year: 2026, month: 10 },
    receivable: 1500,
    pending: 400,
    count: 3,
  },
  ...overrides,
});

/** O texto do documento inteiro, com o espaço do dinheiro normalizado. */
const paper = (texts: string[]) => texts.join(" | ").replace(/ /g, " ");

describe("fechamento do mês", () => {
  it("soma só o que é dinheiro de alguém — o previsto fica de fora", () => {
    // Somar o previsto faria o papel prometer um mês maior do que a fábrica
    // vai pagar: ele ainda depende de faturar ou de o cliente pagar.
    const { pdf, texts } = fakePdf();

    drawMonthTotal(pdf, totals(), 100, vi.fn());

    expect(paper(texts)).toContain("R$ 5.000,00");
    expect(paper(texts)).toContain(
      "Previsto R$ 900,00 — depende do faturamento e não entra no total."
    );
  });

  it("nomeia quem deve conforme a ótica do papel", () => {
    // O escritório recebe da fábrica; o vendedor recebe do escritório. Trocar
    // os rótulos apontaria para quem não deve nada àquele leitor.
    const office = fakePdf();
    drawMonthTotal(office.pdf, totals(), 100, vi.fn(), OFFICE_LENS);
    const seller = fakePdf();
    drawMonthTotal(seller.pdf, totals(), 100, vi.fn(), SELLER_LENS);

    expect(paper(office.texts)).toContain("A receber das fábricas");
    expect(paper(seller.texts)).toContain("A receber do escritório");
    expect(paper(seller.texts)).toContain("Já repassado pelo escritório");
  });

  it("abre o mês seguinte com o que já está lançado", () => {
    const { pdf, texts } = fakePdf();

    drawMonthTotal(pdf, totals(), 100, vi.fn());

    expect(paper(texts)).toContain(
      "Próximo mês (outubro de 2026): R$ 1.500,00"
    );
    expect(paper(texts)).toContain("mais R$ 400,00 previsto");
  });

  it("mês seguinte vazio explica que ainda não foi faturado", () => {
    // Zero no dia 1º assusta: quase nunca é "vou receber zero", é um mês que
    // ainda não começou a ser faturado.
    const { pdf, texts } = fakePdf();

    drawMonthTotal(
      pdf,
      totals({
        next: {
          month: { year: 2026, month: 10 },
          receivable: 0,
          pending: 0,
          count: 0,
        },
      }),
      100,
      vi.fn()
    );

    expect(paper(texts)).toContain("Nada lançado para o próximo mês");
  });

  it("não deixa o fechamento órfão no pé da página", () => {
    // O bloco inteiro (as duas linhas, a faixa e a prévia) tem de caber; se não
    // couber, ele começa na página seguinte.
    const { pdf } = fakePdf();
    const onNewPage = vi.fn(() => 60);

    drawMonthTotal(pdf, totals(), 800, onNewPage);

    expect(onNewPage).toHaveBeenCalledOnce();
  });

  it("cabendo na página, não vira a folha à toa", () => {
    const { pdf } = fakePdf();
    const onNewPage = vi.fn(() => 60);

    drawMonthTotal(pdf, totals(), 100, onNewPage);

    expect(onNewPage).not.toHaveBeenCalled();
  });
});
