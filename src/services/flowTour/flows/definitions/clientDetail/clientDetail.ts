import { FlowDefinition } from "../../../interface";
import { CLIENT_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da página de um cliente. Dispara sozinho na 1ª vez que se abre qualquer
// cliente (guard por flow_key, não por id).
export const clientDetailFlow: FlowDefinition = {
  key: CLIENT_DETAIL_FLOW,
  label: "Tour da página do cliente",
  description: "Entenda as seções e ações da ficha do cliente.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientDetail,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="client-detail-actions"]',
      title: "Editar ou remover",
      description:
        "Aqui você edita os dados do cliente ou o remove da sua carteira.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="client-tabs"]',
      title: "Seções do cliente",
      description:
        "Navegue entre as seções: Fábricas, Pedidos, Visitas, Estoque estimado e Score. Cada aba mostra um lado do relacionamento com o cliente.",
      side: "bottom",
      align: "start",
    },
  ],
};
