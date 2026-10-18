import { gql } from "@apollo/client";

export const VISIT_PLAYBOOK = gql`
  query VisitPlaybook($itemId: UUID!) {
    visitPlaybook(itemId: $itemId) {
      companyClientId
      factories {
        sellerClientFactoryId
        isFocus
        isNegative
        moreOffersCount
        factory {
          id
          razaoSocial
          nomeFantasia
          nickname
        }
        offers {
          productId
          status
          orderCount
          factoryOrderCount
          daysSinceLast
          lastUnits
          isPromo
          product {
            id
            name
          }
        }
        promotion {
          endsOn
          productCount
          products {
            productId
            discountPercent
            isBoughtByClient
            product {
              id
              name
            }
          }
        }
        portalRequest {
          orderId
          requestedOn
        }
      }
    }
  }
`;
