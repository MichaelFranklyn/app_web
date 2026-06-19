export const factoryName = (
  factory?: { nomeFantasia?: string | null; razaoSocial?: string | null } | null
): string => {
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial ?? "—";
};

export const formatDate = (date?: string | null): string => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
};

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
