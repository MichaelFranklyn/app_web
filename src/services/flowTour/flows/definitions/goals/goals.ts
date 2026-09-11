import { FlowDefinition } from "../../../interface";
import { GOALS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour das Metas. Dispara sozinho na 1ª visita.
 *
 * A tela é a mesma para quem define e para quem cumpre, e o tour acompanha:
 * os passos de definir meta são gateados por papel, e o texto do primeiro muda
 * conforme quem está lendo (`roleText`) — para o gestor é "o combinado da
 * equipe", para o vendedor é "o seu combinado".
 */
export const goalsFlow: FlowDefinition = {
  key: GOALS_FLOW,
  label: "Tour das Metas",
  description: "O combinado do mês e o quanto já foi feito.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.goals,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="goals-month"]',
      title: "Um mês por vez",
      description:
        "Meta é sempre de um mês. Ande com as setas ou clique no nome do mês para voltar ao atual — tudo o que vem abaixo acompanha.",
      roleText: [
        {
          roles: ["SELLER"],
          description:
            "As suas metas são sempre de um mês. Ande com as setas ou clique no nome do mês para voltar ao atual.",
        },
      ],
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="goals-seller"]',
      roles: ["OWNER", "ADMIN", "SU"],
      title: "De quem é a meta",
      description:
        "Escolha um vendedor para ver só as metas dele. Sem escolher, a tela soma a equipe inteira.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="goals-actions"]',
      roles: ["OWNER", "ADMIN", "SU"],
      title: "Definir e repetir",
      description:
        'Combine a meta de um vendedor numa fábrica, ou use "Copiar metas" para repetir o mês anterior sem digitar tudo de novo.',
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="goals-kpis"]',
      requireSelector: '[data-tour="goals-kpis"]',
      title: "Quatro alvos, não um",
      description:
        "Faturado, vendido, clientes que compraram e visitas concluídas. Cada meta é opcional: o que não foi combinado não cobra nada.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="goals-table"]',
      requireSelector: '[data-tour="goals-table"]',
      title: "Meta por fábrica",
      description:
        "O realizado não se digita — sai dos pedidos e das visitas. Clique numa linha para abrir a pessoa e mexer fábrica por fábrica.",
      roleText: [
        {
          roles: ["SELLER"],
          description:
            "O realizado não se digita: sai dos seus pedidos e das suas visitas, fábrica por fábrica.",
        },
      ],
      side: "top",
      align: "start",
    },
  ],
};
