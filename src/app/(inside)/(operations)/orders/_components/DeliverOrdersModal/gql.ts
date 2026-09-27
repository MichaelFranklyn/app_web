import { gql } from "@apollo/client";

// Sem `deliveredAt`, cada pedido recebe a própria data prevista.
export const MARK_ORDERS_DELIVERED_MUTATION = gql`
  mutation MarkOrdersDelivered($ids: [UUID!]!, $deliveredAt: Date) {
    markOrdersDelivered(ids: $ids, deliveredAt: $deliveredAt) {
      delivered
      stockedProducts
      failures {
        orderId
        message
      }
    }
  }
`;
