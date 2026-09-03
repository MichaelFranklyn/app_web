import { describe, expect, it } from "vitest";

import { TRAIL, leadingSteps, modalStep, trailSteps } from "./steps";

describe("a trilha da importação", () => {
  it("conta o caminho inteiro, e não só a parte do wizard", () => {
    // A pessoa precisa ver quantos passos faltam até o fim — não quantos
    // sobraram dentro do componente que está desenhando a tela.
    expect(TRAIL.sheet).toEqual(["Escolha", "Arquivo", "Resultado"]);
    expect(TRAIL.file).toEqual([
      "Escolha",
      "Informações",
      "Arquivo",
      "Colunas",
      "Revisão",
      "Resultado",
    ]);
  });

  it("entrega ao wizard exatamente os passos que o modal cumpriu", () => {
    // Se a conta divergir, a faixa marca o passo errado como concluído. Com a
    // ficha o modal só faz a escolha: subir o arquivo e conferir o que ele diz
    // são o MESMO passo, e ele já é do wizard.
    expect(leadingSteps("sheet")).toEqual(["Escolha"]);
    expect(leadingSteps("file")).toEqual(["Escolha", "Informações"]);
  });

  it("posiciona a faixa nos passos do próprio modal", () => {
    expect(modalStep(null)).toBe(0);
    expect(modalStep("sheet")).toBe(1);
    expect(modalStep("file")).toBe(1);
  });

  it("mostra a trilha curta antes de a escolha ser feita", () => {
    // Sem caminho escolhido ainda, a faixa precisa de algo para desenhar.
    expect(trailSteps(null).map((s) => s.label)).toEqual(TRAIL.sheet);
  });
});
