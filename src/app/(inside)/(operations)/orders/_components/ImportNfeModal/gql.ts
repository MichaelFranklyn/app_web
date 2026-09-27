import { gql } from "@apollo/client";

export const PREVIEW_NFE_IMPORT_MUTATION = gql`
  mutation PreviewNfeImport($files: [NfeFileInput!]!) {
    previewNfeImport(files: $files) {
      fileName
      status
      reasons
      orderId
      orderTotal
      invoiceNumber
      issuedAt
      emitterName
      recipientName
      netProductsTotal
      invoiceTotal
      installments {
        number
        dueDate
        amount
      }
    }
  }
`;

export const INVOICE_ORDERS_FROM_NFE_MUTATION = gql`
  mutation InvoiceOrdersFromNfe($files: [NfeInvoiceFileInput!]!) {
    invoiceOrdersFromNfe(files: $files) {
      fileName
      orderId
      isInvoiced
      message
    }
  }
`;
