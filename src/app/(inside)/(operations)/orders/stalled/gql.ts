import { gql } from "@apollo/client";

const STALLED_ORDER_FIELDS = `
  id
  orderDate
  invoicedAt
  invoiceNumber
  deliveryEstimateDays
  totalAmount
  status
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
    nickname
    razaoSocial
  }
`;

/**
 * O mesmo recorte dos cartões "entrega não confirmada" e "confirmado sem
 * faturar" de /insights — vendedor recebe só os dele pelo backend.
 */
export const STALLED_ORDERS_QUERY = gql`
  query StalledOrders {
    stalledOrders {
      defaultDeliveryDays
      awaitingDelivery {
        ${STALLED_ORDER_FIELDS}
      }
      awaitingInvoice {
        ${STALLED_ORDER_FIELDS}
      }
    }
  }
`;
