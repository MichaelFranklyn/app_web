import { drawReportTable } from "@/utils/pdf/table";
import { COLOR, PAGE, Pdf, setFill, setText } from "@/utils/pdf/theme";
import { VisitScheduleItem } from "../interface";
import { formatDistanceKm, formatMinutes, sortVisitsByRoute } from "../utils";
import {
  buildStopColumns,
  REMOTE_CONTACT_COLUMNS,
  ROUTE_STOP_COLUMNS,
} from "./columns";

/** Altura da faixa do dia — reservada para ela nunca abrir página sozinha. */
const BAND_H = 22;
/** Faixa + cabeçalho da tabela + uma linha: o mínimo para a seção valer a página. */
const MIN_SECTION_H = BAND_H + 60;

export interface DaySection {
  date: string;
  weekdayLabel: string;
  dayLabel: string;
  /** O vendedor marcou que não trabalha neste dia. */
  isDayOff: boolean;
  stops: VisitScheduleItem[];
  remoteStops: VisitScheduleItem[];
  routeDistanceKm: string;
  routeDurationMin: number;
}

/**
 * A faixa que separa um dia do outro: dia da semana e data à esquerda, o custo
 * do dia à direita.
 *
 * Numa folha de sete dias a faixa não é enfeite — sem ela, a tabela do terceiro
 * dia continua a do segundo, e quem confere a semana perde de vista em qual dia
 * está olhando.
 */
const drawDayBand = (pdf: Pdf, section: DaySection, y: number): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const right = pageW - PAGE.margin;

  setFill(pdf, COLOR.brandSoft);
  pdf.rect(PAGE.margin, y, right - PAGE.margin, BAND_H, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.brand);
  pdf.text(
    `${section.weekdayLabel.toUpperCase()} · ${section.dayLabel}`,
    PAGE.margin + 10,
    y + 15
  );

  const summary = daySummary(section);
  if (summary) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    setText(pdf, COLOR.muted);
    pdf.text(summary, right - 10, y + 15, { align: "right" });
  }

  return y + BAND_H + 10;
};

/** "4 paradas · 2 ligações · 38,2 km · 1h 10m" — o custo do dia em uma linha. */
export const daySummary = (section: DaySection): string => {
  if (section.isDayOff) return "Dia não trabalhado";

  const parts: string[] = [];
  if (section.stops.length > 0) {
    parts.push(`${section.stops.length} parada(s)`);
  }
  if (section.remoteStops.length > 0) {
    parts.push(`${section.remoteStops.length} ligação(ões)`);
  }
  if (Number(section.routeDistanceKm) > 0) {
    parts.push(formatDistanceKm(section.routeDistanceKm));
  }
  if (section.routeDurationMin > 0) {
    parts.push(formatMinutes(section.routeDurationMin));
  }
  return parts.join("  ·  ");
};

/** Linha de recado para o dia que não tem tabela nenhuma. */
const drawEmptyNote = (pdf: Pdf, section: DaySection, y: number): number => {
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  pdf.text(
    section.isDayOff
      ? "Folga — nenhuma visita planejada."
      : "Nenhuma visita planejada para este dia.",
    PAGE.margin + 10,
    y + 4
  );
  return y + 20;
};

/**
 * Um dia da semana na folha impressa: faixa, paradas presenciais e, à parte, as
 * ligações.
 *
 * O dia vazio continua saindo no papel. Sumir com ele faria a semana parecer
 * menor do que é — e é justamente o buraco na agenda que o gestor procura
 * quando manda imprimir a rotina.
 */
export const drawDaySection = (
  pdf: Pdf,
  section: DaySection,
  startY: number,
  onNewPage: () => number
): number => {
  const limit = pdf.internal.pageSize.getHeight() - PAGE.margin - MIN_SECTION_H;
  let y = startY > limit ? onNewPage() : startY;

  y = drawDayBand(pdf, section, y);

  if (section.stops.length === 0 && section.remoteStops.length === 0) {
    return drawEmptyNote(pdf, section, y) + 8;
  }

  if (section.stops.length > 0) {
    const stops = sortVisitsByRoute(section.stops);
    y = drawReportTable(pdf, {
      columns: buildStopColumns(stops, ROUTE_STOP_COLUMNS),
      rows: stops,
      startY: y,
      onNewPage,
    });
  }

  if (section.remoteStops.length > 0) {
    const remote = sortVisitsByRoute(section.remoteStops);
    // As ligações vêm rotuladas mesmo tendo colunas próprias: coladas embaixo
    // da rota, seriam lidas como mais paradas — e o vendedor dirigiria até um
    // cliente que era só um telefonema.
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setText(pdf, COLOR.muted);
    pdf.text("LIGAÇÕES", PAGE.margin, y + 2);
    y += 12;
    y = drawReportTable(pdf, {
      columns: buildStopColumns(remote, REMOTE_CONTACT_COLUMNS),
      rows: remote,
      startY: y,
      onNewPage,
    });
  }

  return y + 8;
};
