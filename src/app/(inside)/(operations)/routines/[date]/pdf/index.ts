import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { drawReportHeader } from "@/utils/pdf/reportHeader";
import { drawReportTable } from "@/utils/pdf/table";
import { COLOR, PAGE, Pdf, setText } from "@/utils/pdf/theme";
import { VisitItem } from "../interface";
import { formatDateLong } from "../utils";
import {
  buildRouteContext,
  buildStopColumns,
  REMOTE_CONTACT_COLUMNS,
  ROUTE_STOP_COLUMNS,
} from "./columns";

export interface DayRoutePdfMeta {
  date: string;
  sellerName?: string | null;
  departureAddress?: string | null;
  routeDistanceKm: string;
  routeDurationMin: number;
  companyName?: string | null;
  companyLogoUrl?: string | null;
}

/** Título de uma seção entre tabelas ("LIGAÇÕES DO DIA"). Devolve o `y` livre. */
const drawSectionTitle = (pdf: Pdf, title: string, y: number): number => {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  setText(pdf, COLOR.muted);
  pdf.text(title.toUpperCase(), PAGE.margin, y);
  return y + 12;
};

/**
 * Folha da rota do dia: a versão de bolso da tela, para o vendedor levar no
 * carro ou deixar com quem precisa saber por onde ele passa.
 *
 * O papel responde em uma olhada "para onde vou agora, com quem falo e por
 * quê"; duração, deslocamento e resultado ficam na tela — aqui só o que se
 * executa na rua. PAISAGEM porque em retrato o endereço e o nome da loja saíam
 * cortados com reticências, e endereço pela metade não leva ninguém a lugar
 * nenhum.
 *
 * As ligações do dia vêm depois, em bloco separado: não são paradas de rota e
 * misturá-las na sequência faria o vendedor dirigir até um cliente que era só
 * um telefonema.
 */
export const buildDayRoutePdf = async (
  stops: VisitItem[],
  remoteStops: VisitItem[],
  meta: DayRoutePdfMeta
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

  let y = drawReportHeader(pdf, {
    companyName: meta.companyName ?? null,
    companyLogo,
    title: "Rota do dia",
    highlight: formatDateLong(meta.date),
    context: buildRouteContext({
      sellerName: meta.sellerName,
      departureAddress: meta.departureAddress,
      stopsCount: stops.length,
      remoteCount: remoteStops.length,
      routeDistanceKm: meta.routeDistanceKm,
      routeDurationMin: meta.routeDurationMin,
    }),
    issuedAt: formatDateDMY(getTodayIso()),
  });

  if (stops.length > 0) {
    y = drawReportTable(pdf, {
      columns: buildStopColumns(stops, ROUTE_STOP_COLUMNS),
      rows: stops,
      startY: y,
      onNewPage: newPage,
    });
  }

  if (remoteStops.length > 0) {
    // A seção só começa se sobrar espaço para o título e uma linha; senão ela
    // abriria com o cabeçalho no pé da página e as linhas na folha seguinte.
    const limit = pdf.internal.pageSize.getHeight() - PAGE.margin - 70;
    if (y > limit) y = newPage();

    y = drawSectionTitle(pdf, "Ligações do dia", y + 10);
    drawReportTable(pdf, {
      columns: buildStopColumns(remoteStops, REMOTE_CONTACT_COLUMNS),
      rows: remoteStops,
      startY: y,
      onNewPage: newPage,
    });
  }

  drawFooters(pdf, girusLogo);
  return pdf;
};

/** Monta a folha e baixa o arquivo — o que a tela chama. */
export const exportDayRoutePdf = async (
  stops: VisitItem[],
  remoteStops: VisitItem[],
  meta: DayRoutePdfMeta
): Promise<void> => {
  const pdf = await buildDayRoutePdf(stops, remoteStops, meta);
  pdf.save(`rota-${meta.date}.pdf`);
};
