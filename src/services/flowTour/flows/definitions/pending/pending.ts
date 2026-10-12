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
  version: 2,
  autoStart: true,
  steps: [
    {
      title: "Seus compromissos, num lugar só",
      description:
        "Visita sem resposta, contato agendado, pedido parado, boleto vencido, cliente sem contato: tudo o que espera por você está aqui. Para achar onde vender mais, use Oportunidades.",
    },
    {
      element: '[data-tour="pending-counts"]',
      requireSelector: '[data-tour="pending-counts"]',
      title: "Atrasadas, hoje e a semana",
      description:
        "Clique num número para contar só aquelas pendências nos cartões. Clique de novo para voltar a ver tudo.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="pending-filters"]',
      requireSelector: '[data-tour="pending-filters"]',
      title: "Filtre por responsável e período",
      description:
        "O filtro fica guardado: abra um pedido, resolva e volte — a tela continua no mesmo recorte.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="pending-card"]',
      requireSelector: '[data-tour="pending-card"]',
      title: "Um cartão por assunto",
      description:
        "O número diz quantas pendências há e fica vermelho quando alguma é de prioridade alta. Logo abaixo, as mais urgentes. Os boletos vencidos têm o cartão deles e continuam ali até o pagamento ser baixado no pedido — conferir não é pagar.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="pending-open"]',
      requireSelector: '[data-tour="pending-open"]',
      title: "Resolveu, sai da lista",
      description:
        "Abra a lista do assunto: cada linha explica o motivo e leva aonde se resolve — o pedido, o contato ou o cadastro. Não existe botão de baixa: quando você resolve, a pendência some sozinha.",
      side: "top",
      align: "end",
    },
  ],
};
