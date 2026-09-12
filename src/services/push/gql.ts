import { gql } from "@apollo/client";

/**
 * Consultas do aviso no aparelho (Web Push), no pai de quem as usa: o card do
 * perfil (ativar/desativar) e a saída do sistema (que descarta a inscrição).
 *
 * A chave pública vem do BACKEND de propósito — ver o resolver `pushPublicKey`:
 * pública e privada são duas metades do mesmo par, e servi-las de origens
 * diferentes (uma no build do front, outra no servidor) deixa a inscrição ser
 * aceita e todo envio depois falhar com 403.
 */

export const PUSH_PUBLIC_KEY_QUERY = gql`
  query PushPublicKey {
    pushPublicKey {
      status
      data
    }
  }
`;

export const REGISTER_PUSH_SUBSCRIPTION_MUTATION = gql`
  mutation RegisterPushSubscription($input: PushSubscriptionInput!) {
    registerPushSubscription(input: $input) {
      status
      message
    }
  }
`;

export const REMOVE_PUSH_SUBSCRIPTION_MUTATION = gql`
  mutation RemovePushSubscription($endpoint: String!) {
    removePushSubscription(endpoint: $endpoint) {
      status
      message
    }
  }
`;
