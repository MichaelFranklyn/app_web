import { formatDateDMY } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { PositivationFactory, PositivationRow } from "./interface";
import { positivatedLabel } from "./utils";

/**
 * Quantas fábricas cabem como coluna no A4 paisagem antes de o nome do cliente
 * virar abreviação. Acima disso o PDF corta e AVISA no cabeçalho — a planilha sai
 * com todas.
 */
export const PDF_FACTORY_LIMIT = 8;

/** Nome curto da fábrica para caber no cabeçalho estreito de uma coluna. */
const shortName = (name: string): string => {
  const first = name.split(/[\s-]+/)[0] ?? name;
  return first.slice(0, 10).toUpperCase();
};

/**
 * Monta as colunas do PDF: as fixas mais uma por fábrica.
 *
 * A célula é "sim"/"não" e o não-vinculado fica vazio: no papel, distinguir "não
 * atende essa fábrica" de "atende e não vendeu" é a diferença entre uma linha para
 * ignorar e uma linha para trabalhar.
 */
export const buildPositivationPdfColumns = (
  factories: PositivationFactory[]
): ReportColumn<PositivationRow>[] => {
  const shown = factories.slice(0, PDF_FACTORY_LIMIT);

  return [
    {
      header: "CLIENTE",
      width: 22,
      value: (row) => row.clientName,
      sub: (row) => row.sellerName,
    },
    ...shown.map((factory) => ({
      header: shortName(factory.factoryName),
      width: 7,
      value: (row: PositivationRow) => {
        const cell = row.cells.find(
          (candidate) => candidate.factoryId === factory.factoryId
        );
        if (!cell?.isLinked) return "";
        return cell.isPositivated ? "sim" : "não";
      },
    })),
    {
      header: "POSITIVOU",
      width: 8,
      align: "right" as const,
      bold: true,
      value: positivatedLabel,
    },
    {
      header: "ÚLT. COMPRA",
      width: 10,
      value: (row: PositivationRow) =>
        row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—",
    },
  ];
};
