import { FilterField } from "@/components/Filters";
import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { drawReportHeader } from "@/utils/pdf/reportHeader";
import { drawReportTable } from "@/utils/pdf/table";
import { PAGE } from "@/utils/pdf/theme";
import { Order } from "../interface";
import { buildOrderTotals, ORDER_COLUMNS } from "./columns";
import { buildOrdersContext } from "./context";

export interface OrdersPdfMeta {
  companyName?: string | null;
  companyLogoUrl?: string | null;
  /** Campos e valores do painel de filtros — viram o recorte escrito no topo. */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  /** Aba corrente, quando ela restringe a lista ("Ainda não faturados"). */
  scopeLabel?: string | null;
}

/**
 * Gera e baixa a lista de pedidos em PDF, com o mesmo recorte que está à vista
 * na tela e o total do que foi impresso no fim.
 *
 * É o relatório que se leva para a reunião com a fábrica ou para fechar o mês
 * com o vendedor — daí a linha de totais: a primeira pergunta é sempre "quanto
 * deu no período".
 */
export const exportOrdersPdf = async (
  orders: Order[],
  meta: OrdersPdfMeta
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
    title: "Relatório de pedidos",
    highlight: `${orders.length} pedido(s)`,
    context: buildOrdersContext({
      fields: meta.filterFields,
      values: meta.inputValues,
      scopeLabel: meta.scopeLabel,
    }),
    issuedAt: formatDateDMY(getTodayIso()),
  });

  drawReportTable(pdf, {
    columns: ORDER_COLUMNS,
    rows: orders,
    startY: y,
    onNewPage: () => {
      pdf.addPage();
      return PAGE.margin;
    },
    totals: buildOrderTotals(orders),
    totalsLabel: "TOTAL",
  });

  drawFooters(pdf, girusLogo);
  pdf.save(`pedidos-${getTodayIso()}.pdf`);
};
