import { FlowDefinition } from "../../../interface";
import { OPPORTUNITIES_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour das Oportunidades (a antiga /insights). Dispara sozinho na 1ª visita.
 *
 * Chave NOVA, e não um bump do tour de insights: a tela mudou de assunto — o
 * trabalho a resolver foi para Pendências —, e quem já tinha visto o tour
 * antigo precisa ver a diferença.
 */
export const opportunitiesFlow: FlowDefinition = {
  key: OPPORTUNITIES_FLOW,
  label: "Tour das Oportunidades",
  description: "Onde vale concentrar suas próximas ações comerciais.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.opportunities,
  version: 1,
  autoStart: true,
  steps: [
    {
      title: "Onde vale agir para vender mais",
      description:
        "Esta tela não é lista de tarefas: ela lê a sua carteira e mostra quem está no momento de recomprar e quem ficou fora da rotina. O que é compromisso a resolver — pedido parado, boleto, visita — está em Pendências.",
    },
    {
      element: '[data-tour="opportunities-seller"]',
      roles: ["OWNER", "ADMIN", "SU"],
      title: "De quem são as oportunidades",
      description:
        "Escolha um vendedor para ver só a carteira dele. Sem escolher, a tela mostra a empresa toda.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="opportunities-card"]',
      requireSelector: '[data-tour="opportunities-card"]',
      title: "Cada cartão explica o porquê",
      description:
        "O cartão diz quantos clientes, por que vale agir e quem são os primeiros.",
      side: "right",
      align: "start",
    },
    {
      // O botão, e não a lista: ela só existe depois do clique, e um alvo
      // ausente faria o motor pular o passo em silêncio.
      element: '[data-tour="opportunities-open"]',
      requireSelector: '[data-tour="opportunities-open"]',
      title: "Da oportunidade ao compromisso",
      description:
        'A lista abre aqui mesmo, com o motivo de cada cliente. Dela você agenda o contato ou planeja a visita — o cliente passa a mostrar "contato agendado para…", e o compromisso aparece em Pendências quando chegar o dia.',
      side: "top",
      align: "end",
    },
  ],
};
