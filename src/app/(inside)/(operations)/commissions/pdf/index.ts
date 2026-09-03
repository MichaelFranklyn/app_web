import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { PAGE } from "@/utils/pdf/theme";

import { CommissionRow } from "../interface";
import {
  CommissionSection,
  monthLabel,
  MonthReport,
  YearMonth,
} from "../utils";
import { drawBoletoSection } from "./boletoSection";
import { drawFactorySection } from "./factorySection";
import { drawHeader } from "./header";
import { drawSectionBand } from "./sectionBand";
import { drawMonthTotal } from "./total";

export interface CommissionsPdfMeta {
  month: YearMonth;
  sellerName: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
}

/** Nome do arquivo: "comissoes-2026-08.pdf". */
const filename = ({ year, month }: YearMonth): string =>
  `comissoes-${year}-${String(month).padStart(2, "0")}.pdf`;

/**
 * Gera e baixa o fechamento de comissões de um mês.
 *
 * São cinco seções, e elas respondem perguntas diferentes de propósito. As três
 * primeiras são de COMISSÃO, pela data em que ela cai: o que a fábrica ainda
 * deve, o que já pagou e o que ainda depende de acontecer. As duas últimas são
 * do BOLETO DO CLIENTE — quem pagou no mês e quem não pagou —, que é o que a
 * fábrica usa para justificar (ou segurar) o repasse.
 *
 * Paisagem porque cada linha carrega a situação do boleto ao lado da comissão:
 * em retrato, ou o nome do cliente ficava cortado ou a coluna do boleto não
 * cabia — e é justamente a leitura "cliente → pagou? → quanto" que o papel serve.
 */
export const exportCommissionsPdf = async (
  report: MonthReport,
  meta: CommissionsPdfMeta
): Promise<void> => {
  // Import dinâmico: jspdf é client-only e pesado; fora do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

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
    defaultedCount: report.defaulted.length,
    settledCount: report.settled.length,
    issuedAt: formatDateDMY(getTodayIso()),
  });

  // Página nova no meio do relatório: só a margem superior; o cabeçalho da
  // tabela é redesenhado pela seção e o rodapé sai no fim, para todas.
  const startNewPage = (): number => {
    pdf.addPage();
    return PAGE.margin;
  };

  const name = monthLabel(meta.month);

  /** Uma seção de comissão: a faixa e, abaixo, um bloco por fábrica. */
  const commissionSection = (
    title: string,
    section: CommissionSection,
    dateHeader: string,
    scope: string
  ) => {
    if (section.count === 0) return;
    y = drawSectionBand(
      pdf,
      { title, scope, total: section.total, count: section.count },
      y,
      startNewPage
    );
    for (const group of section.groups) {
      y = drawFactorySection(pdf, group, y, startNewPage, { dateHeader });
    }
  };

  commissionSection(
    "A RECEBER",
    report.receivable,
    "RECEBER EM",
    `cai em ${name}, já líquido de estorno`
  );
  commissionSection("RECEBIDO", report.received, "RECEBIDO EM", `em ${name}`);
  commissionSection(
    "PREVISTO",
    report.pending,
    "PREVISTO P/",
    `previsão para ${name}`
  );

  /** Uma seção de boleto: a faixa e a tabela plana, sem agrupar por fábrica. */
  const boletoSection = (
    title: string,
    rows: CommissionRow[],
    scope: string
  ) => {
    if (rows.length === 0) return;
    y = drawSectionBand(
      pdf,
      { title, scope, count: rows.length },
      y,
      startNewPage
    );
    y = drawBoletoSection(pdf, rows, y, startNewPage);
  };

  boletoSection(
    "BOLETOS INADIMPLENTES",
    report.defaulted,
    // Calote não é evento de mês: fica travado até ser resolvido, e a fábrica
    // manda o relatório dela com vencimentos de meses diferentes na mesma folha.
    "todos os vencimentos, não só o mês"
  );
  boletoSection(
    "BOLETOS LIQUIDADOS",
    report.settled,
    `pagos pelo cliente em ${name}`
  );

  drawMonthTotal(
    pdf,
    {
      receivable: report.receivable.total,
      received: report.received.total,
      pending: report.pending.total,
    },
    y,
    startNewPage
  );

  drawFooters(pdf, girusLogo);
  pdf.save(filename(meta.month));
};
