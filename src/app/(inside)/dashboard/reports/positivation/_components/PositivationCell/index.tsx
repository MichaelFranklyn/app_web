"use client";

import { Tooltip } from "@/components/Tooltip";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Check, Minus } from "lucide-react";

import { PositivationCell as Cell } from "../../interface";

/**
 * Uma célula da matriz. Três estados, e a diferença entre os dois últimos é o
 * relatório inteiro:
 *
 * - vazio: o cliente não atende essa fábrica (nada a fazer);
 * - traço âmbar: atende e NÃO comprou no período (é a linha para trabalhar);
 * - visto verde: comprou.
 *
 * O símbolo vem com tooltip porque um ✓ sozinho não diz quanto nem quando — e é o
 * que se pergunta logo depois de ver o visto.
 */
export function PositivationCellMark({ cell }: { cell: Cell }) {
  if (!cell.isLinked) {
    return (
      <span className="text-(--muted2)" aria-label="Sem vínculo nesta fábrica">
        ·
      </span>
    );
  }

  if (!cell.isPositivated) {
    return (
      <Tooltip content={`${cell.factoryName}: nenhuma compra no período`}>
        <span
          className="inline-flex text-(--amber)"
          aria-label={`${cell.factoryName}: não comprou no período`}
        >
          <Minus size={16} />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={`${cell.factoryName}: ${cell.orderCount} pedido(s) · ${formatMoney(cell.totalAmount)}${
        cell.lastOrderDate
          ? ` · última ${formatDateDMY(cell.lastOrderDate)}`
          : ""
      }`}
    >
      <span
        className="inline-flex text-(--green)"
        aria-label={`${cell.factoryName}: comprou no período`}
      >
        <Check size={16} />
      </span>
    </Tooltip>
  );
}
