export const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

type BadgeColor = "red" | "amber" | "subtle" | "neutral";

const PRIORITY_META: Record<string, { label: string; color: BadgeColor }> = {
  high: { label: "Alta", color: "red" },
  medium: { label: "Média", color: "amber" },
  low: { label: "Baixa", color: "subtle" },
};

export const priorityMeta = (
  priority: string | null
): { label: string; color: BadgeColor } =>
  (priority && PRIORITY_META[priority]) || { label: "—", color: "neutral" };
