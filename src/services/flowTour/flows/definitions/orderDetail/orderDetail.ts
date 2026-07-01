import { FlowDefinition } from "../../../interface";
import { ORDER_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da página de um pedido. Dispara sozinho na 1ª vez que se abre qualquer pedido.
export const orderDetailFlow: FlowDefinition = {
  key: ORDER_DETAIL_FLOW,
  label: "Tour da página do pedido",
  description: "Entenda os itens e o resumo de um pedido.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.orderDetail,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="order-items"]',
      title: "Itens do pedido",
      description:
        "A lista de produtos do pedido, com quantidade e preço de cada um.",
      side: "right",
      align: "start",
    },
    {
      element: '[data-tour="order-summary"]',
      title: "Resumo",
      description:
        "O total do pedido e a comissão estimada. Confira aqui antes de fechar.",
      side: "left",
      align: "start",
    },
  ],
};
