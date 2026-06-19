import { LinkFactoryInput } from "./interface";

export const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

export const normalizeLinkFactoryInput = (
  data: Record<string, unknown>,
  clientId: string
): LinkFactoryInput => {
  const sellerRaw = data.sellerId as { value: string } | string | null;
  const factoryRaw = data.factoryId as { value: string } | string | null;
  const priceTierRaw = data.priceTierId as { value: string } | string | null;
  const priorityRaw = data.priority as { value: string } | string | null;
  const freq = Number(data.visitFrequencyDays);

  const sellerId =
    typeof sellerRaw === "object" && sellerRaw !== null
      ? sellerRaw.value
      : String(sellerRaw ?? "");
  const factoryId =
    typeof factoryRaw === "object" && factoryRaw !== null
      ? factoryRaw.value
      : String(factoryRaw ?? "");
  const priceTierId =
    typeof priceTierRaw === "object" && priceTierRaw !== null
      ? priceTierRaw.value
      : String(priceTierRaw ?? "");
  const priority =
    typeof priorityRaw === "object" && priorityRaw !== null
      ? priorityRaw.value
      : priorityRaw
        ? String(priorityRaw)
        : undefined;

  return {
    clientId,
    sellerId,
    factoryId,
    priceTierId,
    ...(priority ? { priority } : {}),
    ...(!Number.isNaN(freq) && freq > 0 ? { visitFrequencyDays: freq } : {}),
  };
};
