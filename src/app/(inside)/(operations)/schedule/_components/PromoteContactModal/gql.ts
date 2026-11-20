import { gql } from "@apollo/client";

export const VISIT_PROMOTION_PREVIEW_QUERY = gql`
  query VisitPromotionPreview($itemId: UUID!, $targetDate: Date) {
    visitPromotionPreview(itemId: $itemId, targetDate: $targetDate) {
      isReachable
      fitsWithExisting
      occupiesWholeDay
      travelMinOneWay
      distanceKm
      displacedCount
      nearby {
        sellerClientFactoryId
        distanceKm
        scoreTotal
        isUrgent
        client {
          id
          razaoSocial
          nomeFantasia
          addressCity
          addressState
        }
        factory {
          id
          razaoSocial
          nomeFantasia
        }
      }
    }
  }
`;

export const PROMOTE_CONTACT_MUTATION = gql`
  mutation PromoteContactToVisit($input: PromoteContactToVisitInput!) {
    promoteContactToVisit(input: $input) {
      status
      message
    }
  }
`;
