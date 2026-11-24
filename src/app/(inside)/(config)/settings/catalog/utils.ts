import { Boxes, Package, Percent, Store, Tags } from "lucide-react";
import {
  CatalogGroup,
  CatalogLinkWithCount,
  CatalogPageCopy,
  CatalogPageHref,
  CatalogTone,
} from "./interface";
import { plural } from "@/utils/format/plural";

/**
 * Os catálogos agrupados por ASSUNTO, e não numa grade de cinco cards iguais.
 *
 * Os cinco respondem a perguntas diferentes: três descrevem o produto, um
 * descreve o cliente e um é regra fiscal. Empilhados sem separação, quem vinha
 * cadastrar segmento de cliente abria "Categorias de produtos" — os dois têm a
 * palavra "segmento" na descrição. O agrupamento é o que desfaz isso antes da
 * leitura.
 */
export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    title: "Produtos",
    description: "Como o produto é classificado, medido e embalado.",
    links: [
      {
        href: "/settings/catalog/categories",
        label: "Categorias de produtos",
        description:
          'Como os produtos são agrupados — ex.: "Tubos e conexões", dentro do segmento Hidráulica.',
        icon: Tags,
        countKey: "categories",
        tone: "products",
        noun: { one: "categoria", many: "categorias" },
      },
      {
        href: "/settings/catalog/units",
        label: "Unidades",
        description:
          "Como o produto é medido e vendido — saco, metro, quilograma.",
        icon: Boxes,
        countKey: "units",
        tone: "products",
        noun: { one: "unidade", many: "unidades" },
      },
      {
        href: "/settings/catalog/labels",
        label: "Rótulos de embalagem",
        description:
          "O nome da embalagem em que o produto é entregue — caixa, pallet, fardo.",
        icon: Package,
        countKey: "labels",
        tone: "products",
        noun: { one: "rótulo", many: "rótulos" },
      },
    ],
  },
  {
    title: "Clientes",
    description: "Como a carteira é dividida por tipo de negócio.",
    links: [
      {
        href: "/settings/catalog/segments",
        label: "Segmentos de clientes",
        description:
          "O ramo de atividade do cliente — farmácia, mercearia, atacado. Filtra a carteira e agrupa os números por tipo de negócio.",
        icon: Store,
        countKey: "segments",
        tone: "clients",
        noun: { one: "segmento", many: "segmentos" },
      },
    ],
  },
  {
    title: "Fiscal",
    description: "O que entra no cálculo do preço.",
    links: [
      {
        href: "/settings/catalog/tax-rules",
        label: "Regras de imposto",
        description:
          "Os impostos que a empresa usa. A alíquota de cada produto entra na tabela de preços.",
        icon: Percent,
        countKey: "taxRules",
        tone: "tax",
        noun: { one: "regra", many: "regras" },
      },
    ],
  },
];

/** Todos os catálogos numa lista só — para quem precisa varrer sem os grupos. */
export const CATALOG_LINKS: CatalogLinkWithCount[] = CATALOG_GROUPS.flatMap(
  (group) => group.links
);

/**
 * A cor de cada domínio, dos tokens de módulo.
 *
 * Cor de MÓDULO, não de interação: âmbar continua reservado para o que se
 * clica, e é por isso que os cinco cards deixaram de ser todos âmbar — a cor
 * dizia "aja aqui" cinco vezes e não distinguia nada.
 */
export const CATALOG_TONE: Record<CatalogTone, "purple" | "green" | "orange"> =
  {
    // Mesmos hex de --mod-products / --mod-clients / --mod-factory.
    products: "purple",
    clients: "green",
    tax: "orange",
  };

/** "12 categorias" / "1 categoria" / "nada cadastrado ainda". */
export const countLabel = (
  count: number | null,
  noun: { one: string; many: string }
): string => {
  if (count === null) return "";
  if (count === 0) return "nada cadastrado ainda";
  return plural(count, noun.one, noun.many);
};

/**
 * O texto fixo de cada tela de catálogo, num lugar só: o header da tela
 * (`CatalogSubHeader`) e o esqueleto do `loading.tsx` leem daqui, então o
 * esqueleto não fica com título ou colunas diferentes da tela que vai chegar.
 */
export const CATALOG_PAGES: Record<CatalogPageHref, CatalogPageCopy> = {
  "/settings/catalog/categories": {
    title: "Categorias de produtos",
    description:
      "Agrupam produtos parecidos dentro de um segmento. É o que organiza o catálogo e os filtros na hora de montar um pedido.",
    listTitle: "Categorias cadastradas",
    columns: ["Nome", "Segmento", "Ações"],
  },
  "/settings/catalog/units": {
    title: "Unidades",
    description:
      "Como o produto é medido e vendido. Cada produto escolhe uma unidade base — saco, metro, quilograma, unidade.",
    listTitle: "Unidades cadastradas",
    columns: ["Nome", "Ações"],
  },
  "/settings/catalog/labels": {
    title: "Rótulos de embalagem",
    description:
      "O nome da embalagem em que o produto é entregue. Junto com as unidades por embalagem, define como o produto é comercializado (ex.: 12 sacos por pallet).",
    listTitle: "Rótulos cadastrados",
    columns: ["Nome", "Ações"],
  },
  "/settings/catalog/segments": {
    title: "Segmentos de clientes",
    description:
      "O ramo de atividade de cada cliente — farmácia, mercearia, atacado. Serve para filtrar a carteira e comparar os números por tipo de negócio.",
    listTitle: "Segmentos cadastrados",
    columns: ["Nome", "Ações"],
  },
  "/settings/catalog/tax-rules": {
    title: "Regras de imposto",
    description:
      "O catálogo de impostos da empresa. A alíquota de cada produto é definida depois, na tabela de preços.",
    listTitle: "Regras cadastradas",
    columns: ["Nome", "Ações"],
  },
};
