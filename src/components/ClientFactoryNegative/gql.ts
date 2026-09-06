import { gql } from "@apollo/client";

/**
 * Marca/desmarca a negativação do cliente numa fábrica.
 *
 * A resposta traz os três campos do estado porque as duas telas que chamam esta
 * mutation mostram os três — a tarja, a data e o motivo — e o Apollo escreve a
 * resposta direto no vínculo em cache pelo `id`, sem precisar rebuscar a lista.
 */
export const SET_CLIENT_FACTORY_NEGATIVE_MUTATION = gql`
  mutation SetSellerClientFactoryNegative(
    $id: UUID!
    $input: SetSellerClientFactoryNegativeInput!
  ) {
    setSellerClientFactoryNegative(id: $id, input: $input) {
      status
      message
      data {
        id
        isNegative
        negativeSince
        negativeReason
      }
    }
  }
`;
