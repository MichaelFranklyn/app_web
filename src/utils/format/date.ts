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

/** O fuso do negócio (o backend decide tudo em `today_brt`). */
export const BRT_TIME_ZONE = "America/Sao_Paulo";

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
    timeZone: BRT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const isoDayToUtcMs = (iso: string): number => {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

/** Dias corridos de `fromIso` até `todayIso` (datas aaaa-mm-dd, sem hora). */
export const daysBetweenIso = (fromIso: string, todayIso: string): number =>
  Math.round((isoDayToUtcMs(todayIso) - isoDayToUtcMs(fromIso)) / 86_400_000);

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
 * @param timeZone fuso fixo para um instante — `BRT_TIME_ZONE` em tela servida
 *   pelo servidor (UTC), onde um envio às 22h de segunda sairia como terça.
 */
export const formatDate = (
  date?: string | null,
  fallback = "—",
  { timeZone }: { timeZone?: string } = {}
): string => {
  if (!date) return fallback;
  // Data pura ("2026-05-31") é dia de calendário, não instante: `new Date` a
  // leria como meia-noite UTC e o Brasil (UTC-3) mostraria o dia anterior.
  // Datetime (com hora) continua no parse nativo, que é o instante de verdade.
  const isCalendarDay = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const parsed = isCalendarDay ? parseLocalDate(date) : new Date(date);
  if (!parsed || Number.isNaN(parsed.getTime())) return fallback;
  // O fuso só vale para um instante: o dia de calendário já é o dia.
  return parsed.toLocaleDateString(
    "pt-BR",
    isCalendarDay || !timeZone ? undefined : { timeZone }
  );
};

interface DateTimeOptions {
  /** Ano com 2 dígitos ("24/11/26 14:05"). Padrão: sim. */
  withYear?: boolean;
  /** Segundos, para distinguir eventos do mesmo minuto em um log. */
  withSeconds?: boolean;
  /** Fuso fixo (ex.: "America/Sao_Paulo"). Padrão: o do navegador. */
  timeZone?: string;
}

/**
 * Instante ISO → "24/11/26 14:05" (pt-BR, fuso do navegador). Fonte única do
 * "data e hora" das listas de atividade e auditoria — cada uma tinha a sua
 * cópia de `toLocaleString` com as opções escritas à mão.
 */
export const formatDateTime = (
  iso?: string | null,
  { withYear = true, withSeconds = false, timeZone }: DateTimeOptions = {}
): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    ...(withYear ? { year: "2-digit" } : {}),
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
  });
};

/**
 * Instante de um registro (atividade, auditoria, execução de job, email) →
 * "24/11/26 14:05:33". Fonte única do console da plataforma: até 24/11/2026
 * eram sete `formatMoment` locais em três formatos — com ano ou sem, com
 * segundos ou sem —, e a mesma ação aparecia diferente em cada tela. Ano,
 * porque o log atravessa a virada; segundos, porque a sequência do minuto é o
 * que se reconstrói ao investigar.
 */
export const formatLogMoment = (iso?: string | null): string =>
  formatDateTime(iso, { withSeconds: true });

/**
 * Instante ISO → só a hora, "14:05". Para "atualizado às 14:05" de uma tela
 * que é do dia. Vazio ou inválido vira "—".
 */
export const formatTime = (
  iso?: string | null,
  { timeZone }: Pick<DateTimeOptions, "timeZone"> = {}
): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Instante ISO → "26/09 às 14:32" (ou "17/11/2026 às 14:32" com
 * `withYear`) — o momento de um evento dito em frase, não em coluna de log.
 */
export const formatDateAtTime = (
  iso?: string | null,
  {
    withYear = false,
    timeZone,
  }: Pick<DateTimeOptions, "withYear" | "timeZone"> = {}
): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    ...(withYear ? { year: "numeric" } : {}),
  });
  return `${day} às ${formatTime(iso, { timeZone })}`;
};

/**
 * Dia de calendário ("2026-09-21") → "segunda-feira". Lido em UTC para não
 * escorregar um dia no fuso do navegador.
 */
export const formatWeekday = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  });

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
