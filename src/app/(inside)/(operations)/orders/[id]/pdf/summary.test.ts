import { describe, expect, it } from "vitest";

import { OrderInstallment } from "../interface";
import { Pdf } from "@/utils/pdf/theme";
import {
  drawNotes,
  drawPayment,
  drawTotals,
  paymentHeight,
  totalsHeight,
} from "./summary";

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
  it("decompõe em mercadoria, imposto no preço e IPI", () => {
    // Os mesmos rótulos do resumo da tela: quem confere o PDF contra o sistema
    // lê a mesma decomposição nos dois lugares.
    const { pdf, texts } = fakePdf();

    drawTotals(
      pdf,
      {
        merchandise: "1000.00",
        taxAmount: "180.00",
        ipiAmount: "50.00",
        total: 1230,
      },
      100
    );

    expect(texts).toContain("Mercadoria (sem impostos)");
    expect(texts).toContain("Impostos no preço");
    expect(texts).toContain("IPI");
    expect(texts).toContain("TOTAL");
    expect(texts.join(" ")).toContain("1.230,00");
  });

  it("não chama de Subtotal o que a tabela chama de outra coisa", () => {
    // A coluna SUBTOTAL dos itens é a linha COM o imposto embutido. Usar a
    // mesma palavra aqui para um número menor faria a folha se contradizer:
    // a soma da coluna não fecharia com o bloco.
    const { pdf, texts } = fakePdf();

    drawTotals(
      pdf,
      {
        merchandise: "1000.00",
        taxAmount: "180.00",
        ipiAmount: "0",
        total: 1180,
      },
      100
    );

    expect(texts.join(" ")).not.toContain("Subtotal");
  });

  it("sem imposto nenhum, só o TOTAL aparece", () => {
    // Mercadoria e total seriam o mesmo número. Repetir o valor em duas linhas
    // com nomes diferentes faz quem lê procurar uma diferença que não existe.
    const { pdf, texts } = fakePdf();

    drawTotals(
      pdf,
      { merchandise: "1000.00", taxAmount: "0", ipiAmount: "0", total: 1000 },
      100
    );

    expect(texts).toContain("TOTAL");
    expect(texts).not.toContain("Mercadoria (sem impostos)");
    expect(texts).not.toContain("Impostos no preço");
    expect(texts).not.toContain("IPI");
  });

  it("imposto sem IPI não escreve uma linha de IPI zerada", () => {
    // O caso comum da fábrica com ST e sem IPI no pedido. Uma linha "IPI
    // R$ 0,00" só ocupa espaço com o que não aconteceu.
    const { pdf, texts } = fakePdf();

    drawTotals(
      pdf,
      {
        merchandise: "1000.00",
        taxAmount: "180.00",
        ipiAmount: "0",
        total: 1180,
      },
      100
    );

    expect(texts).toContain("Mercadoria (sem impostos)");
    expect(texts).toContain("Impostos no preço");
    expect(texts).not.toContain("IPI");
  });

  it("IPI sem ST mostra a mercadoria e o IPI, sem linha de imposto no preço", () => {
    const { pdf, texts } = fakePdf();

    drawTotals(
      pdf,
      {
        merchandise: "1000.00",
        taxAmount: "0",
        ipiAmount: "75.00",
        total: 1075,
      },
      100
    );

    expect(texts).toContain("Mercadoria (sem impostos)");
    expect(texts).toContain("IPI");
    expect(texts).not.toContain("Impostos no preço");
  });

  it("devolve o fim do bloco para quem desenha embaixo", () => {
    const { pdf } = fakePdf();

    expect(
      drawTotals(
        pdf,
        { merchandise: "10.00", taxAmount: "0", ipiAmount: "0", total: 10 },
        100
      )
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

describe("alturas dos blocos", () => {
  // A altura medida é o que decide se o bloco ainda cabe na página. Medir menos
  // do que se desenha devolve o bug do total por cima do rodapé.
  it("o total mede exatamente o que desenha, até o pé da faixa âmbar", () => {
    const { pdf, boxes } = fakePdf();
    const data = {
      merchandise: "1000.00",
      taxAmount: "180.00",
      ipiAmount: "50.00",
      total: 1230,
    };

    drawTotals(pdf, data, 100);

    const [, boxY, , boxH] = boxes[0]!;
    expect(100 + totalsHeight(data)).toBe(boxY! + boxH!);
  });

  it("sem imposto o bloco encolhe: só a faixa do TOTAL", () => {
    const semImposto = {
      merchandise: "100.00",
      taxAmount: "0.00",
      ipiAmount: "0.00",
      total: 100,
    };
    const comImposto = { ...semImposto, taxAmount: "10.00", total: 110 };

    expect(totalsHeight(comImposto) - totalsHeight(semImposto)).toBe(32);
  });

  it("parcelas: zero sem parcela, uma fileira a cada três", () => {
    expect(paymentHeight([])).toBe(0);
    expect(paymentHeight([installment(1)])).toBe(
      paymentHeight([installment(1), installment(2), installment(3)])
    );
    expect(paymentHeight([1, 2, 3, 4].map(installment))).toBe(
      paymentHeight([installment(1)]) + 40
    );
  });
});
