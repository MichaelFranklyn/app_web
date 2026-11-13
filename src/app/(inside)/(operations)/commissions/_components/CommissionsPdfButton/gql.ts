import { gql } from "@apollo/client";

/** Manda o extrato do mês, já gerado no navegador, ao email do vendedor. */
export const SEND_COMMISSION_STATEMENT_EMAIL_MUTATION = gql`
  mutation SendCommissionStatementEmail(
    $input: SendCommissionStatementEmailInput!
  ) {
    sendCommissionStatementEmail(input: $input) {
      status
      message
    }
  }
`;
