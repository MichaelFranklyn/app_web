// Filtros compartilhados por todos os gráficos da aba (escopam via query própria).
export interface ChartFilters {
  from: string;
  to: string;
  sellerId: string | null;
}

/**
 * Texto do "?" ao lado do título do gráfico. São três perguntas fixas, sempre
 * na mesma ordem, para quem abre o tooltip não precisar caçar a informação:
 * o que está desenhado, como se lê o desenho e que sinal procurar nele.
 */
export interface ChartHelp {
  /** Que informação o gráfico traz, numa frase. */
  what: string;
  /** O que é cada barra, linha, fatia ou cor. */
  read: string;
  /** O sinal que vale a pena procurar — o "e daí?" do gráfico. */
  watch: string;
  /** Como resumir os números que estão na tela agora (ver chartInsight.ts). */
  insight?: ChartInsightSpec;
}

/** Unidade dos valores da série — decide só a formatação da frase. */
export type ChartUnit = "money" | "days" | "count" | "percent";

/**
 * Receita da leitura automática de um gráfico. O `kind` escolhe qual pergunta
 * a frase responde; os demais campos são o que não dá para adivinhar olhando
 * só os números (se somam, se estar no topo é bom ou ruim, como chamar as
 * categorias).
 */
export interface ChartInsightSpec {
  kind: /** Uma série ao longo dos meses: último mês fechado vs. o anterior. */
    | "trend"
    /** Várias séries ao longo dos meses: quem lidera o período. */
    | "leader"
    /** Barras por entidade: quem está no topo. */
    | "ranking"
    /** Rosca: qual a maior fatia. */
    | "share"
    /** Barra + linha acumulada: quanto os maiores concentram. */
    | "concentration"
    /** Barra de volume + linha de taxa: a taxa média do período. */
    | "rate"
    /** Barras empilhadas: o peso de cada parte no total. */
    | "stacked"
    /** Duas barras por entidade: em quantas a segunda passa da primeira. */
    | "compare";
  unit: ChartUnit;
  /** Como chamar as categorias, no plural: "clientes", "fábricas", "meses". */
  subject: string;
  /** Valores que fazem sentido somar. Médias, taxas e prazos não somam. */
  additive?: boolean;
  /** Ranking em que o topo é problema (dias parados, intervalo longo). */
  topIsBad?: boolean;
}
