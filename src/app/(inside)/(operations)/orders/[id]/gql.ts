import { gql } from "@apollo/client";

export const ORDER_DETAIL_QUERY = gql`
  query OrderDetail($id: UUID!) {
    order(id: $id) {
      status
      code
      message
      data {
        id
        orderDate
        totalAmount
        ipiAmount
        taxAmount
        ipiInOrder
        commissionAmount
        status
        freightType
        fileUrl
        isFileParsed
        notes
        createdAt
        invoicedAt
        paymentTermId
        commissionCalcBasis
        seller {
          id
          name
        }
        client {
          id
          razaoSocial
          nomeFantasia
        }
        factory {
          id
          nomeFantasia
          razaoSocial
        }
        paymentTerm {
          id
          name
          installmentsDays
        }
        availablePaymentTerms {
          id
          name
          installmentsDays
        }
        installments {
          id
          sequence
          amount
          commissionAmount
          dueDate
          status
          paidAt
          isCommissionReceived
          commissionReceivedAt
        }
      }
    }
  }
`;

// Itens do pedido. Mora aqui (pai do detalhe) por ser consumida por 2+ irmãos:
// a tabela de itens (OrderItemsTable) e o botão de PDF (OrderPdfButton).
export const ORDER_ITEMS_QUERY = gql`
  query OrderItems($orderId: UUID!) {
    orderItems(orderId: $orderId) {
      edges {
        node {
          id
          quantity
          unitsTotal
          unitPrice
          discount
          subtotal
          ipiRate
          ipiAmount
          taxAmount
          unitPriceWithTax
          isPromo
          avgShelfDays
          source
          createdAt
          product {
            id
            name
            sku
            saleMultiple
            unitPerPack
            taxes {
              id
              rate
              taxRule {
                id
                name
              }
            }
          }
          tier {
            id
            name
          }
        }
      }
      totalCount
    }
  }
`;

export const INVOICE_ORDER_MUTATION = gql`
  mutation InvoiceOrder($id: UUID!, $input: InvoiceOrderInput!) {
    invoiceOrder(id: $id, input: $input) {
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

export const PAY_ORDER_INSTALLMENT_MUTATION = gql`
  mutation PayOrderInstallment($id: UUID!, $paidAt: Date!) {
    payOrderInstallment(id: $id, paidAt: $paidAt) {
      status
      message
      data {
        id
        status
        paidAt
      }
    }
  }
`;

export const CANCEL_ORDER_INSTALLMENT_MUTATION = gql`
  mutation CancelOrderInstallment($id: UUID!) {
    cancelOrderInstallment(id: $id) {
      status
      message
      data {
        id
        status
      }
    }
  }
`;

export const REVERT_ORDER_INSTALLMENT_MUTATION = gql`
  mutation RevertOrderInstallment($id: UUID!) {
    revertOrderInstallment(id: $id) {
      status
      message
      data {
        id
        status
      }
    }
  }
`;
