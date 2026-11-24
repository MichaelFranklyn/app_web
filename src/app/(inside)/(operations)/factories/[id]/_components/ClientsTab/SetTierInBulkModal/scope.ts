import { plural } from "@/utils/format/plural";

import { ClientCity, ClientGroup, ClientGroupBy } from "./gql";

export type BulkMode = "only" | "except";

/** Um grupo escolhível — cidade, segmento ou rede — já com chave e rótulo. */
export interface BulkGroup {
  key: string;
  label: string;
  clients: number;
}

/** Chave do grupo "sem segmento/sem rede" (o back o recebe como `includeUngrouped`). */
export const UNGROUPED_KEY = "__none__";

/** Chave estável de uma cidade (o select guarda texto). */
export const cityKey = (c: Pick<ClientCity, "city" | "state">) =>
  `${c.city}|${c.state}`;

const withCount = (name: string, clients: number) =>
  `${name} · ${plural(clients, "cliente", "clientes")}`;

/** "Fortaleza/CE · 12 clientes" — "Sem cidade" quando o cadastro não tem. */
export const cityLabel = (c: ClientCity) => {
  const place = c.city
    ? c.state
      ? `${c.city}/${c.state}`
      : c.city
    : "Sem cidade";
  return withCount(place, c.clients);
};

/** Como cada critério se chama na tela. */
export const CRITERIA: Record<
  ClientGroupBy,
  {
    label: string;
    field: string;
    placeholder: string;
    loading: string;
    ungrouped: string;
    only: string;
    except: string;
    onlyHint: string;
    exceptHint: string;
    source: string;
  }
> = {
  CITY: {
    label: "Cidade",
    field: "Cidades",
    placeholder: "Escolha as cidades",
    loading: "Carregando cidades…",
    ungrouped: "Sem cidade",
    only: "Clientes destas cidades",
    except: "Todos, menos destas cidades",
    onlyHint: "Ex.: a capital. Só quem está nas cidades escolhidas muda.",
    exceptHint: "Ex.: o interior. Escolha a capital e todo o resto muda.",
    source: "A cidade vem do endereço do cliente.",
  },
  SEGMENT: {
    label: "Segmento",
    field: "Segmentos",
    placeholder: "Escolha os segmentos",
    loading: "Carregando segmentos…",
    ungrouped: "Sem segmento",
    only: "Clientes destes segmentos",
    except: "Todos, menos destes segmentos",
    onlyHint: "Ex.: Distribuidor. Só quem é dos segmentos escolhidos muda.",
    exceptHint: "Ex.: escolha Distribuidor e todo o resto vai para o Varejo.",
    source:
      "O segmento é o do cadastro do cliente (Distribuidor, Atacado, Varejo…).",
  },
  NETWORK: {
    label: "Rede",
    field: "Redes",
    placeholder: "Escolha as redes",
    loading: "Carregando redes…",
    ungrouped: "Sem rede",
    only: "Clientes destas redes",
    except: "Todos, menos destas redes",
    onlyHint: "Ex.: uma rede de lojas. Só as lojas dela mudam.",
    exceptHint: "Escolha as redes e todo o resto muda.",
    source: "A rede é a do cadastro do cliente.",
  },
};

export const citiesToGroups = (cities: ClientCity[]): BulkGroup[] =>
  cities.map((c) => ({
    key: cityKey(c),
    label: cityLabel(c),
    clients: c.clients,
  }));

export const groupsToOptions = (
  groups: ClientGroup[],
  by: ClientGroupBy
): BulkGroup[] =>
  groups.map((g) => ({
    key: g.id ?? UNGROUPED_KEY,
    label: withCount(g.id ? g.name : CRITERIA[by].ungrouped, g.clients),
    clients: g.clients,
  }));

/**
 * Quantos clientes recebem o nível e quantos ficam como estão — a ação em
 * massa diz o escopo antes de salvar.
 */
export function tierScope(
  groups: Pick<BulkGroup, "key" | "clients">[],
  selectedKeys: string[],
  mode: BulkMode
) {
  const keys = new Set(selectedKeys);
  const total = groups.reduce((sum, g) => sum + g.clients, 0);
  const picked = groups
    .filter((g) => keys.has(g.key))
    .reduce((sum, g) => sum + g.clients, 0);
  const affected = mode === "only" ? picked : total - picked;
  return { total, affected, untouched: total - affected };
}
