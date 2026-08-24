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
 * A segunda-feira da semana de um dia ISO qualquer (aaaa-mm-dd).
 *
 * Recebe o dia em vez de olhar o relógio: é o que permite o SERVIDOR ancorar a
 * mesma semana que o navegador vai ancorar. Duas âncoras diferentes seriam duas
 * consultas diferentes, e o dado trazido no SSR não serviria para nada.
 */
export const weekMondayIso = (todayIso: string): string => {
  const [year, month, day] = todayIso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  const dayOfWeek = utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
  return toUtcIsoDate(utc);
};

/**
 * Hoje no fuso de Brasília (aaaa-mm-dd).
 *
 * `getTodayIso` lê o relógio DO AMBIENTE — no navegador de um vendedor isso é
 * o Brasil, mas no servidor da Vercel é UTC. Das 21h à meia-noite os dois
 * discordam do dia, e num domingo à noite discordariam da SEMANA inteira. O
 * backend já decide tudo em BRT (`today_brt`); o que o servidor calcula para a
 * tela tem de decidir igual.
 */
export const getBrtTodayIso = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/**
 * Retorna o ISO (aaaa-mm-dd, em UTC) do dia de hoje.
 * Usado para atalhos que apontam para "o dia atual" (ex.: rota do dia).
 */
export const getTodayIso = (): string => {
  const now = new Date();
  return toUtcIsoDate(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
};

/**
 * Formata uma data ISO para dd/mm/aaaa (pt-BR). Fonte única de formatação de
 * data curta no app — `formatDateDMY` (masks.ts) delega aqui.
 * @param fallback texto para data ausente/inválida. Padrão "—" (ideal para
 *   células de tabela); passe "" para contextos que concatenam a saída.
 */
export const formatDate = (date?: string | null, fallback = "—"): string => {
  if (!date) return fallback;
  // Data pura ("2026-05-31") é dia de calendário, não instante: `new Date` a
  // leria como meia-noite UTC e o Brasil (UTC-3) mostraria o dia anterior.
  // Datetime (com hora) continua no parse nativo, que é o instante de verdade.
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? parseLocalDate(date)
    : new Date(date);
  if (!parsed || Number.isNaN(parsed.getTime())) return fallback;
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
