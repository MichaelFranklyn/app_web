import { FilterField } from "@/components/Filters";
import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { buildReportContext, ReportOrder } from "@/utils/pdf/context";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { drawReportHeader } from "@/utils/pdf/reportHeader";
import { drawReportTable } from "@/utils/pdf/table";
import { PAGE } from "@/utils/pdf/theme";
import { Client } from "../interface";
import { CLIENT_SORT_LABELS } from "../utils";
import { CLIENT_COLUMNS } from "./columns";

export interface ClientsPdfMeta {
  companyName?: string | null;
  companyLogoUrl?: string | null;
  /** Campos do painel de filtros da tela — viram o recorte escrito no topo. */
  filterFields: FilterField[];
  /** Filtros ativos na tela — vão escritos no cabeçalho do documento. */
  inputValues: Record<string, string>;
  /** Ordenação à vista na tabela, para o papel dizer em que ordem ele está. */
  order?: ReportOrder | null;
}

/**
 * Gera e baixa a carteira de clientes em PDF: o papel que se leva para a
 * reunião ou para a rua, com o mesmo recorte que está à vista na tela.
 *
 * Paisagem porque são oito colunas — em retrato, ou o nome do cliente vira
 * abreviação, ou as datas saem espremidas.
 */
export const exportClientsPdf = async (
  clients: Client[],
  meta: ClientsPdfMeta
): Promise<void> => {
  // Import dinâmico: jspdf é client-only e pesado; fora do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // O recorte da moldura transparente deixa a marca do mesmo tamanho visual que
  // nos outros documentos (ver trimTransparent). Logo é enfeite: falha não impede.
  const [companyLogo, girusLogo] = await Promise.all(
    [loadImage(meta.companyLogoUrl), loadGirusLogo()].map((pending) =>
      pending.then(trimTransparent)
    )
  );

  const y = drawReportHeader(pdf, {
    companyName: meta.companyName ?? null,
    companyLogo,
    title: "Carteira de clientes",
    highlight: `${clients.length} cliente(s)`,
    context: buildReportContext({
      fields: meta.filterFields,
      values: meta.inputValues,
      order: meta.order,
      sortLabels: CLIENT_SORT_LABELS,
    }),
    issuedAt: formatDateDMY(getTodayIso()),
  });

  drawReportTable(pdf, {
    columns: CLIENT_COLUMNS,
    rows: clients,
    startY: y,
    onNewPage: () => {
      pdf.addPage();
      return PAGE.margin;
    },
  });

  drawFooters(pdf, girusLogo);
  pdf.save(`clientes-${getTodayIso()}.pdf`);
};
