import { FlowDefinition } from "../../../interface";
import { FACTORY_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da página de uma fábrica. Dispara sozinho na 1ª vez que se abre qualquer
// fábrica (guard por flow_key, não por id).
export const factoryDetailFlow: FlowDefinition = {
  key: FACTORY_DETAIL_FLOW,
  label: "Tour da página da fábrica",
  description: "Veja onde ficam catálogo, tabelas de preço e impostos.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.factoryDetail,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="factory-detail-actions"]',
      title: "Editar ou remover",
      description:
        "Aqui você edita o vínculo com a fábrica (comissão, contrato) ou o remove.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factory-tabs"]',
      title: "Seções da fábrica",
      description: "Use estas abas para navegar entre as áreas da fábrica.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="factory-tab-products"]',
      title: "Produtos (catálogo)",
      description:
        "Na aba Produtos fica o catálogo da fábrica — os itens que você vende.",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="factory-tab-prices"]',
      title: "Tabelas de preço",
      description:
        "Na aba Tabelas ficam as listas de preço, os níveis comerciais e os impostos.",
      side: "bottom",
      align: "center",
    },
  ],
};
