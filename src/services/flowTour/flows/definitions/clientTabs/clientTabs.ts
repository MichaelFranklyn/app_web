import { FlowDefinition } from "../../../interface";
import {
  CLIENT_FACTORIES_FLOW,
  CLIENT_ORDERS_FLOW,
  CLIENT_SCORE_FLOW,
  CLIENT_STOCK_FLOW,
  CLIENT_VISITS_FLOW,
} from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tours das abas internas do cliente. Sem autoStart: são curtos e disponíveis sob
// demanda no botão de ajuda — evita disparar um tour a cada troca de aba.

export const clientVisitsFlow: FlowDefinition = {
  key: CLIENT_VISITS_FLOW,
  label: "Entender as Visitas",
  description: "O histórico de visitas a este cliente.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientVisits,
  version: 1,
  steps: [
    {
      element: '[data-tour="client-visits-table"]',
      requireSelector: '[data-tour="client-visits-table"]',
      title: "Histórico de visitas",
      description:
        "Cada linha é uma visita feita a este cliente, com data, fábrica e vendedor. Você pode editar ou remover um registro.",
      side: "top",
      align: "start",
    },
  ],
};

export const clientStockFlow: FlowDefinition = {
  key: CLIENT_STOCK_FLOW,
  label: "Entender o Estoque Estimado",
  description: "Como ler as estimativas de estoque do cliente.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientStock,
  version: 1,
  steps: [
    {
      element: '[data-tour="client-stock-table"]',
      requireSelector: '[data-tour="client-stock-table"]',
      title: "Estoque estimado",
      description:
        "São estimativas calculadas a partir das médias que o vendedor informa em campo. Ajuste observando o estoque real durante as visitas.",
      side: "top",
      align: "start",
    },
  ],
};

export const clientFactoriesFlow: FlowDefinition = {
  key: CLIENT_FACTORIES_FLOW,
  label: "Fábricas do cliente",
  description: "As fábricas que este cliente compra.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientFactories,
  version: 1,
  steps: [
    {
      element: '[data-tour="client-factories-actions"]',
      title: "Vincular fábrica",
      description:
        "Ligue este cliente a uma fábrica para poder registrar pedidos dela. Só aparecem fábricas que você tem acesso.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="client-factories-table"]',
      title: "Vínculos por fábrica",
      description:
        "As fábricas que o cliente compra, com o vendedor responsável, prioridade e frequência de visita.",
      side: "top",
      align: "start",
    },
  ],
};

export const clientOrdersFlow: FlowDefinition = {
  key: CLIENT_ORDERS_FLOW,
  label: "Pedidos do cliente",
  description: "Os pedidos feitos por este cliente.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientOrders,
  version: 1,
  steps: [
    {
      element: '[data-tour="client-orders-actions"]',
      title: "Novo pedido",
      description: "Registre um pedido já com este cliente pré-selecionado.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="client-orders-table"]',
      title: "Pedidos do cliente",
      description: "O histórico de pedidos deste cliente.",
      side: "top",
      align: "start",
    },
  ],
};

export const clientScoreFlow: FlowDefinition = {
  key: CLIENT_SCORE_FLOW,
  label: "Entender o Score",
  description: "O que o score do cliente representa.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.clientScore,
  version: 1,
  steps: [
    {
      element: '[data-tour="client-score"]',
      requireSelector: '[data-tour="client-score"]',
      title: "Score do cliente",
      description:
        "Um resumo da saúde do relacionamento com o cliente, combinando fatores como frequência de visitas e pedidos.",
      side: "right",
      align: "start",
    },
  ],
};
