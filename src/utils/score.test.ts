import { describe, expect, it } from "vitest";
import {
  explainScore,
  isUrgent,
  scoreBarColor,
  scoreLevel,
  ScoreDimensions,
  URGENT_THRESHOLD,
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
    expect(scoreLevel(35).tone).toBe("orange");
    expect(scoreLevel(20).tone).toBe("amber");
    expect(scoreLevel(5).tone).toBe("green");
    expect(scoreLevel(5).label).toBe("Tranquilo");
  });

  it("respeita as fronteiras exatas das faixas", () => {
    expect(scoreLevel(45).label).toBe("Urgente");
    expect(scoreLevel(44.99).label).toBe("Atenção");
    expect(scoreLevel(30).label).toBe("Atenção");
    expect(scoreLevel(29.99).label).toBe("Acompanhar");
    expect(scoreLevel(12).label).toBe("Acompanhar");
    expect(scoreLevel(11.99).label).toBe("Tranquilo");
  });

  it("um cliente com ruptura de 15+ dias cai em Urgente", () => {
    // Cenário canônico do backend: urgência 100 sozinha → 57,83.
    expect(scoreLevel(57.83).label).toBe("Urgente");
  });

  it("um cliente sem ruptura, mesmo com prioridade alta e ciclo estourado, fica em Atenção", () => {
    // Cenário canônico do backend: sem urgência → 35,83. É o caso que fazia a
    // tag mostrar "Urgente" para quem não tinha estoque acabando.
    expect(scoreLevel(35.83).label).toBe("Atenção");
  });
});

describe("isUrgent", () => {
  it("usa o mesmo limiar da faixa vermelha", () => {
    expect(isUrgent(URGENT_THRESHOLD)).toBe(true);
    expect(isUrgent(URGENT_THRESHOLD - 0.01)).toBe(false);
    expect(isUrgent(URGENT_THRESHOLD)).toBe(
      scoreLevel(URGENT_THRESHOLD).label === "Urgente"
    );
  });
});

describe("scoreBarColor (escala de urgência, alinhada ao nível)", () => {
  it("cobre as 4 faixas, incluindo laranja, sem divergir do scoreLevel", () => {
    expect(scoreBarColor(80)).toBe("red");
    expect(scoreBarColor(35)).toBe("orange");
    expect(scoreBarColor(20)).toBe("amber");
    expect(scoreBarColor(5)).toBe("green");
    expect(scoreBarColor(35)).toBe(scoreLevel(35).tone);
  });
});

describe("explainScore", () => {
  it("lista só os fatores que contribuem, do que mais empurrou o total ao que menos", () => {
    const { reasons } = explainScore(
      dims({
        scoreTotal: "65",
        scoreUrgency: "100",
        scoreRecency: "20",
        scorePotential: "0",
      })
    );
    expect(reasons.map((r) => r.key)).toEqual(["scoreUrgency", "scoreRecency"]);
    expect(reasons[0].value).toBe(100);
  });

  it("ordena por contribuição real, não pelo valor bruto", () => {
    // Prioridade tem valor bruto maior (50 > 40), mas contribui menos: seu teto
    // é 50 com peso 0.10 (=10 pts), contra teto 40 com peso 0.20 (=20 pts).
    const { reasons } = explainScore(
      dims({ scorePriority: "50", scoreFrequency: "40" })
    );
    expect(reasons.map((r) => r.key)).toEqual([
      "scoreFrequency",
      "scorePriority",
    ]);
    expect(reasons[0].contribution).toBeCloseTo(20);
    expect(reasons[1].contribution).toBeCloseTo(10);
  });

  it("as contribuições somam o total quando todas as dimensões estão no teto", () => {
    const { reasons } = explainScore(
      dims({
        scoreTotal: "100",
        scoreUrgency: "100",
        scoreFrequency: "40",
        scorePriority: "50",
        scoreRecency: "20",
        scorePotential: "30",
      })
    );
    const soma = reasons.reduce((acc, r) => acc + r.contribution, 0);
    expect(soma).toBeCloseTo(100);
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
