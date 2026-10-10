import { gql } from "@apollo/client";

// Só para saber se a semana que vem JÁ tem rotina (e se está confirmada) — a
// consulta cheia da tela traz dias e visitas, e aqui bastam dois campos.
export const NEXT_WEEK_SCHEDULE_QUERY = gql`
  query NextWeekSchedule($input: BaseListInput!) {
    next_week_schedules: visitSchedules(input: $input) {
      edges {
        node {
          id
          status
        }
      }
    }
  }
`;
