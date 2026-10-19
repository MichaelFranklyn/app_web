import { FlowDefinition } from "../../../interface";
import { ROUTINES_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da Agenda. Dispara sozinho na 1ª visita (versão 3: a agenda deixou de vir
// pronta em 18/10/2026; versão 4: o cabeçalho separou "Montar semana" do
// navegador; versão 5: a agenda virou folhinha — dia, semana e mês — e passou a
// ter as ligações combinadas com o cliente). Montar semana só existe na agenda
// de quem vende, por isso o passo dele pede o alvo.
export const routinesFlow: FlowDefinition = {
  key: ROUTINES_FLOW,
  label: "Tour da Agenda",
  description:
    "Veja o seu dia, a semana ou o mês, e marque as ligações combinadas com o cliente.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.routines,
  version: 5,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="routines-week-nav"]',
      title: "Que dia, que semana",
      description:
        "Hoje volta para o dia de hoje; as setas andam para trás e para a frente. Como administrador, aqui você também escolhe de quem é a agenda.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="routines-view-toggle"]',
      title: "Dia, semana ou mês",
      description:
        "Veja um dia com todos os detalhes, a semana inteira de uma vez ou o mês, como numa folhinha.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="routines-header-actions"]',
      requireSelector: '[data-tour="routines-header-actions"]',
      title: "Monte a sua semana",
      description:
        "Em Montar semana você escolhe quem quer visitar ou ligar, e o sistema separa por região e monta o caminho de cada dia.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="routines-grid"]',
      requireSelector: '[data-tour="routines-grid"]',
      title: "Seus compromissos",
      description:
        "Cada linha é um compromisso: visita, ligação ou, em roxo, a ligação combinada com o cliente. Clique para ver os detalhes e dizer o que aconteceu; em Agendar você marca uma ligação nova.",
      side: "top",
      align: "start",
    },
  ],
};
