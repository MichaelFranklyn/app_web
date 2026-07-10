import { gql } from "@apollo/client";

export const UPDATE_VISIT_ITEM_MUTATION = gql`
  mutation UpdateVisitScheduleItem(
    $id: UUID!
    $input: UpdateVisitScheduleItemInput!
  ) {
    updateVisitScheduleItem(id: $id, input: $input) {
      status
      message
      data {
        id
        status
        outcome
        notes
      }
    }
  }
`;

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
