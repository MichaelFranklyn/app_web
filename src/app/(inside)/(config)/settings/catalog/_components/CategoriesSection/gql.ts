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

export const CATEGORIES_LIST_FIRST = 50;

/**
 * Variáveis canônicas da listagem de categorias da empresa.
 *
 * Categorias são catálogo por empresa (escopo aplicado no back via contexto),
 * por isso não enviamos filtro. Usado tanto pela query quanto pelo `update`
 * otimista do cache, garantindo que ambos apontem para a MESMA entrada de cache.
 */
export const buildCategoriesVariables = () => ({
  input: { first: CATEGORIES_LIST_FIRST },
});

/**
 * Descritor de refetch da listagem — rede de segurança após as mutations
 * otimistas (sincroniza o cache com o servidor).
 */
export const categoriesRefetchQueries = () => [
  {
    query: PRODUCT_CATEGORIES_QUERY,
    variables: buildCategoriesVariables(),
  },
];

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
