import { FlowDefinition } from "../../../interface";
import { USERS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour da lista de Pessoas. Version 2: /sellers virou esta tela — a lista é uma
 * só (vendedor é um usuário com perfil de campo).
 *
 * O passo das abas saiu quando "Acessos por Fábrica" deixou de existir (o
 * vínculo se edita no perfil da pessoa e na aba de vendedores da fábrica).
 * Sem bump de versão de propósito: quem já viu o tour não precisa revê-lo por
 * causa de um passo a MENOS, e quem vê pela primeira vez vê a tela como ela é.
 */
export const usersFlow: FlowDefinition = {
  key: USERS_FLOW,
  label: "Tour das Pessoas",
  description: "A equipe da empresa e quem vende em campo.",
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
      element: '[data-tour="users-table"]',
      title: "Uma lista só",
      description:
        'Quem vende em campo aparece com o selo "Vende em campo" e o resumo de fábricas e carteira. Clique na linha para abrir o perfil completo — é lá que se define quais fábricas a pessoa atende e quanto ela ganha em cada uma.',
      side: "top",
      align: "start",
    },
  ],
};
