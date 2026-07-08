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
      totalCount
    }
  }
`;

// Vendedores da empresa para o seletor de configuração (gestor escolhe de quem
// ver/editar a rotina). Vendedor comum não usa — vê só a própria config.
export const ROUTINE_CONFIG_SELLERS_QUERY = gql`
  query RoutineConfigSellers($input: BaseListInput!) {
    config_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

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
