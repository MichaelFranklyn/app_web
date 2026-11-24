/**
 * Duração medida em milissegundos, no formato brasileiro: "340ms", "2,4s",
 * "2min". Acima de um segundo passa a segundos (2400ms é mais difícil de ler
 * do que 2,4s, e é na faixa lenta que o número importa); acima de um minuto,
 * a minutos inteiros.
 *
 * Antes havia quatro cópias no console `/platform`, todas com
 * `toFixed(1)` — e por isso com PONTO decimal ("2.4s").
 */
export const formatDuration = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000)
    return `${(ms / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}s`;
  return `${Math.round(ms / 60_000)}min`;
};
