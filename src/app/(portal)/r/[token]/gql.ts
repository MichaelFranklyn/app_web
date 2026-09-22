import { gql } from "@apollo/client";

// A folha do dia, como o vendedor a responde. Sem score, sem viabilidade: o dia
// já aconteceu, e o que se pede aqui é o que houve nele.
export const VISIT_RESPONSE_FORM = gql`
  query VisitResponseForm {
    visitResponseForm {
      status
      message
      data {
        date
        sellerName
        companyName
        companyLogoUrl
        submittedAt
        stops {
          id
          plannedOrder
          contactType
          clientName
          clientAlias
          clientCity
          clientState
          factoryNames
          status
          outcome
          notes
          hasLinkedOrder
        }
      }
    }
  }
`;

export const SUBMIT_VISIT_RESPONSES = gql`
  mutation SubmitVisitResponses($input: SubmitVisitResponsesInput!) {
    submitVisitResponses(input: $input) {
      status
      message
    }
  }
`;
