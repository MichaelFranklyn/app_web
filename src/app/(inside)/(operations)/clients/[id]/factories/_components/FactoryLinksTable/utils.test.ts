import { describe, expect, it } from "vitest";

import { PRIORITY_OPTIONS, priorityColor, priorityLabel } from "./utils";

describe("prioridade do vínculo", () => {
  it("oferece só o vocabulário que o score entende", () => {
    // O score pontua a dimensão priority por esses termos; mandar "high" fazia
    // a dimensão cair sempre em 0 e o score não mexer.
    expect(PRIORITY_OPTIONS.map((o) => o.value)).toEqual([
      "alta",
      "media",
      "baixa",
    ]);
  });

  it("dá a cor do grau de atenção", () => {
    expect(priorityColor("alta")).toBe("red");
    expect(priorityColor("media")).toBe("amber");
    expect(priorityColor("baixa")).toBe("green");
  });

  it("ainda lê os vínculos salvos antes do alinhamento de vocabulário", () => {
    // Vínculos antigos gravaram "high"/"medium"/"low" (e "média" com acento):
    // eles continuam aparecendo com a cor e o rótulo certos.
    expect(priorityColor("HIGH")).toBe("red");
    expect(priorityColor("média")).toBe("amber");
    expect(priorityLabel("low")).toBe("Baixa");
  });

  it("sem prioridade, a linha não inventa uma", () => {
    expect(priorityLabel(null)).toBe("—");
    expect(priorityColor(null)).toBe("blue");
  });

  it("valor desconhecido aparece como veio, em vez de sumir", () => {
    expect(priorityLabel("urgentissima")).toBe("urgentissima");
  });
});
