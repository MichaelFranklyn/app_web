import { FlowDefinition } from "../../../interface";
import { USERS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da listagem de Usuários. Dispara sozinho na 1ª visita.
export const usersFlow: FlowDefinition = {
  key: USERS_FLOW,
  label: "Tour dos Usuários",
  description: "Como adicionar e gerenciar os usuários da empresa.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.users,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="users-actions"]',
      title: "Adicionar usuário",
      description:
        "Cadastre um novo usuário da empresa ou exporte a lista atual.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="users-search"]',
      title: "Buscar usuário",
      description: "Encontre um usuário pelo nome.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="users-table"]',
      title: "Lista de usuários",
      description:
        "Aqui ficam todos os usuários, com o papel de cada um. Você pode editar ou desativar a partir da linha.",
      side: "top",
      align: "start",
    },
  ],
};
