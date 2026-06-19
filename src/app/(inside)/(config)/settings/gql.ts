import { gql } from "@apollo/client";

export const VISIT_SCHEDULE_CONFIGS_QUERY = gql`
  query VisitScheduleConfigs($input: BaseListInput!) {
    schedule_configs: visitScheduleConfigs(input: $input) {
      edges {
        node {
          id
          sellerId
          maxVisitsPerDay
          workDays
          workStartTime
          workEndTime
          avgVisitDurationMin
          rescheduleSameWeek
          maxRescheduleAttempts
          penaltyScorePerMiss
          priorityWeights
          seller {
            id
            user {
              name
            }
          }
        }
      }
      totalCount
    }
  }
`;

export const UPDATE_SCHEDULE_CONFIG_MUTATION = gql`
  mutation UpdateScheduleConfig(
    $id: UUID!
    $input: UpdateVisitScheduleConfigInput!
  ) {
    updateScheduleConfig(id: $id, input: $input) {
      status
      message
      data {
        id
        maxVisitsPerDay
        workDays
        workStartTime
        workEndTime
        avgVisitDurationMin
        rescheduleSameWeek
        maxRescheduleAttempts
        penaltyScorePerMiss
        priorityWeights
      }
    }
  }
`;
