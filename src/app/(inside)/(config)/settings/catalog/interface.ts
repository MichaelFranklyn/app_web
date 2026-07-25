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
