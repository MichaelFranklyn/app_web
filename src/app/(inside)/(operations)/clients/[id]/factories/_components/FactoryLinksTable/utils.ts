// Valores no vocabulário canônico do backend (enum ClientPriority: alta/media/
// baixa). O score só pontua a prioridade nesses termos — mandar "high"/"medium"/
// "low" fazia a dimensão priority cair sempre em 0 e o score não mexer.
export const PRIORITY_OPTIONS = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

export const priorityColor = (
  priority?: string | null
): "red" | "amber" | "green" | "blue" => {
  switch (priority?.toLowerCase()) {
    case "alta":
    case "high":
      return "red";
    case "média":
    case "medium":
      return "amber";
    case "baixa":
    case "low":
      return "green";
    default:
      return "blue";
  }
};

export const priorityLabel = (priority?: string | null): string => {
  if (!priority) return "—";
  const map: Record<string, string> = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
    // Aliases legados: vínculos salvos antes do alinhamento de vocabulário.
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };
  return map[priority.toLowerCase()] ?? priority;
};
