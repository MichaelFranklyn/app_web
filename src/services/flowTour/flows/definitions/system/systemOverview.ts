import { FlowDefinition } from "../../../interface";
import { SYSTEM_OVERVIEW_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour de boas-vindas do sistema. Apresenta o menu lateral passo a passo. Dispara
// sozinho na 1ª visita ao Dashboard. Como mira os itens da Sidebar (sempre presentes),
// é robusto e não depende do conteúdo interno de cada página.
export const systemOverviewFlow: FlowDefinition = {
  key: SYSTEM_OVERVIEW_FLOW,
  label: "Tour do sistema",
  description: "Conheça o menu e as áreas principais do Girus.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.dashboard,
  version: 1,
  autoStart: true,
  steps: [
    {
      title: "Bem-vindo ao Girus!",
      description:
        "Vamos fazer um tour rápido pelas áreas principais do sistema. É curtinho — leva menos de um minuto.",
    },
    {
      element: '[data-tour-route="/dashboard"]',
      title: "Dashboard",
      description:
        "Esta é a sua página inicial. Aqui você vê um resumo dos seus números e do dia a dia.",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour-route="/routines"]',
      title: "Rotina da Semana",
      description:
        "Aqui ficam suas visitas planejadas para a semana — quem visitar e quando.",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour-route="/orders"]',
      title: "Pedidos",
      description:
        "Registre e acompanhe os pedidos dos seus clientes. Você também pode importar pedidos de PDF ou planilha.",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour-route="/clients"]',
      title: "Clientes",
      description:
        "Sua carteira de clientes. Abra um cliente para ver os detalhes e o histórico dele.",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour-route="/factories"]',
      title: "Fábricas",
      description:
        "As fábricas que você representa, com catálogos, tabelas de preço e impostos.",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour-route="/settings"]',
      title: "Configurações",
      description:
        "Por aqui você ajusta as configurações da sua conta e da empresa.",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour="flowtour-launcher"]',
      title: "Precisa rever?",
      description:
        "Sempre que quiser repetir um tutorial, clique neste botão de ajuda. Ele mostra os tours disponíveis em cada página.",
      side: "left",
      align: "end",
    },
  ],
};
