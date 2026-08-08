import { toUtcIsoDate } from "@/utils/format/date";

/**
 * Como um compromisso fixo se lê em português.
 *
 * O gestor cadastra "toda terça, quinzenal, a partir de 15/09" e precisa
 * conferir se foi isso mesmo que ele quis dizer. O risco não é o erro de
 * digitação: é a cadência combinada com o dia da semana produzir um calendário
 * diferente do que ele imaginou — "quinzenal na terça" não diz se a próxima é
 * dia 11 ou dia 18. Por isso a tabela mostra as PRÓXIMAS DATAS, que o backend
 * calcula a partir da mesma âncora que vai gerar as visitas.
 */

/** ISO weekday (1=segunda .. 7=domingo), o mesmo do backend. */
export const WEEKDAY_LABEL: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

/** Opções do select de dia da semana, na ordem da semana. */
export const WEEKDAY_OPTIONS = Object.entries(WEEKDAY_LABEL).map(
  ([value, label]) => ({ value, label })
);

/**
 * Cadências aceitas, em semanas — as mesmas do backend.
 *
 * A lista é curta de propósito: a rota fixa só funciona se o cliente ESPERA o
 * vendedor no dia, e um intervalo livre em dias vira um compromisso que ninguém
 * memoriza.
 */
export const CADENCE_OPTIONS = [
  { value: "1", label: "Toda semana" },
  { value: "2", label: "De 15 em 15 dias" },
  { value: "3", label: "A cada 3 semanas" },
  { value: "4", label: "Uma vez por mês" },
];

const CADENCE_LABEL = new Map(
  CADENCE_OPTIONS.map(({ value, label }) => [Number(value), label])
);

export const cadenceLabel = (intervalWeeks: number): string =>
  CADENCE_LABEL.get(intervalWeeks) ?? `A cada ${intervalWeeks} semanas`;

export const weekdayLabel = (weekday: number): string =>
  WEEKDAY_LABEL[weekday] ?? "—";

/** "Toda terça-feira" / "Terça-feira, de 15 em 15 dias". */
export const scheduleSummary = (
  weekday: number,
  intervalWeeks: number
): string =>
  intervalWeeks === 1
    ? `Toda ${weekdayLabel(weekday).toLowerCase()}`
    : `${weekdayLabel(weekday)}, ${cadenceLabel(intervalWeeks).toLowerCase()}`;

/**
 * Data opcional do FormBuilder → ISO, ou `null` quando o campo ficou vazio.
 *
 * O campo devolve um `Date` no fuso LOCAL quando o usuário escolhe no
 * calendário, e a string ISO de volta quando o valor veio de `initialData`
 * (edição). Cortar a string de um `Date` local devolveria o dia anterior no
 * fuso do Brasil — o erro clássico deste campo —, então o `Date` passa por
 * `toUtcIsoDate` e a string ISO, que já está no formato certo, passa direto.
 */
export const optionalIsoDate = (raw: unknown): string | null => {
  if (raw instanceof Date) return toUtcIsoDate(raw);
  const text = String(raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : null;
};

/**
 * "11/08 · 25/08 · 08/09" — as próximas ocorrências, em dia/mês.
 *
 * As datas chegam do backend em ISO (`YYYY-MM-DD`) e são formatadas por corte de
 * string, sem passar por `new Date`: uma data sem hora é interpretada como UTC
 * pelo JS, e no fuso do Brasil ela voltaria um dia — a terça viraria segunda na
 * tela, justamente no campo que existe para o gestor conferir o dia da semana.
 */
export const formatOccurrences = (
  dates: string[] | null | undefined
): string => {
  if (!dates || dates.length === 0) return "—";
  return dates
    .map((iso) => {
      const [, month, day] = iso.split("-");
      return month && day ? `${day}/${month}` : iso;
    })
    .join(" · ");
};
