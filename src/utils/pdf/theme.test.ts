import { describe, expect, it } from "vitest";

import { fitLogo, fitLogoPair, wrapLines } from "./theme";
import type { Pdf } from "./theme";

/** jsPDF real: as larguras saem das métricas da fonte, não de um fake. */
const makePdf = async (): Promise<Pdf> => {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  return pdf;
};

describe("fitLogo", () => {
  it("mantém a proporção de uma logo em faixa (larga e baixa)", () => {
    const box = fitLogo({ width: 1059, height: 247 }, 150, 38);
    expect(box.width).toBeCloseTo(150, 5);
    // 150 / 1059 * 247 ≈ 34.99 — cabe na altura, sem esticar.
    expect(box.height).toBeCloseTo(34.99, 1);
  });

  it("limita pela altura quando a logo é vertical", () => {
    const box = fitLogo({ width: 200, height: 400 }, 150, 38);
    expect(box.height).toBeCloseTo(38, 5);
    expect(box.width).toBeCloseTo(19, 0);
  });

  it("não amplia logo menor que a caixa (evita borrar)", () => {
    const box = fitLogo({ width: 40, height: 20 }, 150, 38);
    expect(box).toEqual({ width: 40, height: 20 });
  });
});

describe("fitLogoPair", () => {
  const faixa = { width: 1059, height: 247 };
  const quadrada = { width: 500, height: 500 };

  it("dá a MESMA altura às duas, cada uma na sua proporção", () => {
    const [a, b] = fitLogoPair(faixa, quadrada, 170, 54);
    expect(a!.height).toBeCloseTo(b!.height, 5);
    // A faixa é quem limita (esbarra na largura): 170/1059*247 ≈ 39.6.
    expect(a!.height).toBeCloseTo(39.65, 1);
    expect(a!.width).toBeCloseTo(170, 1);
    expect(b!.width).toBeCloseTo(39.65, 1);
  });

  it("logo sozinha usa a caixa inteira", () => {
    const [a, b] = fitLogoPair(quadrada, null, 170, 54);
    expect(a).toEqual({ width: 54, height: 54 });
    expect(b).toBeNull();
  });

  it("sem nenhuma logo devolve o par vazio", () => {
    expect(fitLogoPair(null, null, 170, 54)).toEqual([null, null]);
  });
});

describe("wrapLines", () => {
  it("deixa o nome curto numa linha só", async () => {
    const pdf = await makePdf();
    expect(wrapLines(pdf, "TORNEIRA LAVAT 1/2 BR", 160, 2)).toEqual([
      "TORNEIRA LAVAT 1/2 BR",
    ]);
  });

  it("quebra entre palavras e preserva o fim do nome", async () => {
    const pdf = await makePdf();
    // 202pt é a largura real da coluna PRODUTO no PDF ilustrado do pedido.
    const width = 202;
    const lines = wrapLines(
      pdf,
      "PORTA-GRELHA QUADRADO CAIXA SIFONADA 150 2283",
      width,
      2
    );
    expect(lines).toHaveLength(2);
    // Nenhuma linha estoura a coluna...
    lines.forEach((line) =>
      expect(pdf.getTextWidth(line)).toBeLessThanOrEqual(width)
    );
    // ...e o fim do nome, que numa linha só virava reticências, aparece inteiro.
    expect(lines.join(" ")).toBe(
      "PORTA-GRELHA QUADRADO CAIXA SIFONADA 150 2283"
    );
  });

  it("corta com reticências o que não cabe nem em duas linhas", async () => {
    const pdf = await makePdf();
    const lines = wrapLines(pdf, "A".repeat(400), 80, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("…")).toBe(true);
  });
});
