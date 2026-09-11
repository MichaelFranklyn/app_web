import { gql } from "@apollo/client";

/**
 * Uma linha da tabela de acesso de vendedores.
 *
 * Fica aqui, no pai, porque o `AddSellerAccessModal` monta a linha nova com o
 * que a mutation devolve — o tipo é o contrato entre a tabela e o modal.
 */
export interface SellerAccess {
  id: string;
  isActive: boolean;
  createdAt: string;
  /** Percentual do PEDIDO que fica com o vendedor; nulo = a comissão inteira. */
  sellerCommissionRate: string | number | null;
  /** Quando o escritório repassa; nulo = mesma base da fábrica. */
  sellerCommissionBasis: string | null;
  seller: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  grantedByUser: { id: string; name: string } | null;
}

export const FACTORY_SELLER_ACCESSES_QUERY = gql`
  query FactorySellerAccesses($input: BaseListInput!) {
    factory_seller_accesses: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          isActive
          createdAt
          sellerCommissionRate
          sellerCommissionBasis
          seller {
            id
            name
            isActive
          }
          grantedByUser {
            id
            name
          }
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
