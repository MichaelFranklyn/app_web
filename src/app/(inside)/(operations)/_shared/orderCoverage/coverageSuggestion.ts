/**
 * A sugestão de "dura quantos dias na loja?" no fechamento do pedido.
 *
 * POR QUE ISTO EXISTE. `orders.coverageDays` é o campo mais barato e mais
 * valioso do sistema: é a única fonte que descreve a DURAÇÃO do que o cliente
 * comprou. Sem ele, o motor de rotina estima a prateleira pelo intervalo entre
 * pedidos — que na base real mede o ciclo do PEDIDO MÍNIMO (mediana de 94 dias),
 * não o consumo. O degrau existe em `resolve_shelf_days` e em `resolve_cadence`
 * há tempos, dos dois lados.
 *
 * E estava vazio: **0 de 265 pedidos** tinham cobertura declarada (medido em
 * 07/08/2026). Um campo opcional, numérico, no fim do formulário, ao lado das
 * observações, é um campo que ninguém preenche — e a informação que ele coleta é
 * a que faria o motor parar de adivinhar.
 *
 * A correção não é obrigar: é CHEGAR PREENCHIDO. Confirmar um número plausível
 * custa um olhar; digitá-lo do zero custa uma decisão. A sugestão sai da
 * cadência que o sistema já calcula para aquele vínculo — a recorrência real dos
 * pedidos, ou a mediana da fábrica quando o cliente ainda não tem histórico.
 */

/** Como o vínculo devolve a cadência (subconjunto de `CadenceType`). */
export interface CoverageCadence {
  days: number | null;
  source: string;
}

/**
 * Limites de plausibilidade — os mesmos de `cadence.py` no backend
 * (`MIN_COVERAGE_DAYS` / `MAX_COVERAGE_DAYS`). Sugerir fora disso seria propor
 * ao vendedor que confirmasse um número que o próprio motor vai descartar.
 */
export const MIN_COVERAGE_DAYS = 3;
export const MAX_COVERAGE_DAYS = 365;

/**
 * O número a sugerir, ou `null` quando não há base para sugerir nada.
 *
 * Cadência `desconhecida` não vira sugestão: ali o sistema não sabe, e um chute
 * pré-preenchido viraria dado declarado — pior que o vazio, porque o vendedor
 * confirmaria sem pensar e o motor trataria como estimativa de campo.
 */
export function suggestCoverageDays(
  cadence: CoverageCadence | null | undefined
): number | null {
  if (!cadence?.days || cadence.source === "desconhecida") return null;
  const days = Math.round(cadence.days);
  if (days < MIN_COVERAGE_DAYS || days > MAX_COVERAGE_DAYS) return null;
  return days;
}

/**
 * O texto de apoio do campo, dizendo de onde veio o número sugerido.
 *
 * A procedência importa para o vendedor decidir se corrige: "os pedidos dele
 * saem a cada 45 dias" é uma afirmação sobre AQUELE cliente, e "clientes desta
 * fábrica repõem a cada 92" é uma média que ele provavelmente sabe ajustar.
 */
export function coverageHint(
  cadence: CoverageCadence | null | undefined
): string {
  const suggested = suggestCoverageDays(cadence);
  if (suggested === null) {
    return "Sua estimativa de quanto tempo esta compra segura o cliente. É o que ensina a rotina a saber quando voltar.";
  }
  if (cadence?.source === "observada") {
    return `Sugerimos ${suggested} dias: é o intervalo entre os últimos pedidos deste cliente. Corrija se esta compra for maior ou menor que o normal.`;
  }
  if (cadence?.source === "tipica") {
    return `Sugerimos ${suggested} dias, que é o ritmo dos clientes desta fábrica. Este cliente ainda não tem histórico — corrigir aqui ensina a rotina.`;
  }
  return `Sugerimos ${suggested} dias com base no que já foi informado. Corrija se esta compra for maior ou menor que o normal.`;
}

/**
 * O mapa cliente → cadência a partir das arestas da lista de vínculos.
 *
 * Vive aqui porque os quatro pontos de entrada de pedido (criar e importar, em
 * /orders e na aba da fábrica) precisam exatamente do mesmo mapa a partir da
 * mesma consulta — e sugestão que só funciona em um dos caminhos é sugestão que
 * o vendedor aprende a não esperar.
 */
export function cadenceByClientFrom(
  edges:
    | { node: { clientId: string; cadence?: CoverageCadence | null } }[]
    | undefined
): Map<string, CoverageCadence> {
  const map = new Map<string, CoverageCadence>();
  edges?.forEach(({ node }) => {
    if (node.cadence) map.set(node.clientId, node.cadence);
  });
  return map;
}
