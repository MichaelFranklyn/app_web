import { FlowDefinition } from "../../../interface";
import { ANALYTICS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour do Desempenho. Dispara sozinho na 1ª visita.
 *
 * A tela é longa — sete partes, trinta gráficos — e o que ela tem de diferente
 * é que a ORDEM é o argumento: o resultado, o que o explica, de quem ele
 * depende e só então as pessoas por trás dele. Quem abre e começa a rolar vê
 * cartão atrás de cartão e não sabe onde aquilo termina; o roteiro do topo é a
 * resposta, e o tour existe principalmente para apontar para ele.
 */
export const analyticsFlow: FlowDefinition = {
  key: ANALYTICS_FLOW,
  label: "Tour do Desempenho",
  description: "Como a empresa vem indo, em sete perguntas na ordem.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.analytics,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="analytics-filters"]',
      title: "O recorte de tudo",
      description:
        "O período — doze meses, por padrão, porque aqui se olha tendência e não o mês corrente —, e o vendedor ou a fábrica, quando quiser afinar. Todo gráfico da página obedece a esta barra.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="analytics-summary"]',
      requireSelector: '[data-tour="analytics-summary"]',
      title: "O fechamento do período",
      description:
        "Pedidos, faturamento, ticket médio e clientes ativos no recorte escolhido. É a leitura rápida antes de descer aos gráficos.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="analytics-story"]',
      title: "A página conta uma história",
      description:
        "São sete partes, e cada uma responde uma pergunta que prepara a seguinte. Clique numa delas para pular direto — a página é longa de propósito.",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="analytics-pdf"]',
      title: "Levar impresso",
      description:
        "Escolhe o que entra no PDF, parte por parte ou gráfico por gráfico — não precisa imprimir os trinta para mostrar dois numa reunião.",
      side: "bottom",
      align: "end",
    },
  ],
};
