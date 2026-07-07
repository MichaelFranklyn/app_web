import { gql } from "@apollo/client";

export const COMMISSIONS_QUERY = gql`
  query Commissions {
    commissions {
      totalReceivable
      totalReceived
      totalPending
      countReceivable
      rows {
        orderId
        installmentId
        sequence
        orderDate
        invoicedAt
        dueDate
        paidAt
        installmentAmount
        amount
        status
        receiveDate
        isReceivable
        isReceived
        client {
          id
          razaoSocial
          nomeFantasia
        }
        factory {
          id
          nomeFantasia
          razaoSocial
        }
        seller {
          id
          name
        }
      }
    }
  }
`;

export const MARK_COMMISSION_RECEIVED_MUTATION = gql`
  mutation MarkCommissionReceived(
    $installmentIds: [UUID!]!
    $receivedAt: Date!
  ) {
    markCommissionReceived(
      installmentIds: $installmentIds
      receivedAt: $receivedAt
    ) {
      status
      message
    }
  }
`;
