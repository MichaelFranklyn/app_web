import type { KpiStatus } from "@/components/Card";

/**
 * O recorte que TODA aba de relatório respeita: um período e, para o gestor, um
 * vendedor. Vive na URL (ver `useReportFilters`) para trocar de aba não perder o
 * recorte e para um link levar o colega ao mesmo papel.
 */
export interface ReportFilters {
  from: string;
  to: string;
  /** `null` = a empresa toda. Vendedor é escopado pelo backend, não por aqui. */
  sellerId: string | null;
  /**
   * `null` = todas as representadas.
   *
   * Só a curva ABC usa hoje: é lá que a pergunta "quem mais compra NESTA
   * fábrica" tem a melhor resposta (lista completa, ordenada por valor e
   * exportável). Vive no recorte compartilhado porque mora na URL como os
   * outros — trocar de aba não deve perder o filtro, e a aba que não o consome
   * simplesmente o ignora.
   */
  factoryId: string | null;
}

/** Um número da faixa de resumo do relatório. */
export interface ReportKpi {
  label: string;
  value: string;
  /** Linha de apoio: o que o número significa, ou de que ele é fatia. */
  hint?: string;
  status?: KpiStatus;
}

/** Uma aba da barra de navegação dos relatórios. */
export interface ReportTab {
  /** Último segmento da rota (`/dashboard/reports/<slug>`). */
  slug: string;
  label: string;
}
