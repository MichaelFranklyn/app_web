import { gql } from "@apollo/client";

export const UNSUBSCRIBE_EMAIL_DIGEST = gql`
  mutation UnsubscribeEmailDigest($token: String!) {
    unsubscribeEmailDigest(token: $token) {
      status
      message
    }
  }
`;

export const UNSUBSCRIBE_CLIENT_ORDER_EMAILS = gql`
  mutation UnsubscribeClientOrderEmails($token: String!) {
    unsubscribeClientOrderEmails(token: $token) {
      status
      message
    }
  }
`;
