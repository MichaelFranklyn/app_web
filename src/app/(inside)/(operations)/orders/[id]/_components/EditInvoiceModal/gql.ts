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
  mutation UninvoiceOrder($id: UUID!, $force: Boolean) {
    uninvoiceOrder(id: $id, force: $force) {
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
