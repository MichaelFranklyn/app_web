import { FlowDefinition } from "../../../interface";
import { ORDERS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da listagem de Pedidos. Dispara sozinho na 1ª visita.
export const ordersFlow: FlowDefinition = {
  key: ORDERS_FLOW,
  label: "Tour dos Pedidos",
  description: "Aprenda a criar, importar e acompanhar pedidos.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.orders,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="orders-actions"]',
      title: "Criar e importar pedidos",
      description:
        'Use "Novo pedido" para registrar um pedido na mão, ou "Importar" para trazer um pedido de um PDF ou planilha.',
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="orders-search"]',
      title: "Buscar pedido",
      description: "Pesquise por fábrica, vendedor ou pelo código do pedido.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="orders-table"]',
      requireSelector: '[data-tour="orders-row"]',
      title: "Lista de pedidos",
      description:
        "Aqui ficam todos os pedidos, com cliente, fábrica, data, valor e comissão.",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="orders-row"]',
      requireSelector: '[data-tour="orders-row"]',
      title: "Abrir um pedido",
      description:
        "Clique em uma linha para ver os itens e os detalhes completos do pedido.",
      side: "top",
      align: "start",
    },
  ],
};
