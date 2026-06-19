export const toIsoDate = (value: unknown): string => {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(value).trim();
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Converte uma data vinda do back (ex.: "2026-05-31") em um Date no fuso LOCAL.
 *
 * `new Date("2026-05-31")` interpreta a string como meia-noite UTC, que em
 * fusos negativos (BR, UTC-3) é exibida como o dia anterior. Aqui montamos o
 * Date com os componentes locais, mantendo o dia exatamente como informado.
 */
export const parseLocalDate = (value: unknown): Date | null => {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const str = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
