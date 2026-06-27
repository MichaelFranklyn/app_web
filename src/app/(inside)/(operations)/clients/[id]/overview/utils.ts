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

export const factoryName = (factory?: { name?: string } | null): string => {
  return factory?.name ?? "—";
};
