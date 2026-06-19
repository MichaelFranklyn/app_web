import { gql } from "@apollo/client";

export const UPDATE_VISIT_SCHEDULE_ITEM_MUTATION = gql`
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
        outcomeReason
        stockObservation
        notes
      }
    }
  }
`;
