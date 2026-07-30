import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { PAGE } from "@/utils/pdf/theme";
import { monthLabel, ReceivableReport, YearMonth } from "../utils";
import { drawFactorySection } from "./factorySection";
import { drawHeader } from "./header";
import { drawTotal } from "./total";

export interface CommissionsPdfMeta {
  month: YearMonth;
  sellerName: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
}

/** Nome do arquivo: "comissoes-a-receber-2026-08.pdf". */
const filename = ({ year, month }: YearMonth): string =>
  `comissoes-a-receber-${year}-${String(month).padStart(2, "0")}.pdf`;

/**
 * Gera e baixa o relatório do que as fábricas têm a pagar de comissão em um
 * mês: um bloco por fábrica com as parcelas a receber e o subtotal dela, e o
 * total geral destacado no fim. É o papel que se leva para cobrar o repasse e
 * conferir contra a planilha que a fábrica manda.
 *
 * Previsto e recebido ficam de fora de propósito (ver `receivableReport`) — o
 * documento responde "quanto ainda tenho para receber neste mês".
 */
export const exportCommissionsPdf = async (
  report: ReceivableReport,
  meta: CommissionsPdfMeta
): Promise<void> => {
  // Import dinâmico: jspdf é client-only e pesado; fora do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // O recorte da moldura transparente deixa a marca do mesmo tamanho visual que
  // no PDF do pedido (ver trimTransparent). Logo é enfeite: falha não impede.
  const [companyLogo, girusLogo] = await Promise.all(
    [loadImage(meta.companyLogoUrl), loadGirusLogo()].map((pending) =>
      pending.then(trimTransparent)
    )
  );

  let y = drawHeader(pdf, {
    companyName: meta.companyName ?? null,
    companyLogo,
    monthLabel: monthLabel(meta.month),
    sellerName: meta.sellerName,
    count: report.count,
    issuedAt: formatDateDMY(getTodayIso()),
  });

  // Página nova no meio do relatório: só a margem superior; o cabeçalho da
  // tabela é redesenhado pelo bloco da fábrica e o rodapé sai no fim, para todas.
  const startNewPage = () => {
    pdf.addPage();
    return PAGE.margin;
  };

  for (const group of report.groups) {
    y = drawFactorySection(pdf, group, y, startNewPage);
  }

  drawTotal(pdf, report.total, y, startNewPage);

  drawFooters(pdf, girusLogo);
  pdf.save(filename(meta.month));
};
