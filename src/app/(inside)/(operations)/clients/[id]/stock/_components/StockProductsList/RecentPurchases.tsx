"use client";

import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { ProductPurchase } from "../../../interface";
import { formatCurrency } from "../../../utils";

interface Props {
  purchases: ProductPurchase[];
  /** Unidade do produto (peça, caixa…), para a quantidade fazer sentido. */
  unitLabel: string;
}

/** Dias entre esta compra e a anterior — o intervalo que forma a duração média. */
function intervalDays(
  current: string,
  previous: string | undefined
): number | null {
  if (!previous) return null;
  const days = Math.round(
    (new Date(current).getTime() - new Date(previous).getTime()) / 86400000
  );
  return days > 0 ? days : null;
}

/**
 * As últimas compras do produto, recolhidas por padrão.
 *
 * A duração média mostrada acima SAI destes intervalos — abrir a lista é ver a
 * conta. O vendedor pergunta "por que o sistema diz que acaba dia 20?", e a
 * resposta é "porque ele compra a cada 30 dias e comprou dia 20 do mês passado".
 */
export function RecentPurchases({ purchases, unitLabel }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (purchases.length === 0) {
    return (
      <Title variant="micro" color="muted">
        Nenhuma compra registrada deste produto ainda.
      </Title>
    );
  }

  const label = `${purchases.length} ${
    purchases.length === 1 ? "compra registrada" : "últimas compras"
  }`;

  return (
    <div className="flex flex-col gap-8 border-t border-(--border) pt-12">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-6 text-left"
      >
        <ChevronDown
          size={14}
          className={`text-(--muted) transition-transform ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
        <ShoppingCart size={13} className="text-(--muted)" />
        <Title variant="micro" color="secondary">
          {label}
        </Title>
      </button>

      {isOpen && (
        <ul className="flex flex-col gap-6 pl-20">
          {purchases.map((purchase, index) => {
            // A lista vem da mais recente para a mais antiga: a "anterior" em
            // ordem de tempo é a próxima da lista.
            const gap = intervalDays(
              purchase.purchaseDate,
              purchases[index + 1]?.purchaseDate
            );
            return (
              <li
                key={purchase.orderId}
                className="flex items-baseline justify-between gap-8"
              >
                <span className="inline-flex items-baseline gap-6">
                  <Title variant="body-sm">
                    {formatDate(purchase.purchaseDate)}
                  </Title>
                  {gap && (
                    <Title variant="micro" color="muted">
                      {gap} dias depois da anterior
                    </Title>
                  )}
                </span>
                <span className="inline-flex items-baseline gap-8">
                  <Title variant="body-sm" weight="semibold">
                    {`${parseFloat(purchase.quantity).toFixed(0)} ${unitLabel}`.trim()}
                  </Title>
                  {purchase.unitPrice && (
                    <Title variant="micro" color="muted">
                      {formatCurrency(purchase.unitPrice)}/un
                    </Title>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
