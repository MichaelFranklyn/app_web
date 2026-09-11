import { FlowDefinition } from "../../../interface";
import { INSIGHTS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour dos Insights. Dispara sozinho na 1ª visita.
 *
 * A tela é a que mais precisa de apresentação e era a que não tinha: ela não
 * mostra CADASTRO nenhum, e sim uma leitura feita na hora. Quem abre sem saber
 * disso confunde com o sino de notificações — e a diferença (uma é histórico do
 * que o sistema avisou, a outra é o que está pendente agora) é o que faz a tela
 * valer.
 */
export const insightsFlow: FlowDefinition = {
  key: INSIGHTS_FLOW,
  label: "Tour dos Insights",
  description: "O que está pendente agora e por que cada coisa custa venda.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.insights,
  version: 1,
  autoStart: true,
  steps: [
    {
      title: "O que fazer agora",
      description:
        "Esta tela não guarda cadastro: ela olha a sua carteira, os pedidos, os boletos e as metas e escreve o que está pendente HOJE. Resolveu, sai da lista.",
    },
    {
      element: '[data-tour="insights-seller"]',
      roles: ["OWNER", "ADMIN", "SU"],
      title: "De quem é a lista",
      description:
        "Escolha um vendedor para ver só as pendências dele. Sem escolher, a tela mostra as da empresa toda.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="insights-summary"]',
      requireSelector: '[data-tour="insights-summary"]',
      title: "O tamanho do problema",
      description:
        "Quantos assuntos estão abertos, quantos são para hoje e quanto dinheiro está parado neles.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="insights-card"]',
      requireSelector: '[data-tour="insights-card"]',
      title: "Cada pendência explica o porquê",
      description:
        "O cartão traz o número, o motivo pelo qual aquilo custa venda e o caminho para resolver — clique nele para ir direto ao lugar.",
      side: "right",
      align: "start",
    },
    {
      element: '[data-tour="insights-refresh"]',
      requireSelector: '[data-tour="insights-refresh"]',
      title: "A leitura tem hora",
      description:
        'Embaixo fica a hora em que a conta foi feita. Acabou de fechar um pedido? Clique em "Atualizar" que a lista reconta.',
      side: "top",
      align: "center",
    },
  ],
};
