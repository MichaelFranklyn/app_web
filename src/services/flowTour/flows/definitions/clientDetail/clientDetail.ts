import { FlowDefinition } from "../../../interface";
import { CLIENT_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour da página de um cliente. Dispara sozinho na 1ª vez que se abre qualquer
 * cliente (guard por flow_key, não por id).
 *
 * Version 2: o passo das seções listava cinco abas e a ficha tem oito. Produtos
 * e Atendimentos nasceram depois do tour e ficaram de fora; e Visitas, Estoque
 * e Score apareciam como se existissem para todo mundo, quando os três são o
 * motor de rotina e somem juntos no plano que não o contratou. Quem lia a lista
 * procurava uma aba que não estava lá — ou não encontrava as que estavam.
 */
export const clientDetailFlow: FlowDefinition = {
  key: CLIENT_DETAIL_FLOW,
  label: "Tour da página do cliente",
  description: "Entenda as seções e ações da ficha do cliente.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientDetail,
  version: 2,
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
        "Cada aba mostra um lado do relacionamento: as Fábricas que ele compra, os Pedidos, os Produtos que ele leva e os Atendimentos abertos. Com o módulo de rotina, entram também Visitas, Estoque Estimado e Score.",
      side: "bottom",
      align: "start",
    },
  ],
};
