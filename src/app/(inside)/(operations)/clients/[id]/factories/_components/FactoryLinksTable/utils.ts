export const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
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
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };
  return map[priority.toLowerCase()] ?? priority;
};
