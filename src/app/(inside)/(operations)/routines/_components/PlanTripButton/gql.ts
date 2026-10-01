import { gql } from "@apollo/client";

export const TRIP_REGION_OPTIONS_QUERY = gql`
  query TripRegionOptions($sellerId: UUID) {
    trip_region_options: tripRegionOptions(sellerId: $sellerId) {
      key
      city
      state
      clientCount
      locatedCount
    }
  }
`;

// A mesma mutation serve a prévia (`dryRun`) e a gravação: as duas precisam
// devolver exatamente o mesmo plano, senão a pessoa confirmaria uma coisa e
// receberia outra.
export const PLAN_SELLER_TRIP_MUTATION = gql`
  mutation PlanSellerTrip($input: PlanSellerTripInput!) {
    planSellerTrip(input: $input) {
      status
      message
      data {
        trip {
          id
        }
        days {
          date
          city
          visits {
            clientId
            clientName
            city
            score
          }
        }
        leftOut {
          clientId
          clientName
          city
          score
        }
        ungeocoded {
          clientId
          clientName
          city
          score
        }
        alreadyScheduled {
          clientId
          clientName
          city
          score
        }
        manualConflicts
        skippedDates
        regionClientCount
        unavailableCount
      }
    }
  }
`;
