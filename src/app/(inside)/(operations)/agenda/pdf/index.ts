import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { drawReportHeader } from "@/utils/pdf/reportHeader";
import { PAGE, Pdf } from "@/utils/pdf/theme";
import { VisitScheduleDay } from "../interface";
import {
  buildWeekDays,
  formatDistanceKm,
  formatMinutes,
  formatWeekRange,
} from "../utils";
import { DaySection, drawDaySection } from "./daySection";
import { buildQrDataUrl, drawResponseBlock } from "./responseBlock";

export interface WeekRoutinePdfMeta {
  weekStart: string;
  sellerName?: string | null;
  /** Dias que o vendedor marcou como não trabalhados (ISO). */
  dayOffDates?: string[];
  companyName?: string | null;
  companyLogoUrl?: string | null;
  /**
   * Endereço do formulário de resposta da semana. Presente → a folha fecha
   * com o QR; ausente (emissão falhou) → sai sem o bloco.
   */
  responseUrl?: string | null;
}

/**
 * Os sete dias da semana em seções prontas para desenhar, presencial separado
 * de ligação.
 *
 * Os sete saem sempre, inclusive os sem rotina: a folha é usada para conferir a
 * semana, e um dia que some do papel some também da conferência.
 */
export const buildWeekSections = (
  weekStart: string,
  days: VisitScheduleDay[],
  dayOffDates: string[] = []
): DaySection[] => {
  const off = new Set(dayOffDates);

  return buildWeekDays(weekStart, days).map((cell) => {
    const items = cell.day?.items ?? [];
    return {
      date: cell.date,
      weekdayLabel: cell.weekdayLabel,
      dayLabel: cell.dayLabel,
      isDayOff: off.has(cell.date) || cell.day?.status === "OFF",
      stops: items.filter((item) => item.contactType !== "REMOTE"),
      remoteStops: items.filter((item) => item.contactType === "REMOTE"),
      routeDistanceKm: cell.day?.routeDistanceKm ?? "0",
      routeDurationMin: cell.day?.routeDurationMin ?? 0,
    };
  });
};

/** A linha de contexto do cabeçalho: de quem é a semana e o que ela custa. */
export const buildWeekContext = (
  sections: DaySection[],
  sellerName?: string | null
): string[] => {
  const stops = sections.reduce((sum, day) => sum + day.stops.length, 0);
  const remote = sections.reduce((sum, day) => sum + day.remoteStops.length, 0);
  const worked = sections.filter(
    (day) => day.stops.length > 0 || day.remoteStops.length > 0
  ).length;
  const km = sections.reduce(
    (sum, day) => sum + (Number(day.routeDistanceKm) || 0),
    0
  );
  const minutes = sections.reduce((sum, day) => sum + day.routeDurationMin, 0);

  const lines: string[] = [];
  if (sellerName) lines.push(`Vendedor: ${sellerName}`);
  lines.push(`${stops} visita(s)`);
  if (remote > 0) lines.push(`${remote} ligação(ões)`);
  lines.push(`${worked} dia(s) com agenda`);
  if (km > 0) lines.push(formatDistanceKm(String(km)));
  if (minutes > 0) lines.push(`${formatMinutes(minutes)} de trajeto`);
  return lines;
};

/**
 * Folha da rotina da semana: os sete dias em sequência, cada um com suas
 * paradas, o cliente e o porquê de cada visita.
 *
 * É a folha do dia multiplicada por sete, e de propósito — quem imprime a
 * semana quer comparar os dias entre si (onde está o buraco, onde está o
 * excesso), e para isso as linhas têm de ser as mesmas. PAISAGEM pelo mesmo
 * motivo da folha do dia: em retrato o endereço sai pela metade, e endereço
 * pela metade não leva ninguém a lugar nenhum.
 *
 * A semana inteira sai sempre, independentemente do filtro de período da tela:
 * "Hoje/3 dias" é recorte de leitura na grade, e um papel chamado "rotina da
 * semana" que trouxesse três dias seria lido como a semana inteira.
 */
export const buildWeekRoutinePdf = async (
  days: VisitScheduleDay[],
  meta: WeekRoutinePdfMeta
): Promise<Pdf> => {
  // Import dinâmico: jspdf é client-only e pesado; fora do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Logo é enfeite do documento: se falhar, o papel sai igual, sem a marca.
  const [companyLogo, girusLogo] = await Promise.all(
    [loadImage(meta.companyLogoUrl), loadGirusLogo()].map((pending) =>
      pending.then(trimTransparent)
    )
  );

  const newPage = () => {
    pdf.addPage();
    return PAGE.margin;
  };

  const sections = buildWeekSections(
    meta.weekStart,
    days,
    meta.dayOffDates ?? []
  );

  let y = drawReportHeader(pdf, {
    companyName: meta.companyName ?? null,
    companyLogo,
    title: "Rotina da semana",
    highlight: formatWeekRange(meta.weekStart),
    context: buildWeekContext(sections, meta.sellerName),
    issuedAt: formatDateDMY(getTodayIso()),
  });

  sections.forEach((section) => {
    y = drawDaySection(pdf, section, y, newPage);
  });

  if (meta.responseUrl) {
    const qr = await buildQrDataUrl(meta.responseUrl);
    drawResponseBlock(pdf, qr, meta.responseUrl, y, newPage, "week");
  }

  drawFooters(pdf, girusLogo);
  return pdf;
};

/** Monta a folha e baixa o arquivo — o que a tela chama. */
export const exportWeekRoutinePdf = async (
  days: VisitScheduleDay[],
  meta: WeekRoutinePdfMeta
): Promise<void> => {
  const pdf = await buildWeekRoutinePdf(days, meta);
  pdf.save(`rotina-semana-${meta.weekStart}.pdf`);
};
