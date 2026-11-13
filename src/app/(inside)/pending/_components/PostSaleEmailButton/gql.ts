import { gql } from "@apollo/client";

/** Pergunta ao cliente, por email, se o pedido faturado chegou bem. */
export const SEND_POST_SALE_EMAIL_MUTATION = gql`
  mutation SendPostSaleEmail($id: UUID!) {
    sendPostSaleEmail(id: $id) {
      status
      message
    }
  }
`;
