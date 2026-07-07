import { gql } from "@apollo/client";

// Reusa o resolver `commissions` (agregação server-side por parcela). O recorte
// por período/vendedor é feito no cliente (a query não aceita esses argumentos).
export const COMMISSIONS_FOR_CHART_QUERY = gql`
  query CommissionsForChart {
    commissions {
      rows {
        receiveDate
        amount
        isReceivable
        isReceived
        seller {
          id
        }
      }
    }
  }
`;
