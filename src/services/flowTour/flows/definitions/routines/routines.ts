import { FlowDefinition } from "../../../interface";
import { ROUTINES_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da Agenda. Dispara sozinho na 1ª visita (versão 3: a agenda deixou de vir
// pronta em 18/10/2026 — quem já tinha visto o tour antigo vê o novo uma vez;
// versão 4: o cabeçalho separou "Montar semana" do navegador de semana). Os passos de período/grade
// usam requireSelector para serem pulados quando não há rotina na semana (empty state).
export const routinesFlow: FlowDefinition = {
  key: ROUTINES_FLOW,
  label: "Tour da Agenda",
  description: "Monte a sua semana e acompanhe as visitas de cada dia.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.routines,
  version: 4,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="routines-header-actions"]',
      title: "Monte a sua semana",
      description:
        "Em Montar semana você escolhe quem quer visitar ou ligar, e o sistema separa por região e monta o caminho de cada dia.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="routines-week-nav"]',
      title: "Qual semana",
      description:
        "Use as setas ou o calendário para ver outra semana. Como administrador, aqui você também escolhe o vendedor.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="routines-period"]',
      requireSelector: '[data-tour="routines-period"]',
      title: "Período exibido",
      description:
        "Escolha quanto da rotina ver de uma vez: só hoje, 3 dias, 5 dias ou a semana inteira.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="routines-view-toggle"]',
      requireSelector: '[data-tour="routines-view-toggle"]',
      title: "Kanban ou lista",
      description:
        "Escolha como ver a rotina: em quadro (Kanban), com uma coluna por dia, ou em lista, com as visitas de cada dia empilhadas.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="routines-grid"]',
      requireSelector: '[data-tour="routines-grid"]',
      title: "Suas visitas",
      description:
        "Aqui ficam as visitas planejadas por dia. Você pode registrar o que aconteceu em cada visita.",
      side: "top",
      align: "start",
    },
  ],
};
