/**
 * Formata um Date para ISO (aaaa-mm-dd) usando os campos em UTC.
 * (Diferente de {@link toIsoDate}, que usa o horário local.)
 */
export const toUtcIsoDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Retorna o ISO (aaaa-mm-dd, em UTC) da segunda-feira da semana atual.
 * Usado para ancorar grades semanais (rotinas, dashboard).
 */
export const getCurrentWeekMondayIso = (): string => {
  const now = new Date();
  const utc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  const dayOfWeek = utc.getUTCDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  utc.setUTCDate(utc.getUTCDate() + offsetToMonday);
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data ISO para dd/mm/aaaa (pt-BR).
 * Retorna "—" se a data for ausente ou inválida (ideal para células de tabela).
 */
export const formatDate = (date?: string | null): string => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("pt-BR");
};

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
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  const str = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
