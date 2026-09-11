import { FlowDefinition } from "../../../interface";
import { COMMISSIONS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour das Comissões. Dispara sozinho na 1ª visita.
 *
 * É a tela com mais recortes simultâneos do sistema — ótica, mês, situação e
 * vendedor — e eles NÃO governam as mesmas coisas. O tour existe para dizer
 * isso na cara: o mês manda nos totais, a aba manda na lista, e a ótica decide
 * de quem é o dinheiro que está sendo somado. Sem essa distinção, dois números
 * certos na mesma tela parecem um erro de conta.
 *
 * O passo da ótica é gateado: para o vendedor a comissão já É a fatia dele, e
 * o seletor nem aparece.
 */
export const commissionsFlow: FlowDefinition = {
  key: COMMISSIONS_FLOW,
  label: "Tour das Comissões",
  description: "Como ler o mês, a situação do boleto e de quem é o dinheiro.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.commissions,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="commissions-lens"]',
      roles: ["OWNER", "ADMIN", "SU"],
      title: "De quem é o dinheiro",
      description:
        'Em "Escritório" a tela soma todos os vendedores — é o número que se confere contra a planilha da fábrica. Troque para "Vendedor" para ver, e escolher, um de cada vez.',
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="commissions-month"]',
      title: "O mês manda nos totais",
      description:
        "Ande para trás e para a frente com as setas, ou clique no nome do mês para voltar ao atual. É este mês que os três cartões abaixo somam.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="commissions-kpis"]',
      requireSelector: '[data-tour="commissions-kpis"]',
      title: "O fechamento do mês",
      description:
        "Quanto ainda há para receber, quanto foi lançado e quanto já entrou. O “?” de cada cartão explica o que entra na conta.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="commissions-tabs"]',
      title: "A situação manda na lista",
      description:
        "As abas filtram por situação do boleto, e valem só para a lista de baixo — os cartões acima continuam somando o mês inteiro. A linha abaixo escreve sempre o que está sendo mostrado.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="commissions-pdf"]',
      title: "O papel do fechamento",
      description:
        "Baixa o mês em PDF, em cinco partes, com a situação de cada boleto — é o que se manda para a fábrica ou se guarda como comprovante.",
      side: "bottom",
      align: "end",
    },
  ],
};
