import { gql } from "@apollo/client";

// A visita que tomou a jornada: conclui e tira as outras paradas do dia.
export const MARK_VISIT_WHOLE_DAY_MUTATION = gql`
  mutation MarkVisitWholeDay($itemId: UUID!) {
    markVisitWholeDay(itemId: $itemId) {
      status
      message
      data {
        rescheduled
        released
        item {
          id
          status
          isWholeDay
        }
      }
    }
  }
`;
