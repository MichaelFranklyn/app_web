import { gql } from "@apollo/client";

export const FACTORY_PAYMENT_TERMS_QUERY = gql`
  query FactoryPaymentTerms($input: BaseListInput!) {
    payment_terms: factoryPaymentTerms(input: $input) {
      edges {
        node {
          id
          name
          installmentsDays
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
