import { gql } from "@apollo/client";

export const DELETE_VISIT_SCHEDULE_ITEM_MUTATION = gql`
  mutation DeleteVisitScheduleItem($id: UUID!) {
    deleteVisitScheduleItem(id: $id) {
      status
      message
    }
  }
`;
