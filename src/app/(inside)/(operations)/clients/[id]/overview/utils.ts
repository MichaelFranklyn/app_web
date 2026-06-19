import { ClientData } from "./interface";

export const buildAddress = (client: ClientData): string => {
  const parts = [
    client.addressStreet,
    client.addressNumber,
    client.addressComplement,
    client.addressCity,
    client.addressState,
    client.addressZip,
  ].filter(Boolean);

  return parts.join(", ") || "—";
};

export const formatDate = (date?: string | null): string => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-US");
  } catch {
    return "—";
  }
};

export const priorityColor = (
  priority?: string | null
): "red" | "amber" | "green" | "blue" => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "red";
    case "medium":
      return "amber";
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

export const factoryName = (factory?: { name?: string } | null): string => {
  return factory?.name ?? "—";
};
