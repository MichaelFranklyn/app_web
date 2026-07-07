// Fallback de cor da ScoreCell quando `color` não é passado. Escala de urgência
// única do app: score alto = quente/vermelho, baixo = verde. Mesmos limiares e
// cores de utils/score.ts (scoreLevel) para não divergir.
export function deriveScoreColor(
  score: number
): "red" | "orange" | "amber" | "green" {
  if (score >= 61) return "red";
  if (score >= 41) return "orange";
  if (score >= 21) return "amber";
  return "green";
}
