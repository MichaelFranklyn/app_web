import { FlowDefinition } from "../../../interface";
import { ROUTINES_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da Rotina da Semana. Dispara sozinho na 1ª visita. Os passos de período/grade
// usam requireSelector para serem pulados quando não há rotina na semana (empty state).
export const routinesFlow: FlowDefinition = {
  key: ROUTINES_FLOW,
  label: "Tour da Rotina da Semana",
  description: "Acompanhe e organize as visitas planejadas da semana.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.routines,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="routines-header-actions"]',
      title: "Semana e vendedor",
      description:
        "Navegue entre as semanas e volte para a semana atual. Como administrador, você também escolhe de qual vendedor quer ver a rotina.",
      side: "bottom",
      align: "end",
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
