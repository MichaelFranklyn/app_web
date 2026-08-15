import { gql } from "@apollo/client";

/**
 * Perfil do cliente. Fica separada das demais porque quem a pede é o LAYOUT: é
 * ela que decide, uma vez só, se o link ainda vale — as páginas filhas já
 * nascem sabendo que sim.
 */
export const PORTAL_PROFILE = gql`
  query PortalProfile {
    portalProfile {
      data {
        clientName
        clientCity
        clientState
        companyName
        companyLogoUrl
      }
    }
  }
`;

export const PORTAL_PURCHASES = gql`
  query PortalPurchases($input: BaseListInput!, $months: Int) {
    portalPurchaseSummary(months: $months) {
      data {
        totalAmount
        orderCount
        averageTicket
        months {
          month
          amount
          orderCount
        }
        factories {
          factoryName
          amount
          orderCount
        }
      }
    }
    portalOrders(input: $input) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          orderDate
          factoryName
          totalAmount
          ipiAmount
          status
          invoicedAt
          deliveredAt
          estimatedDeliveryDate
        }
      }
    }
  }
`;

export const PORTAL_ORDER = gql`
  query PortalOrder($id: UUID!) {
    portalOrder(id: $id) {
      data {
        id
        orderDate
        factoryName
        totalAmount
        ipiAmount
        status
        invoicedAt
        deliveredAt
        estimatedDeliveryDate
        paymentTermName
        items {
          id
          productName
          sku
          quantity
          unitPrice
          subtotal
          ipiAmount
        }
        installments {
          sequence
          amount
          dueDate
          status
          paidAt
        }
      }
    }
  }
`;

export const PORTAL_STOCK = gql`
  query PortalStock {
    portalStock {
      data {
        productId
        productName
        sku
        factoryName
        lastPurchaseDate
        estimatedStockoutDate
        daysRemaining
        lastReportedAt
      }
    }
  }
`;

export const SUBMIT_PORTAL_STOCK = gql`
  mutation SubmitPortalStock($input: SubmitPortalStockInput!) {
    submitPortalStock(input: $input) {
      status
      message
    }
  }
`;
