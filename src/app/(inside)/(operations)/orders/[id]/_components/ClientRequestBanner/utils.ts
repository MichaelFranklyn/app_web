import { formatPercentPoints } from "@/utils/format/percent";
/** "7.50" → "7,5%". Vazio, zero ou ilegível → nulo (não houve pedido). */
export function formatDiscountRequest(raw?: string | null): string | null {
  const value = Number(raw ?? "");
  if (!raw || !Number.isFinite(value) || value <= 0) return null;
  return formatPercentPoints(value, 2, { trimZeros: true });
}
