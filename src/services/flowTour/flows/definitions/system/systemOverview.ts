import { FlowDefinition } from "../../../interface";
import { SYSTEM_OVERVIEW_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour de boas-vindas do sistema. Apresenta o menu lateral passo a passo.
 * Dispara sozinho na 1ª visita ao Dashboard. Como mira os itens da Sidebar
 * (sempre presentes, inclusive com o menu recolhido), é robusto e não depende
 * do conteúdo interno de cada página.
 *
 * Version 2 — o menu andou e o tour não:
 *
 * - O passo de Configurações mirava `[data-tour-route="/settings"]`, e esse
 *   item deixou de existir quando a configuração foi desdobrada em quatro
 *   destinos (Empresa, Pessoas, Plano, Catálogos). O alvo ausente era pulado em
 *   silêncio, então a área nunca era apresentada a ninguém. Agora mira Pessoas,
 *   que é o destino que todo gestor enxerga, e é gateado pelos papéis que veem
 *   a seção — o vendedor não tem nenhum destino de configuração, e para ele o
 *   passo some em vez de iluminar um item que não está lá.
 * - Insights e Comissões entraram no menu depois do tour e ficaram de fora da
 *   apresentação, apesar de serem uso diário.
 *
 * Os passos gateados por plano (Rotina, Comissões) são pulados sozinhos quando
 * a empresa não contratou: sem o item no menu, não há alvo para mirar.
 */
export const systemOverviewFlow: FlowDefinition = {
  key: SYSTEM_OVERVIEW_FLOW,
  label: "Tour do sistema",
  description: "Conheça o menu e as áreas principais do Girus.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.dashboard,
  version: 2,
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
      element: '[data-tour-route="/insights"]',
      title: "Insights",
      description:
        "O que precisa da sua atenção hoje e por quê: cliente sumido, boleto vencendo, meta atrasada. É por aqui que muita gente começa o dia.",
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
      element: '[data-tour-route="/commissions"]',
      title: "Comissões",
      description:
        "O que você tem a receber de cada fábrica, mês a mês, e o que já foi pago.",
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
      // Pessoas é o destino de configuração que todo gestor enxerga (owner,
      // admin e SU). O vendedor não vê nenhum, e por isso não vê este passo.
      element: '[data-tour-route="/settings/users"]',
      roles: ["OWNER", "ADMIN", "SU"],
      title: "Configurações",
      description:
        "Nesta última parte do menu ficam os ajustes da empresa: as pessoas da equipe, os dados da empresa, o seu plano e os catálogos que padronizam os cadastros.",
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
