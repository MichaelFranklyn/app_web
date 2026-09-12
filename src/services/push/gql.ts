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

/**
 * O aviso que a pessoa manda para si mesma logo depois de ativar.
 *
 * Inscrever o aparelho não prova que o aviso chega: a permissão do sistema pode
 * estar desligada, o celular em "Não perturbe", o iPhone fora da tela de início.
 * Só a notificação aparecendo na barra responde a pergunta que ela tem.
 */
export const SEND_TEST_PUSH_MUTATION = gql`
  mutation SendTestPush {
    sendTestPush {
      status
      message
    }
  }
`;
