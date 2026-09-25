// Vínculos vendedor→cliente de uma fábrica, para criar pedido a partir dela:
// a página de novo pedido (`orders/new?factoryId=`) e o modal de importar da
// aba Pedidos da fábrica pedem a mesma lista.
export { FACTORY_ASSIGNMENTS_QUERY } from "./gql";
export type { FactoryAssignment, FactoryAssignmentsData } from "./interface";
