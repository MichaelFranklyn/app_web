import { gql } from "@apollo/client";

/**
 * O acordo do vendedor logado com cada fábrica.
 *
 * O backend recorta a lista pelo vendedor da sessão (vendedor só enxerga os
 * próprios acessos), então a query não manda filtro nenhum.
 */
export const MY_FACTORY_ACCESSES_QUERY = gql`
  query MyFactoryAccesses($input: BaseListInput!) {
    my_factory_accesses: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          factoryId
          isActive
          sellerCommissionRate
          sellerCommissionBasis
        }
      }
      totalCount
    }
  }
`;

export interface MyFactoryAccess {
  id: string;
  factoryId: string;
  isActive: boolean;
  /** Decimal chega como string. Nulo = não cadastrado (a tela deixa em branco). */
  sellerCommissionRate: string | null;
  /** Nulo = o repasse segue a base da fábrica. */
  sellerCommissionBasis: string | null;
}

export interface MyFactoryAccessesData {
  my_factory_accesses: {
    edges: { node: MyFactoryAccess }[];
    totalCount: number;
  };
}
