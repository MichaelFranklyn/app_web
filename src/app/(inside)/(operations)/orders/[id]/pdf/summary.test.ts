import { describe, expect, it } from "vitest";

import { OrderInstallment } from "../interface";
import { Pdf } from "@/utils/pdf/theme";
import { drawNotes, drawPayment, drawTotals } from "./summary";

/**
 * Uma folha de papel de mentira: guarda o que foi escrito e quantas caixas
 * foram desenhadas. O que se prende aqui é O QUE aparece no documento — a
 * posição exata é desenho, e muda sem que o pedido mude.
 */
const fakePdf = () => {
  const texts: string[] = [];
  const boxes: number[][] = [];
  const pdf = {
    internal: { pageSize: { getWidth: () => 595 } },
    setFont: () => {},
    setFontSize: () => {},
    setTextColor: () => {},
    setFillColor: () => {},
    setDrawColor: () => {},
    getTextWidth: (text: string) => text.length * 5,
    splitTextToSize: (text: string) => text.split("\n"),
    roundedRect: (...args: number[]) => {
      boxes.push(args);
    },
    text: (value: string | string[]) => {
      texts.push(...(Array.isArray(value) ? value : [value]));
    },
  };
  return { pdf: pdf as unknown as Pdf, texts, boxes };
};

const installment = (sequence: number): OrderInstallment =>
  ({
    id: `i${sequence}`,
    sequence,
    amount: "100.00",
    dueDate: "2026-10-10",
  }) as OrderInstallment;

describe("drawTotals", () => {
  it("não repete o imposto: o subtotal já o embute", () => {
    // O ST está dentro do subtotal (e detalhado linha a linha na tabela); uma
    // linha "Impostos" no bloco de totais contaria o mesmo dinheiro duas vezes.
    const { pdf, texts } = fakePdf();

    drawTotals(pdf, { subtotal: "1000.00", ipiAmount: "0", total: 1000 }, 100);

    expect(texts).toContain("Subtotal");
    expect(texts).toContain("TOTAL");
    expect(texts.join(" ")).not.toContain("Impostos");
    expect(texts).not.toContain("IPI");
  });

  it("mostra o IPI à parte quando a fábrica o cobra", () => {
    const { pdf, texts } = fakePdf();

    drawTotals(
      pdf,
      { subtotal: "1000.00", ipiAmount: "75.00", total: 1075 },
      100
    );

    expect(texts).toContain("IPI");
  });

  it("devolve o fim do bloco para quem desenha embaixo", () => {
    const { pdf } = fakePdf();

    expect(
      drawTotals(pdf, { subtotal: "10.00", ipiAmount: "0", total: 10 }, 100)
    ).toBeGreaterThan(100);
  });
});

describe("drawPayment", () => {
  it("pedido sem parcelas não ganha bloco de parcelas", () => {
    // As parcelas só existem depois de faturar; antes disso o bloco seria uma
    // moldura vazia. A condição de pagamento fica no cartão da fábrica.
    const { pdf, texts } = fakePdf();

    expect(drawPayment(pdf, [], 200)).toBe(200);
    expect(texts).toHaveLength(0);
  });

  it("desenha uma caixa por parcela, com data e valor", () => {
    const { pdf, texts, boxes } = fakePdf();

    drawPayment(pdf, [installment(1), installment(2)], 200);

    expect(texts).toContain("PARCELAS");
    expect(boxes).toHaveLength(2);
    expect(texts.join(" ")).toContain("1ª parcela · 10/10/2026");
  });

  it("quebra em linhas de três e empurra o que vem depois", () => {
    const { pdf } = fakePdf();
    const tres = [installment(1), installment(2), installment(3)];
    const quatro = [...tres, installment(4)];

    expect(drawPayment(pdf, quatro, 200)).toBeGreaterThan(
      drawPayment(pdf, tres, 200)
    );
  });

  it("parcela sem vencimento aparece mesmo assim", () => {
    // Faturamento revisado pode deixar a data em aberto; a parcela existe e o
    // cliente precisa vê-la.
    const { pdf, texts } = fakePdf();

    drawPayment(
      pdf,
      [{ ...installment(1), dueDate: null } as OrderInstallment],
      200
    );

    expect(texts).toContain("1ª parcela");
  });
});

describe("drawNotes", () => {
  it("pedido sem observação não abre seção vazia", () => {
    const { pdf, texts } = fakePdf();

    expect(drawNotes(pdf, null, 300)).toBe(300);
    expect(texts).toHaveLength(0);
  });

  it("escreve a observação como ela foi digitada, linha a linha", () => {
    const { pdf, texts } = fakePdf();

    const end = drawNotes(pdf, "Entregar pela manhã\nFalar com o Zé", 300);

    expect(texts).toContain("OBSERVAÇÕES");
    expect(texts).toContain("Entregar pela manhã");
    expect(texts).toContain("Falar com o Zé");
    expect(end).toBeGreaterThan(300);
  });
});
