import { gql } from "@apollo/client";

/** Sem `email`, as últimas mensagens de todos os endereços; com, só as dele —
 * e a situação de bloqueio daquele endereço. */
export const PLATFORM_EMAIL_LOG_QUERY = gql`
  query PlatformEmailLog($email: String, $limit: Int) {
    platformEmailLog(email: $email, limit: $limit) {
      status
      code
      message
      data {
        email
        sentToday
        dailyQuota
        suppression {
          email
          reason
          since
        }
        messages {
          id
          toEmail
          subject
          status
          error
          lastEvent
          lastEventAt
          createdAt
        }
      }
    }
  }
`;

export const RELEASE_EMAIL_SUPPRESSION_MUTATION = gql`
  mutation ReleaseEmailSuppression($email: String!, $reason: String) {
    releaseEmailSuppression(email: $email, reason: $reason) {
      status
      code
      message
      data
    }
  }
`;
