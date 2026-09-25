// Criação de pedido em /orders, compartilhada pela página de novo pedido
// (`orders/new`) e pelo modal de importar do cabeçalho: a mutation, as opções
// da cascata vendedor→fábrica→cliente e o normalizador do formulário.
export {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_CLIENTS_QUERY,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "./gql";
export type { CreateOrderInput, CreateOrderResponse } from "./interface";
export { normalizeInput } from "./utils";
export { useOrderClientOptions } from "./useOrderClientOptions";
export type {
  SellerClientNode,
  SellerClientsData,
} from "./useOrderClientOptions";
