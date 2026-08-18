import { gql } from "@apollo/client";

export const OVERDUE_VISITS_QUERY = gql`
  query OverdueVisits($sellerId: UUID) {
    overdueVisits(sellerId: $sellerId) {
      id
      plannedOrder
      contactType
      status
      day {
        id
        date
      }
      clientFactoryLink {
        id
        client {
          id
          razaoSocial
          nomeFantasia
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
