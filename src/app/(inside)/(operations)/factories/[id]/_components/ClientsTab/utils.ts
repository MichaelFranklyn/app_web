// Valores no vocabulário canônico do backend (enum ClientPriority: alta/media/
// baixa). O score só pontua a prioridade nesses termos — mandar "high"/"medium"/
// "low" fazia a dimensão priority cair sempre em 0 e o score não mexer.
export const PRIORITY_OPTIONS = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

type BadgeColor = "red" | "amber" | "subtle" | "neutral";

const PRIORITY_META: Record<string, { label: string; color: BadgeColor }> = {
  alta: { label: "Alta", color: "red" },
  media: { label: "Média", color: "amber" },
  baixa: { label: "Baixa", color: "subtle" },
  // Aliases legados: vínculos salvos antes do alinhamento de vocabulário.
  high: { label: "Alta", color: "red" },
  medium: { label: "Média", color: "amber" },
  low: { label: "Baixa", color: "subtle" },
};

export const priorityMeta = (
  priority: string | null
): { label: string; color: BadgeColor } =>
  (priority && PRIORITY_META[priority]) || { label: "—", color: "neutral" };
