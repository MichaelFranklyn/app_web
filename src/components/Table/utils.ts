export function deriveScoreColor(
  score: number
): "red" | "amber" | "blue" | "green" {
  if (score >= 71) return "red";
  if (score >= 41) return "amber";
  if (score >= 21) return "blue";
  return "green";
}
