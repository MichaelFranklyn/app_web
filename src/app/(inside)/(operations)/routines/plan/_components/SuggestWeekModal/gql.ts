import { gql } from "@apollo/client";

/** "Sugerir pra mim": quem e quando, na quantidade que o vendedor pediu. Só
 * sugere — a tela pré-marca e quem grava é o `planWeek`. */
export const SUGGEST_WEEK_PLAN_QUERY = gql`
  query SuggestWeekPlan($input: SuggestWeekInput!) {
    suggestWeekPlan(input: $input) {
      weekStart
      days
      stops {
        clientId
        contactType
        date
      }
    }
  }
`;
