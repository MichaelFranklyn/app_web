import { gql } from "@apollo/client";

// Condições de pagamento cadastradas na fábrica (aba Prazos do vínculo) — o
// wizard de novo pedido oferece uma delas como condição do pedido (opcional).
export const ORDER_PAYMENT_TERMS_QUERY = gql`
  query OrderPaymentTerms($input: BaseListInput!) {
    factoryPaymentTerms(input: $input) {
      edges {
        node {
          id
          name
          installmentsDays
        }
      }
    }
  }
`;

export interface OrderPaymentTermsData {
  factoryPaymentTerms: {
    edges: {
      node: { id: string; name: string; installmentsDays: number[] };
    }[];
  };
}
