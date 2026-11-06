import { gql } from "@apollo/client";

/**
 * Última compra do cliente em cada par fábrica × vendedor. O backend devolve o
 * PAR; a tela agrupa por uma ponta ou pela outra (ver `utils.ts`).
 */
export const CLIENT_LAST_PURCHASES_QUERY = gql`
  query ClientLastPurchases($id: UUID!) {
    companyClient(id: $id) {
      data {
        id
        lastPurchases {
          factoryId
          factory {
            id
            nickname
            nomeFantasia
            razaoSocial
          }
          sellerId
          seller {
            id
            name
          }
          lastOrderId
          lastOrderDate
          lastOrderAmount
          lastOrderStatus
          orderCount
          totalAmount
        }
      }
    }
  }
`;
