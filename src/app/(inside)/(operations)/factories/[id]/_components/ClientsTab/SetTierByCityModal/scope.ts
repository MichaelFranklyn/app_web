import { plural } from "@/utils/format/plural";

import { ClientCity } from "./gql";

export type CityMode = "only" | "except";

/** Chave estável de uma cidade (o select guarda texto). */
export const cityKey = (c: Pick<ClientCity, "city" | "state">) =>
  `${c.city}|${c.state}`;

/** "Fortaleza/CE · 12 clientes" — "Sem cidade" quando o cadastro não tem. */
export const cityLabel = (c: ClientCity) => {
  const place = c.city
    ? c.state
      ? `${c.city}/${c.state}`
      : c.city
    : "Sem cidade";
  return `${place} · ${plural(c.clients, "cliente", "clientes")}`;
};

/**
 * Quantos clientes recebem o nível e quantos ficam como estão — a ação em
 * massa diz o escopo antes de salvar.
 */
export function tierScope(
  cities: ClientCity[],
  selectedKeys: string[],
  mode: CityMode
) {
  const keys = new Set(selectedKeys);
  const total = cities.reduce((sum, c) => sum + c.clients, 0);
  const picked = cities
    .filter((c) => keys.has(cityKey(c)))
    .reduce((sum, c) => sum + c.clients, 0);
  const affected = mode === "only" ? picked : total - picked;
  return { total, affected, untouched: total - affected };
}
