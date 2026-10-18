import { gql } from "@apollo/client";

/** A prévia (`dryRun: true`) e a gravação são a MESMA mutation: o que a
 * pessoa confere é exatamente o que entra na agenda. */
export const PLAN_WEEK_MUTATION = gql`
  mutation PlanWeek($input: PlanWeekInput!) {
    planWeek(input: $input) {
      status
      message
      data {
        weekStart
        added
        days {
          date
          visitCount
          callCount
          estimatedKm
          stops {
            clientId
            name
            cityLabel
            neighborhood
            contactType
            isNew
          }
        }
        skipped {
          clientId
          name
          reason
          date
        }
      }
    }
  }
`;
