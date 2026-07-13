import { gql } from "@apollo/client";

// Operações de pedido compartilhadas entre rotas (fonte única). A deleção de
// pedido é acionada por 3 telas distintas (aba de pedidos da fábrica, detalhe do
// pedido, aba de pedidos do cliente) — a mutation vive aqui para não duplicar.
//
// Selection superset `{ status code message }`: quem só lê status/message ignora
// o `code` sem prejuízo; assim uma única definição serve os 3 consumidores.
export const DELETE_ORDER_MUTATION = gql`
  mutation DeleteOrder($id: UUID!) {
    deleteOrder(id: $id) {
      status
      code
      message
    }
  }
`;
