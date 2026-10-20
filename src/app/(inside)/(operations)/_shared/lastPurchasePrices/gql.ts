import { gql } from "@apollo/client";

export const CLIENT_PRODUCT_PURCHASE_PRICES_QUERY = gql`
  query ClientProductPurchasePrices(
    $clientId: UUID!
    $factoryId: UUID!
    $productIds: [UUID!]!
    $excludeOrderId: UUID
  ) {
    clientProductPurchasePrices(
      clientId: $clientId
      factoryId: $factoryId
      productIds: $productIds
      excludeOrderId: $excludeOrderId
    ) {
      productId
      purchases {
        orderId
        orderDate
        unitPrice
        netUnitPrice
        units
        isPromo
        tierName
      }
    }
  }
`;
