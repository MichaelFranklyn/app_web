/**
 * Prioridade do vínculo cliente × fábrica: opções, rótulo/cor e as grafias
 * legadas. Mora em `utils` porque duas telas de grupos diferentes a leem — a
 * aba de clientes da fábrica e a carteira no perfil da pessoa.
 */

// Valores no vocabulário canônico do backend (enum ClientPriority: alta/media/
// baixa). O score só pontua a prioridade nesses termos — mandar "high"/"medium"/
// "low" fazia a dimensão priority cair sempre em 0 e o score não mexer.
export const PRIORITY_OPTIONS = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

type BadgeColor = "red" | "amber" | "subtle" | "neutral";

const PRIORITY_META: Record<string, { label: string; color: BadgeColor }> = {
  alta: { label: "Alta", color: "red" },
  media: { label: "Média", color: "amber" },
  baixa: { label: "Baixa", color: "subtle" },
  // Aliases legados: vínculos salvos antes do alinhamento de vocabulário.
  high: { label: "Alta", color: "red" },
  medium: { label: "Média", color: "amber" },
  low: { label: "Baixa", color: "subtle" },
};

export const priorityMeta = (
  priority: string | null
): { label: string; color: BadgeColor } =>
  (priority && PRIORITY_META[priority]) || { label: "—", color: "neutral" };

/**
 * As grafias que cada escolha do filtro precisa casar no banco.
 *
 * O vocabulário canônico é "alta"/"media"/"baixa"; vínculos salvos antes do
 * alinhamento guardam "high"/"medium"/"low" (ver o mapa acima). Filtrando no
 * BANCO por um valor só, esses registros sumiriam da lista sem nada avisar —
 * o filtro em memória, que comparava pelo rótulo já traduzido, pegava os dois.
 */
export const PRIORITY_ALIASES: Record<string, string[]> = {
  alta: ["alta", "high"],
  media: ["media", "medium"],
  baixa: ["baixa", "low"],
};
