import { FlowDefinition } from "../../../interface";
import { PROFILE_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour do Meu Perfil. Dispara sozinho na 1ª visita.
export const profileFlow: FlowDefinition = {
  key: PROFILE_FLOW,
  label: "Tour do Meu Perfil",
  description: "Atualize seus dados e a sua senha.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.profile,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="profile-info"]',
      title: "Seus dados",
      description:
        "Mantenha seu nome e suas informações de contato atualizados.",
      side: "right",
      align: "start",
    },
    {
      element: '[data-tour="profile-password"]',
      title: "Trocar a senha",
      description:
        "Aqui você altera a sua senha de acesso sempre que precisar.",
      side: "right",
      align: "start",
    },
  ],
};
