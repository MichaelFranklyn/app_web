import { gql } from "@apollo/client";

/**
 * Manda o link JÁ EMITIDO ao email do dono da rotina. Não emite outro: o
 * backend confere que o link está vivo e é desta rotina.
 */
export const SEND_VISIT_RESPONSE_LINK_EMAIL_MUTATION = gql`
  mutation SendVisitResponseLinkEmail(
    $input: SendVisitResponseLinkEmailInput!
  ) {
    sendVisitResponseLinkEmail(input: $input) {
      status
      message
    }
  }
`;
