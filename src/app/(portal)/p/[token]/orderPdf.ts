import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY, formatMoney, formatNumber } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadBrandLogo } from "@/utils/pdf/footer";
import { drawReportHeader } from "@/utils/pdf/reportHeader";
import { drawReportTable, ReportColumn } from "@/utils/pdf/table";
import { PAGE } from "@/utils/pdf/theme";
import { PortalOrderItem } from "./interface";

/** A marca do escritório no cabeçalho do PDF (o cliente vê de quem compra). */
export interface PortalPdfBrand {
  companyName: string | null;
  companyLogoUrl: string | null;
}

const lineTotal = (item: PortalOrderItem): number =>
  Number(item.subtotal) + Number(item.taxAmount) + Number(item.ipiAmount);

/** As colunas do papel: produto, quantidade, preço com imposto e o total da linha (com IPI). */
export const PORTAL_ORDER_PDF_COLUMNS: ReportColumn<PortalOrderItem>[] = [
  {
    header: "Produto",
    width: 5,
    value: (item) => item.productName,
    sub: (item) => item.sku,
  },
  {
    header: "Qtd.",
    width: 1.2,
    align: "right",
    value: (item) => formatNumber(Number(item.quantity)),
  },
  {
    header: "Preço un.",
    width: 1.6,
    align: "right",
    value: (item) => formatMoney(Number(item.unitPriceWithTax)),
  },
  {
    header: "Total",
    width: 1.8,
    align: "right",
    bold: true,
    value: (item) => formatMoney(lineTotal(item)),
  },
];

export interface PortalOrderPdf {
  /** Faixa do cabeçalho, ex.: "PEDIDO #428". */
  title: string;
  total: number;
  /** As linhas de contexto sob a faixa. */
  context: string[];
  items: PortalOrderItem[];
  totalsLabel: string;
  fileName: string;
}

/**
 * Um pedido do portal (feito ou enviado) em PDF, no mesmo papel dos relatórios
 * do escritório: cabeçalho da representação, o recorte escrito e a tabela.
 */
export const exportPortalOrderPdf = async (
  doc: PortalOrderPdf,
  brand: PortalPdfBrand
): Promise<void> => {
  // jspdf é client-only e pesado: entra por import dinâmico.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // Logo é enfeite: falhar em carregar não impede o PDF.
  const [companyLogo, brandLogo] = await Promise.all(
    [loadImage(brand.companyLogoUrl), loadBrandLogo()].map((pending) =>
      pending.then(trimTransparent)
    )
  );

  const y = drawReportHeader(pdf, {
    companyName: brand.companyName,
    companyLogo,
    title: doc.title,
    highlight: formatMoney(doc.total),
    context: doc.context,
    issuedAt: formatDateDMY(getTodayIso()),
  });

  drawReportTable(pdf, {
    columns: PORTAL_ORDER_PDF_COLUMNS,
    rows: doc.items,
    startY: y,
    onNewPage: () => {
      pdf.addPage();
      return PAGE.margin;
    },
    totals: { 3: formatMoney(doc.total) },
    totalsLabel: doc.totalsLabel,
  });

  drawFooters(pdf, brandLogo);
  pdf.save(doc.fileName);
};
