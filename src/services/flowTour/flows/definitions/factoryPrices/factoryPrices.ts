import { FlowDefinition } from "../../../interface";
import { FACTORY_PRICES_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da lista de tabelas de preço de uma fábrica.
export const factoryPricesFlow: FlowDefinition = {
  key: FACTORY_PRICES_FLOW,
  label: "Tour das tabelas de preço",
  description: "Como criar, importar e versionar as tabelas de preço.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factoryPrices,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="prices-actions"]',
      title: "Criar, importar ou clonar",
      description:
        "Crie uma tabela nova, importe de uma planilha da fábrica ou clone uma tabela existente para fazer um reajuste.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="prices-table"]',
      requireSelector: '[data-tour="prices-row"]',
      title: "Suas tabelas",
      description:
        "Cada tabela versiona os preços por vigência (promoções, reajustes, histórico).",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="prices-row"]',
      requireSelector: '[data-tour="prices-row"]',
      title: "Abrir uma tabela",
      description:
        "Clique em uma linha para entrar na tabela e lançar o preço de cada produto por nível comercial.",
      side: "top",
      align: "start",
    },
  ],
};
