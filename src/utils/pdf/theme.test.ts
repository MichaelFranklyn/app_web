import { describe, expect, it } from "vitest";

import { fitLogo, fitLogoPair } from "./theme";

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
