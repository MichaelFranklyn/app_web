import { gql } from "@apollo/client";

// Gravação da configuração de rotina, a partir do card "Rotina de visitas" do
// perfil. Os pesos do score não têm tela hoje: entram com o padrão na criação e
// ficam como estão.
export const CREATE_SCHEDULE_CONFIG_MUTATION = gql`
  mutation CreateScheduleConfig($input: CreateVisitScheduleConfigInput!) {
    createScheduleConfig(input: $input) {
      status
      message
      data {
        id
        sellerId
        maxVisitsPerDay
        workDays
        workStartTime
        workEndTime
        avgVisitDurationMin
        isRescheduleSameWeek
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
        isRescheduleSameWeek
        maxRescheduleAttempts
        penaltyScorePerMiss
        priorityWeights
      }
    }
  }
`;
