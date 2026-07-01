import { FlowDefinition } from "../../../interface";
import { SELLER_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da página de um vendedor. Dispara sozinho na 1ª vez que se abre qualquer vendedor.
export const sellerDetailFlow: FlowDefinition = {
  key: SELLER_DETAIL_FLOW,
  label: "Tour da página do vendedor",
  description: "As seções do perfil de um vendedor.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.sellerDetail,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="seller-detail-tabs"]',
      title: "Seções do vendedor",
      description:
        'Em "Visão Geral" você vê os dados do vendedor; em "Fábricas" e "Clientes", o que ele atende.',
      side: "bottom",
      align: "start",
    },
  ],
};
