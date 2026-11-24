import { gql } from "@apollo/client";

export const FACTORY_PAYMENT_TERMS_QUERY = gql`
  query FactoryPaymentTerms($input: BaseListInput!) {
    payment_terms: factoryPaymentTerms(input: $input) {
      edges {
        node {
          id
          name
          installmentsDays
          minOrderAmount
          priceTierId
        }
      }
      totalCount
    }
  }
`;

export const PAYMENT_TERMS_LIST_FIRST = 50;

/** Variáveis canônicas da listagem de prazos (query + update otimista do cache). */
export const buildFactoryPaymentTermsVariables = (
  companyFactoryId: string
) => ({
  input: {
    first: PAYMENT_TERMS_LIST_FIRST,
    filters: [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
  },
});

export interface PaymentTermNode {
  id: string;
  name: string;
  installmentsDays: number[];
  /** Piso de faturamento exigido pela fábrica; null = prazo sem mínimo. */
  minOrderAmount: number | null;
  /**
   * Nível comercial a que o prazo pertence (ex.: "Interior" → 45/75/105).
   * null = vale para todos os níveis. Só SUGERE o prazo no pedido.
   */
  priceTierId: string | null;
}

export interface FactoryPaymentTermsData {
  payment_terms: {
    edges: { node: PaymentTermNode }[];
    totalCount: number;
  };
}

export const CREATE_FACTORY_PAYMENT_TERM_MUTATION = gql`
  mutation CreateFactoryPaymentTerm($input: CreateFactoryPaymentTermInput!) {
    createFactoryPaymentTerm(input: $input) {
      status
      message
      data {
        id
        name
        installmentsDays
        minOrderAmount
        priceTierId
      }
    }
  }
`;

export const UPDATE_FACTORY_PAYMENT_TERM_MUTATION = gql`
  mutation UpdateFactoryPaymentTerm(
    $id: UUID!
    $input: UpdateFactoryPaymentTermInput!
  ) {
    updateFactoryPaymentTerm(id: $id, input: $input) {
      status
      message
      data {
        id
        name
        installmentsDays
        minOrderAmount
        priceTierId
      }
    }
  }
`;

export const DELETE_FACTORY_PAYMENT_TERM_MUTATION = gql`
  mutation DeleteFactoryPaymentTerm($id: UUID!) {
    deleteFactoryPaymentTerm(id: $id) {
      status
      message
    }
  }
`;

// Níveis da fábrica: a aba carrega uma vez e entrega aos dois modais e à coluna.
export const PAYMENT_TERM_TIERS_QUERY = gql`
  query PaymentTermTiers($input: BaseListInput!) {
    priceTiers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export interface PaymentTermTiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
    totalCount: number;
  };
}
