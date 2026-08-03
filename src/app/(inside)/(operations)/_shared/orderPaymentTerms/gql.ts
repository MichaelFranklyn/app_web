import { gql } from "@apollo/client";

// Condições de pagamento cadastradas na fábrica (aba Prazos do vínculo) — o
// wizard de novo pedido oferece uma delas como condição do pedido (opcional).
// `minOrderAmount` é o piso de faturamento que a fábrica exige para liberar o
// prazo (nulo = sem piso). Vem junto do rótulo para o vendedor descobrir a
// exigência no passo 1, e não ao tentar confirmar o pedido já montado.
export const ORDER_PAYMENT_TERMS_QUERY = gql`
  query OrderPaymentTerms($input: BaseListInput!) {
    factoryPaymentTerms(input: $input) {
      edges {
        node {
          id
          name
          installmentsDays
          minOrderAmount
        }
      }
    }
  }
`;

export interface OrderPaymentTermsData {
  factoryPaymentTerms: {
    edges: {
      node: {
        id: string;
        name: string;
        installmentsDays: number[];
        minOrderAmount: number | null;
      };
    }[];
  };
}
