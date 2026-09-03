import { gql } from "@apollo/client";

export const UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION = gql`
  mutation UpdateSellerCommissionAgreement(
    $id: UUID!
    $input: UpdateSellerFactoryAccessInput!
  ) {
    updateSellerFactoryAccess(id: $id, input: $input) {
      status
      message
    }
  }
`;

/**
 * A comissão que ESTA fábrica paga à empresa, para a prévia do acordo.
 *
 * Ela mora no vínculo empresa×fábrica, não no acesso do vendedor — e é o que
 * transforma "50% da comissão" em "R$ 350 num pedido de R$ 10.000". O filtro
 * vai ao SERVIDOR e volta uma linha: pedir a lista e procurar no navegador
 * daria a resposta errada no dia em que a empresa passasse do teto da página.
 */
export const ACCESS_FACTORY_RATE_QUERY = gql`
  query AccessFactoryRate($input: BaseListInput!) {
    access_factory_rate: companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
          commissionRate
        }
      }
    }
  }
`;
