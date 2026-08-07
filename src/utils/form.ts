/**
 * Extrai o valor de um campo do FormBuilder.
 *
 * Selects retornam `{ label, value }`; demais campos retornam o valor direto.
 * Normaliza ambos para `string`.
 */
export const extractSelectValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: unknown }).value)
    : String(raw ?? "");

/**
 * Normaliza o campo "prazo de entrega (dias)" do FormBuilder.
 *
 * Vazio → `null` (o backend aplica o prazo padrão da fábrica). Número válido e
 * não-negativo → inteiro arredondado. Lixo → `null`.
 */
export const parseDeliveryDays = (raw: unknown): number | null => {
  const text = String(raw ?? "").trim();
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

/**
 * Normaliza o campo "esse pedido dura quantos dias?" do FormBuilder.
 *
 * É a estimativa de campo do vendedor sobre quanto tempo a mercadoria segura a
 * loja, e a porta por onde esse conhecimento entra no motor de rotina: ele lança
 * pedido toda semana e quase nunca conclui visita. Alimenta a cadência de compra
 * e, na primeira compra de um produto, a duração de prateleira dele — que sem
 * isso cai num padrão de 30 dias igual para todo mundo.
 *
 * Vazio → `null`. O backend ainda descarta o que estiver fora da faixa plausível
 * (`MIN_COVERAGE_DAYS`/`MAX_COVERAGE_DAYS`): "3" digitado no lugar de "30" faria
 * o motor recomendar visita toda semana, e um dado errado é pior que nenhum.
 */
export const parseCoverageDays = (raw: unknown): number | null => {
  const text = String(raw ?? "").trim();
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};
