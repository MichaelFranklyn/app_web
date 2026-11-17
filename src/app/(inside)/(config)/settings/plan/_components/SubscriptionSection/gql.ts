import { gql } from "@apollo/client";

/** A assinatura paga da empresa. Só o dono enxerga (o backend recusa os
 * demais), e a página do plano já é restrita ao dono. */
export const MY_SUBSCRIPTION_QUERY = gql`
  query MySubscription {
    mySubscription {
      status
      message
      data {
        isBillingEnabled
        paidUntil
        status
        plan
        planLabel
        cycle
        extraUsers
        value
        overdueSince
        invoiceUrl
      }
    }
  }
`;

export const CANCEL_SUBSCRIPTION_MUTATION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      status
      message
    }
  }
`;
