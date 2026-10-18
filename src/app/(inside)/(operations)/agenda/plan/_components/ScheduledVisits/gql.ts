import { gql } from "@apollo/client";

/** O que já está marcado, de hoje até as próximas 8 semanas, na ordem do dia. */
export const SCHEDULED_VISITS_QUERY = gql`
  query ScheduledVisits($sellerId: UUID) {
    scheduledVisits(sellerId: $sellerId) {
      itemId
      clientId
      clientName
      cityLabel
      neighborhood
      date
      contactType
    }
  }
`;
