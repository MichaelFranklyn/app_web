import { Boxes, Package, Percent, Tags } from "lucide-react";
import { CatalogLink } from "./interface";

/**
 * Um card por catálogo, cada um na sua rota. Empilhados na mesma tela as quatro
 * tabelas competiam entre si; separados, cada catálogo tem a página inteira.
 */
export const CATALOG_LINKS: CatalogLink[] = [
  {
    href: "/settings/catalog/categories",
    label: "Categorias de produtos",
    description:
      'Como os produtos são agrupados — ex.: "Tubos e conexões", dentro do segmento Hidráulica.',
    icon: Tags,
  },
  {
    href: "/settings/catalog/units",
    label: "Unidades",
    description: "Como o produto é medido e vendido — saco, metro, quilograma.",
    icon: Boxes,
  },
  {
    href: "/settings/catalog/labels",
    label: "Rótulos de embalagem",
    description:
      "O nome da embalagem em que o produto é entregue — caixa, pallet, fardo.",
    icon: Package,
  },
  {
    href: "/settings/catalog/tax-rules",
    label: "Regras de imposto",
    description:
      "Os impostos que a empresa usa. A alíquota de cada produto entra na tabela de preços.",
    icon: Percent,
  },
];
