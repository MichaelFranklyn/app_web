import { FlowDefinition } from "../../../interface";
import { PROFILE_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour do "Meu perfil" (/settings/user/[id]). Version 4: as abas deram lugar a
 * uma página só — cadastro, rotina, fábricas e carteira em sequência —, então o
 * primeiro passo agora apresenta a página inteira em vez de ensinar a clicar
 * numa aba.
 */
export const profileFlow: FlowDefinition = {
  key: PROFILE_FLOW,
  label: "Tour do perfil",
  description: "Seus dados, sua senha e — se você vende — rotina e carteira.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.myProfile,
  version: 4,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="user-profile-sections"]',
      title: "Tudo o que é seu em um lugar",
      description:
        "Esta página tem os seus dados e o seu acesso. Quem vende em campo encontra logo abaixo a sua rotina, as suas fábricas e a sua carteira de clientes — basta rolar a tela.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="profile-info"]',
      title: "Seus dados",
      description:
        'Clique em "Editar dados pessoais" para atualizar telefone, endereço e data de nascimento.',
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="profile-password"]',
      title: "Trocar a senha",
      description:
        'Em "Alterar senha" você troca a sua senha de acesso sempre que precisar.',
      side: "top",
      align: "start",
    },
  ],
};
