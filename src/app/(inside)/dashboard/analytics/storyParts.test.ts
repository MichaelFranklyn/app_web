import { describe, expect, it } from "vitest";

import { ANALYTICS_STORY, storyStep } from "./storyParts";

describe("ANALYTICS_STORY", () => {
  it("tem ids únicos — cada âncora leva a uma parte só", () => {
    const ids = ANALYTICS_STORY.map((part) => part.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda parte tem rótulo e pergunta preenchidos", () => {
    for (const part of ANALYTICS_STORY) {
      expect(part.label.trim()).not.toBe("");
      expect(part.question.trim()).not.toBe("");
    }
  });
});

describe("storyStep", () => {
  it("numera a partir de 1 e conta o total da história", () => {
    const total = ANALYTICS_STORY.length;
    expect(storyStep(ANALYTICS_STORY[0].id)).toBe(`Parte 1 de ${total}`);
    expect(storyStep(ANALYTICS_STORY[total - 1].id)).toBe(
      `Parte ${total} de ${total}`
    );
  });

  it("id desconhecido não inventa posição", () => {
    // Melhor um cabeçalho sem a linha de posição do que "Parte 0 de 7".
    expect(storyStep("nao-existe")).toBe("");
  });
});
