import { FlowDefinition } from "../../../interface";
import { REPORTS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour dos Relatórios. Dispara sozinho na 1ª visita.
 *
 * Roda em `/dashboard/reports/sales` e não na raiz: `/dashboard/reports`
 * redireciona para a primeira aba, então um fluxo apontado para lá nunca
 * apareceria. A barra, os KPIs e o "Exportar" são os mesmos nas dez abas — o
 * tour ensina a moldura uma vez e ela serve para todas.
 *
 * Relatórios não está na sidebar (entra-se pelo botão do Dashboard), então
 * quem chega aqui já veio buscando algo: o tour é curto de propósito.
 */
export const reportsFlow: FlowDefinition = {
  key: REPORTS_FLOW,
  label: "Tour dos Relatórios",
  description: "Escolher o relatório, o período, e levar em planilha ou PDF.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.reports,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="reports-tabs"]',
      title: "Dez relatórios, uma moldura",
      description:
        "Cada aba é um papel da operação: vendas, faturamento, comissões, curva ABC. Trocar de aba não perde o período que você escolheu.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="reports-toolbar"]',
      title: "O recorte",
      description:
        "O período começa no mês corrente, do dia 1 até hoje — relatório se tira para conferir o mês que está correndo. Ajuste aqui, e também o vendedor ou a fábrica quando fizer sentido.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="reports-kpis"]',
      requireSelector: '[data-tour="reports-kpis"]',
      title: "Confira pelo fechamento",
      description:
        "Conferir um relatório começa pelo total: bateu com o que você esperava? Só então se desce à linha que não fechou.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="reports-export"]',
      title: "Levar o papel",
      description:
        "Baixa em planilha, para continuar a conta no Excel, ou em PDF, que já sai com o período e o vendedor escritos no cabeçalho.",
      side: "bottom",
      align: "end",
    },
  ],
};
