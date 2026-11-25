import { gql } from "@apollo/client";

export const RESEND_WELCOME_EMAIL_MUTATION = gql`
  mutation ResendWelcomeEmail($id: UUID!) {
    resendWelcomeEmail(id: $id) {
      status
      message
    }
  }
`;
