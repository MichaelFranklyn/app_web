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
        canRequestReplenishment
      }
    }
  }
`;

export const PORTAL_PURCHASE_SUMMARY = gql`
  query PortalPurchaseSummary($months: Int) {
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
        number
        taxAmount
        freightType
        paymentTermName
        sellerName
        sellerEmail
        sellerPhone
        items {
          id
          productName
          sku
          quantity
          unitPrice
          subtotal
          ipiAmount
          ipiRate
          taxAmount
          unitPriceWithTax
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

export const CONFIRM_PORTAL_ORDER_DELIVERY = gql`
  mutation ConfirmPortalOrderDelivery($id: UUID!, $deliveredAt: Date) {
    confirmPortalOrderDelivery(id: $id, deliveredAt: $deliveredAt) {
      status
      message
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

export const PORTAL_REPLENISHMENT = gql`
  query PortalReplenishment {
    portalReplenishment {
      data {
        horizonDays
        items {
          productId
          productName
          sku
          factoryName
          daysRemaining
          lastPurchaseDate
          suggestedQuantity
          saleMultiple
          pendingQuantity
          factoryId
          imageUrl
          estimatedUnitPrice
          estimatedUnitPriceWithTax
          isPromo
          lastUnitPrice
        }
      }
    }
  }
`;

/**
 * O catálogo do orçamento: uma página por vez, de UMA fábrica, com busca.
 * Cada linha traz o preço estimado e o que o cliente pagou da última vez.
 */
export const PORTAL_CATALOG = gql`
  query PortalCatalog($search: String, $page: Int, $factoryId: UUID) {
    portalCatalog(search: $search, page: $page, factoryId: $factoryId) {
      data {
        total
        page
        pageSize
        factoryId
        factories {
          factoryId
          name
        }
        items {
          productId
          productName
          sku
          factoryName
          suggestedQuantity
          saleMultiple
          pendingQuantity
          lastPurchaseDate
          estimatedUnitPrice
          estimatedUnitPriceWithTax
          isPromo
          lastUnitPrice
          factoryId
          imageUrl
        }
      }
    }
  }
`;

export const REQUEST_PORTAL_QUOTE = gql`
  mutation RequestPortalQuote($input: RequestPortalQuoteInput!) {
    requestPortalQuote(input: $input) {
      status
      message
      data {
        orderIds
      }
    }
  }
`;

const PORTAL_SENT_ORDER_FIELDS = `
  id
  number
  createdAt
  factoryName
  status
  totalAmount
  ipiAmount
  taxAmount
  itemCount
  seenBySellerAt
  clientRequestNote
  sellerName
  sellerEmail
  sellerPhone
`;

/**
 * A lista "Pedidos": os pedidos feitos (de qualquer origem) e os orçamentos que
 * o cliente pediu pelo portal, do mais novo ao mais antigo. `kind` filtra.
 */
export const PORTAL_SENT_ORDERS = gql`
  query PortalSentOrders(
    $page: Int
    $pageSize: Int
    $kind: PortalOrderKind
    $search: String
  ) {
    portalSentOrders(
      page: $page
      pageSize: $pageSize
      kind: $kind
      search: $search
    ) {
      total
      page
      limit
      data {
        ${PORTAL_SENT_ORDER_FIELDS}
      }
    }
  }
`;

/** O placar da lista de pedidos: quantos aguardam, foram vistos e viraram pedido. */
export const PORTAL_SENT_ORDERS_SUMMARY = gql`
  query PortalSentOrdersSummary {
    portalSentOrdersSummary {
      data {
        total
        waiting
        seen
        ordered
        cancelled
      }
    }
  }
`;

/** Um pedido enviado, com os itens — a tela que abre logo depois do envio. */
export const PORTAL_SENT_ORDER = gql`
  query PortalSentOrder($id: UUID!) {
    portalSentOrder(id: $id) {
      data {
        ${PORTAL_SENT_ORDER_FIELDS}
        items {
          id
          productName
          sku
          quantity
          unitPrice
          subtotal
          ipiAmount
          ipiRate
          taxAmount
          unitPriceWithTax
        }
      }
    }
  }
`;
