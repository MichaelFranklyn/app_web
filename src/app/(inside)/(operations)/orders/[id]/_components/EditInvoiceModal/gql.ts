import { gql } from "@apollo/client";

export const REVISE_ORDER_INVOICE_MUTATION = gql`
  mutation ReviseOrderInvoice($id: UUID!, $input: ReviseOrderInvoiceInput!) {
    reviseOrderInvoice(id: $id, input: $input) {
      status
      message
      data {
        id
        invoicedAt
        deliveredAt
        deliveryEstimateDays
        paymentTermId
      }
    }
  }
`;

export const UNINVOICE_ORDER_MUTATION = gql`
  mutation UninvoiceOrder($id: UUID!, $force: Boolean, $reason: String) {
    uninvoiceOrder(id: $id, force: $force, reason: $reason) {
      status
      message
      data {
        id
        status
        invoicedAt
      }
    }
  }
`;
