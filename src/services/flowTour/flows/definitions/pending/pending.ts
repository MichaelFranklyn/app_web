import { FlowDefinition } from "../../../interface";
import { PENDING_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour das Pendências. Dispara sozinho na 1ª visita.
 *
 * A dúvida que esta tela levanta é sempre "resolvi, onde dou baixa?" — e a
 * resposta (não se dá) precisa aparecer antes da primeira linha clicada.
 */
export const pendingFlow: FlowDefinition = {
  key: PENDING_FLOW,
  label: "Tour das Pendências",
  description: "A lista de trabalho: o que resolver, em que ordem e onde.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.pending,
  version: 1,
  autoStart: true,
  steps: [
    {
      title: "Seus compromissos, numa lista só",
      description:
        "Visita sem resposta, contato agendado, pedido parado, boleto vencido, cliente sem contato: tudo o que espera por você está aqui. Para achar onde vender mais, use Oportunidades.",
    },
    {
      element: '[data-tour="pending-sections"]',
      requireSelector: '[data-tour="pending-sections"]',
      title: "Compromissos e cobranças",
      description:
        "Os boletos vencidos ficam numa seção própria, com a quantidade sempre à vista. Assim eles não empurram as visitas para o fim da lista — e continuam aqui até o pagamento ser baixado no pedido. Conferir não é pagar.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="pending-counts"]',
      requireSelector: '[data-tour="pending-counts"]',
      title: "Atrasadas, hoje e a semana",
      description:
        "Clique num número para ver só aquelas pendências. Clique de novo para voltar à lista inteira.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="pending-filters"]',
      requireSelector: '[data-tour="pending-filters"]',
      title: "Filtre por tipo, responsável e período",
      description:
        "O filtro fica guardado: abra um pedido, resolva e volte — a lista continua no mesmo recorte.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="pending-table"]',
      requireSelector: '[data-tour="pending-table"]',
      title: "Resolveu, sai da lista",
      description:
        "Cada linha explica o motivo e leva aonde se resolve — o pedido, o contato ou o cadastro. Não existe botão de baixa: quando você resolve, a pendência some sozinha.",
      side: "top",
      align: "start",
    },
  ],
};
