import { PlanFeature } from "./interface";

/**
 * Como cada recurso se chama para quem paga por ele. O backend manda o código
 * (`ROUTINES`); a frase é decisão de produto e mora do lado da tela.
 *
 * Descrição concreta, não abstrata: quem lê a lista está decidindo se troca de
 * plano, e "Motor de rotina" sozinho não diz o que se ganha.
 */
export const FEATURE_LABEL: Record<PlanFeature, string> = {
  ROUTINES: "Rotina de visitas",
  ANALYTICS: "Desempenho",
  REPORTS: "Relatórios",
  BULK_IMPORT: "Importação em massa",
  GOALS: "Metas",
  COMMISSIONS: "Comissões",
  NOTIFICATIONS: "Notificações",
};

export const FEATURE_DESCRIPTION: Record<PlanFeature, string> = {
  ROUTINES:
    "Rota do dia, agenda da semana e a pontuação que diz quem visitar primeiro.",
  ANALYTICS: "Gráficos de vendas, rankings e evolução por período.",
  REPORTS:
    "Faturamento, carteira, curva ABC e os demais relatórios de conferência.",
  BULK_IMPORT:
    "Carga de clientes, produtos e tabelas de preço por planilha, e pedido por PDF.",
  GOALS: "Metas por vendedor e fábrica, com o realizado ao lado.",
  COMMISSIONS: "Apuração, recebimento e conciliação das comissões.",
  NOTIFICATIONS: "Avisos automáticos do que precisa de atenção.",
};

/** Ordem de exibição — a mesma do enum no backend, para as duas telas contarem
 * a mesma história. */
export const FEATURE_ORDER: PlanFeature[] = [
  "ROUTINES",
  "ANALYTICS",
  "REPORTS",
  "BULK_IMPORT",
  "GOALS",
  "COMMISSIONS",
  "NOTIFICATIONS",
];
