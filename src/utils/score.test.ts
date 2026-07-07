import { describe, expect, it } from "vitest";
import {
  explainScore,
  scoreBarColor,
  scoreLevel,
  ScoreDimensions,
} from "./score";

const dims = (over: Partial<ScoreDimensions> = {}): ScoreDimensions => ({
  scoreTotal: "0",
  scoreUrgency: "0",
  scorePriority: "0",
  scoreFrequency: "0",
  scorePotential: "0",
  scoreRecency: "0",
  ...over,
});

describe("scoreLevel (score alto = urgente, igual ao backend)", () => {
  it("score alto é urgente (vermelho), baixo é tranquilo (verde)", () => {
    expect(scoreLevel(80).tone).toBe("red");
    expect(scoreLevel(80).label).toBe("Urgente");
    expect(scoreLevel(50).tone).toBe("orange");
    expect(scoreLevel(30).tone).toBe("amber");
    expect(scoreLevel(10).tone).toBe("green");
    expect(scoreLevel(10).label).toBe("Tranquilo");
  });
});

describe("scoreBarColor (escala de urgência, alinhada ao nível)", () => {
  it("cobre as 4 faixas, incluindo laranja, sem divergir do scoreLevel", () => {
    expect(scoreBarColor(80)).toBe("red");
    expect(scoreBarColor(50)).toBe("orange");
    expect(scoreBarColor(30)).toBe("amber");
    expect(scoreBarColor(10)).toBe("green");
    expect(scoreBarColor(50)).toBe(scoreLevel(50).tone);
  });
});

describe("explainScore", () => {
  it("lista só os fatores que contribuem, do maior para o menor", () => {
    const { reasons } = explainScore(
      dims({
        scoreTotal: "130",
        scoreUrgency: "100",
        scoreRecency: "20",
        scorePotential: "0",
      })
    );
    expect(reasons.map((r) => r.key)).toEqual(["scoreUrgency", "scoreRecency"]);
    expect(reasons[0].value).toBe(100);
  });

  it("urgência e frequência trazem dica acionável", () => {
    const { reasons } = explainScore(
      dims({ scoreUrgency: "100", scoreFrequency: "40" })
    );
    expect(reasons.every((r) => r.tip)).toBe(true);
  });

  it("potencial é informativo (sem dica)", () => {
    const { reasons } = explainScore(dims({ scorePotential: "30" }));
    expect(reasons[0].key).toBe("scorePotential");
    expect(reasons[0].tip).toBeNull();
  });

  it("sem fatores quando tudo é zero", () => {
    expect(explainScore(dims()).reasons).toHaveLength(0);
  });

  it("expõe o total e o nível", () => {
    const exp = explainScore(dims({ scoreTotal: "75" }));
    expect(exp.total).toBe(75);
    expect(exp.level.tone).toBe("red");
  });
});
