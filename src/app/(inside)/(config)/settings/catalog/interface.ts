import { LucideIcon } from "lucide-react";

/**
 * Um catálogo no índice: leva à sua própria rota. Veio do hub de configurações,
 * que deixou de existir — o índice de catálogos é o único lugar que ainda lista
 * destinos em forma de card.
 */
export interface CatalogLink {
  href: string;
  label: string;
  /** Frase concreta: o que a pessoa vai encontrar lá, não o nome técnico. */
  description: string;
  icon: LucideIcon;
}

/** A chave da contagem que este catálogo mostra no card. */
export type CatalogCountKey =
  | "categories"
  | "units"
  | "labels"
  | "segments"
  | "taxRules";

export interface CatalogLinkWithCount extends CatalogLink {
  countKey: CatalogCountKey;
  /** Domínio a que o catálogo pertence — define a cor do card. */
  tone: CatalogTone;
  /** Substantivo do que se conta, para a frase do card. */
  noun: { one: string; many: string };
}

/** Cores dos módulos (ver `--mod-*` em globals.css): produto, cliente, fiscal. */
export type CatalogTone = "products" | "clients" | "tax";

/** Um grupo de catálogos no índice — o que a lista governa. */
export interface CatalogGroup {
  title: string;
  description: string;
  links: CatalogLinkWithCount[];
}

export interface CatalogCountsData {
  categories: { totalCount: number } | null;
  units: { totalCount: number } | null;
  labels: { totalCount: number } | null;
  segments: { totalCount: number } | null;
  taxRules: { totalCount: number } | null;
}

/**
 * Estado de um modal de linha do catálogo. Os de editar e excluir são
 * controlados porque quem os abre é a ação da linha (`CatalogRowActions`):
 * ícone no desktop, item do "⋯" no cartão do celular.
 */
export interface CatalogModalControl {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A rota de cada tela de catálogo — a chave de `CATALOG_PAGES`. */
export type CatalogPageHref =
  | "/settings/catalog/categories"
  | "/settings/catalog/units"
  | "/settings/catalog/labels"
  | "/settings/catalog/segments"
  | "/settings/catalog/tax-rules";

/** O texto fixo de uma tela de catálogo: header e cabeçalho da tabela. */
export interface CatalogPageCopy {
  title: string;
  description: string;
  /** Nome da tabela ("Segmentos cadastrados"). */
  listTitle: string;
  /** Rótulos das colunas, na ordem da tabela. */
  columns: string[];
}
