import { gql } from "@apollo/client";

export interface ProductCategoryRow {
  __typename?: "ProductCategoryType";
  id: string;
  name: string;
  segment: string;
}

export const PRODUCT_CATEGORIES_QUERY = gql`
  query SettingsProductCategories($input: BaseListInput!) {
    product_categories: productCategories(input: $input) {
      edges {
        node {
          id
          name
          segment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

/**
 * Escopo canônico da listagem de categorias da empresa.
 *
 * Categorias são catálogo por empresa (escopo aplicado no back via contexto),
 * por isso não enviamos filtro.
 *
 * Sem `first`: quem consome é o `useCompleteList`, que traz o catálogo inteiro
 * e rebusca pelo total quando a primeira página não dá conta. O teto de 50 que
 * havia aqui era o menor dos cinco catálogos, justamente no que mais cresce —
 * categoria escondida é procurada, recriada e vira duplicata.
 *
 * Havia também um `categoriesRefetchQueries()` logo abaixo, descrevendo o
 * refetch da listagem para as mutations. Nenhuma mutation o importava: o
 * `onDone` de cada modal chama o `refetch` da própria seção. Removido — um
 * descritor de cache que ninguém usa envelhece sem que nada acuse.
 */
export const CATEGORIES_LIST_INPUT = { order: { by: "name", dir: "asc" } };

export interface ProductCategoriesData {
  product_categories: {
    __typename?: string;
    edges: { __typename?: string; node: ProductCategoryRow }[];
    pageInfo?: {
      __typename?: string;
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}
