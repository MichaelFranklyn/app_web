import { jsPDF } from "jspdf";
import { describe, expect, it, vi } from "vitest";

import { drawReportHeader, ReportHeaderData } from "./reportHeader";
import { PAGE } from "./theme";

/**
 * Usa o jsPDF DE VERDADE (mede texto, conhece a página) e espia só o que ele
 * desenha. Um duble completo mediria com a régua errada — e é a medição que
 * decide se o recorte cabe numa linha ou em duas.
 */
const setup = () => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const text = vi.spyOn(pdf, "text");
  const addImage = vi.spyOn(pdf, "addImage").mockReturnValue(pdf);
  const written = () => text.mock.calls.map((call) => String(call[0]));
  return { pdf, text, addImage, written };
};

const logo = {
  dataUrl: "data:image/png;base64,AAAA",
  width: 200,
  height: 50,
};

const base: ReportHeaderData = {
  companyName: "Representação Teste",
  companyLogo: null,
  title: "Clientes da carteira",
  issuedAt: "11/09/2026",
};

describe("drawReportHeader", () => {
  it("devolve o y onde o conteúdo pode começar, abaixo do cabeçalho", () => {
    const { pdf } = setup();
    const y = drawReportHeader(pdf, base);
    expect(y).toBeGreaterThan(PAGE.margin + 40);
  });

  it("sem logo, o nome de quem emite ocupa o lugar dela", () => {
    const { pdf, written } = setup();
    drawReportHeader(pdf, base);
    expect(written()).toContain("Representação Teste");
  });

  it("com logo, desenha a marca e não repete o nome", () => {
    const { pdf, addImage, written } = setup();
    drawReportHeader(pdf, { ...base, companyLogo: logo });

    expect(addImage).toHaveBeenCalledWith(
      logo.dataUrl,
      PAGE.margin,
      PAGE.margin,
      expect.any(Number),
      expect.any(Number)
    );
    expect(written()).not.toContain("Representação Teste");
  });

  it("sem logo e sem nome, o cabeçalho ainda sai (só sem quem emite)", () => {
    const { pdf, written } = setup();
    const y = drawReportHeader(pdf, {
      ...base,
      companyName: null,
      companyLogo: null,
    });

    expect(y).toBeGreaterThan(PAGE.margin);
    expect(written()).toContain("CLIENTES DA CARTEIRA");
  });

  it("o título vai em caixa alta na faixa", () => {
    const { pdf, written } = setup();
    drawReportHeader(pdf, base);
    expect(written()).toContain("CLIENTES DA CARTEIRA");
  });

  it("data de emissão é escrita alinhada à direita", () => {
    const { pdf, text } = setup();
    drawReportHeader(pdf, base);

    const emitido = text.mock.calls.find((call) =>
      String(call[0]).startsWith("Emitido em")
    );
    expect(emitido?.[0]).toBe("Emitido em 11/09/2026");
    expect(emitido?.[3]).toEqual(expect.objectContaining({ align: "right" }));
  });

  it("o destaque do recorte sai em caixa alta, à direita da faixa", () => {
    const { pdf, text } = setup();
    drawReportHeader(pdf, { ...base, highlight: "setembro/2026" });

    const destaque = text.mock.calls.find(
      (call) => String(call[0]) === "SETEMBRO/2026"
    );
    expect(destaque).toBeDefined();
    expect(destaque?.[3]).toEqual(expect.objectContaining({ align: "right" }));
  });

  it("escreve os filtros aplicados abaixo do título", () => {
    // É o que impede o mal-entendido caro: lista filtrada por vendedor
    // impressa sem dizer isso passa por carteira inteira.
    const { pdf, written } = setup();
    drawReportHeader(pdf, {
      ...base,
      context: ["Vendedor: Ana", "UF: BA"],
    });

    expect(written()).toContain("Vendedor: Ana  ·  UF: BA");
  });

  it("descarta pedaços vazios do recorte em vez de imprimir separador solto", () => {
    const { pdf, written } = setup();
    drawReportHeader(pdf, {
      ...base,
      context: ["Vendedor: Ana", "", "UF: BA"],
    });

    expect(written()).toContain("Vendedor: Ana  ·  UF: BA");
  });

  it("recorte que não cabe numa linha quebra e empurra o conteúdo para baixo", () => {
    const { pdf } = setup();
    const curto = drawReportHeader(pdf, { ...base, context: ["UF: BA"] });

    const longo = drawReportHeader(pdf, {
      ...base,
      context: Array.from({ length: 12 }, (_, i) => `Filtro ${i}: valor longo`),
    });

    expect(longo).toBeGreaterThan(curto);
  });

  it("sem recorte nenhum, não sobra linha em branco", () => {
    const { pdf } = setup();
    const semContexto = drawReportHeader(pdf, base);
    const comContexto = drawReportHeader(pdf, {
      ...base,
      context: ["UF: BA"],
    });

    // Uma linha de recorte cabe na folga já reservada: o conteúdo começa no
    // mesmo lugar com ou sem ela. Só a SEGUNDA linha empurra a tabela.
    expect(semContexto).toBe(comContexto);
  });
});
