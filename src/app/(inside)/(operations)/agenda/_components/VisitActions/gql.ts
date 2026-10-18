import { gql } from "@apollo/client";

export const RESCHEDULE_VISIT_MUTATION = gql`
  # input.targetDate (Date) remarca para uma data livre; o backend cria o dia/semana se faltar.
  mutation RescheduleVisit($input: RescheduleVisitInput!) {
    rescheduleVisit(input: $input) {
      status
      message
      data {
        originalItem {
          id
          status
        }
        newItem {
          id
        }
      }
    }
  }
`;

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
