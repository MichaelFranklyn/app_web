import { gql } from "@apollo/client";

export const UNSUBSCRIBE_EMAIL_DIGEST = gql`
  mutation UnsubscribeEmailDigest($token: String!) {
    unsubscribeEmailDigest(token: $token) {
      status
      message
    }
  }
`;
