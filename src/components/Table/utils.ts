import { scoreBarColor } from "@/utils/score";

// Fallback de cor da ScoreCell quando `color` não é passado. Escala de urgência
// única do app: score alto = quente/vermelho, baixo = verde. Delega a
// utils/score.ts em vez de repetir os limiares — a duplicação já divergiu uma
// vez, quando as faixas passaram de 61/41/21 para 45/30/12.
export function deriveScoreColor(
  score: number
): "red" | "orange" | "amber" | "green" {
  return scoreBarColor(score);
}
