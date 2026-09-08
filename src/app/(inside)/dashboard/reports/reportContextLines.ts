/**
 * As linhas de recorte que vão no cabeçalho do documento exportado.
 *
 * Fora do hook porque é regra, não efeito: um relatório recortado e impresso
 * sem dizer o recorte é lido como se fosse a carteira inteira — e é assim que
 * uma reunião discute o número errado. A concentração de uma curva ABC de UMA
 * representada não tem nada a ver com a da empresa toda.
 *
 * Pura e testável de fora; o hook (`useReportContext`) fica só com o que
 * depende das queries: resolver o NOME do vendedor e da fábrica a partir do id.
 */
export interface ContextNames {
  /** Período já formatado ("01/07/2026 a 31/07/2026"). */
  periodLabel: string;
  /** Nome do vendedor do recorte, ou `null` para a empresa toda. */
  sellerName: string | null;
  /** Fábrica escolhida. `null` aqui significa "há recorte e o nome não veio". */
  factoryName: string | null;
  /** Houve escolha de fábrica? Distingue "todas" de "esta, sem nome ainda". */
  hasFactoryFilter: boolean;
}

export const buildReportContextLines = ({
  periodLabel,
  sellerName,
  factoryName,
  hasFactoryFilter,
}: ContextNames): string[] =>
  [
    `Período: ${periodLabel}`,
    // Sem vendedor escolhido o documento cobre a empresa toda, e é isso que o
    // papel precisa afirmar — a ausência da linha seria lida como omissão.
    `Vendedor: ${sellerName ?? "todos"}`,
    // Só quando há recorte: numa aba que não filtra por fábrica, "Fábrica:
    // todas" é ruído afirmando o óbvio. Com recorte e sem nome resolvido, o
    // travessão diz "há recorte, o nome não veio" — menos errado que silêncio.
    hasFactoryFilter ? `Fábrica: ${factoryName ?? "—"}` : null,
  ].filter((linha): linha is string => linha !== null);
