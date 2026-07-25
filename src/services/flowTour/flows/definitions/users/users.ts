import { FlowDefinition } from "../../../interface";
import { USERS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour da lista de Pessoas. Version 2: /sellers virou esta tela — a lista é uma
 * só (vendedor é um usuário com perfil de campo) e os acessos por fábrica
 * entraram como aba aqui.
 */
export const usersFlow: FlowDefinition = {
  key: USERS_FLOW,
  label: "Tour das Pessoas",
  description: "A equipe da empresa, quem vende em campo e os acessos.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.users,
  version: 2,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="users-actions"]',
      title: "Adicionar alguém",
      description:
        "Cadastre uma pessoa da empresa ou exporte a lista atual. Ao escolher o perfil Vendedor, ela já nasce podendo operar em campo.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="users-tabs"]',
      title: "Pessoas e acessos",
      description:
        'Em "Pessoas" está toda a equipe. Em "Acessos por Fábrica" você define quais fábricas cada vendedor atende.',
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="users-table"]',
      title: "Uma lista só",
      description:
        'Quem vende em campo aparece com o selo "Vende em campo" e o resumo de fábricas e carteira. Clique na linha para abrir o perfil completo.',
      side: "top",
      align: "start",
    },
  ],
};
