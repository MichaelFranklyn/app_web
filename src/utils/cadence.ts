/**
 * De quanto em quanto tempo o cliente compra — e de onde esse número saiu.
 *
 * Espelha `cadence.py`. Existe como util próprio porque a PROCEDÊNCIA importa
 * tanto quanto o número: até 2026-08-04 o ciclo digitado no cadastro vencia
 * sempre, com o argumento de que "quem digitou combinou com o cliente". O campo
 * mostrou o contrário — às vezes a média do vendedor não é uma média real, e
 * ele acha que passa lá todo mês enquanto os pedidos saem a cada 45 dias.
 *
 * Agora a recorrência observada arbitra, e a tela precisa dizer isso: mostrar só
 * "45 dias" esconderia do vendedor justamente a informação que ele não tem como
 * ter na cabeça — o intervalo real entre os últimos doze pedidos daquele
 * cliente.
 */

export type CadenceSource =
  | "observada"
  | "declarada"
  | "combinada"
  | "desconhecida";

export interface Cadence {
  days: number | null;
  source: CadenceSource;
  isDivergent: boolean;
  declaredDays: number | null;
  observedDays: number | null;
  nextOrderDue: string | null;
  nextVisitEstimate: string | null;
  divergenceMessage: string | null;
}

/** De onde o número veio, em uma expressão curta para a célula da tabela. */
const SOURCE_LABEL: Record<CadenceSource, string> = {
  observada: "pelos pedidos",
  declarada: "estimado por você",
  combinada: "combinado no cadastro",
  desconhecida: "",
};

export const cadenceSourceLabel = (source: CadenceSource): string =>
  SOURCE_LABEL[source] ?? "";

/**
 * O ciclo em texto: "45 dias" ou "—".
 *
 * Não recebe fallback para `visitFrequencyDays`/`orderIntervalDays` de
 * propósito. A tela mostrava o cadastrado e, na falta dele, o dos pedidos —
 * reproduzindo no front a precedência que o backend abandonou. Duas regras
 * divergentes para o mesmo número é como o vendedor perde a confiança na tela.
 */
export const cadenceDaysLabel = (cadence: Cadence | null): string =>
  cadence?.days != null ? `${cadence.days} dias` : "—";
