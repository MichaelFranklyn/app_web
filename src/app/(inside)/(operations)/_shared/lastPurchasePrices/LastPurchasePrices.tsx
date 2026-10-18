"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RowList } from "@/components/RowList";
import { Title } from "@/components/Title";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Zap } from "lucide-react";

import { PurchasePrice } from "./interface";
import { variationFromLast } from "./utils";

interface Props {
  purchases: PurchasePrice[] | undefined;
  loading: boolean;
  /** Preço da tabela ativa hoje, por unidade — comparado com a última compra. */
  tablePrice: number;
  /** Como o selo chama o preço comparado (padrão "Tabela hoje"). */
  compareLabel?: string;
  /** Rótulo da unidade (ex.: "Peça"); sem ele, "unidade". */
  unitName?: string | null;
  /** Põe este preço no campo de preço do item. */
  onUsePrice: (price: number) => void;
}

const formatUnits = (units: string): string =>
  Number(units).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

/**
 * "Da última vez ele pagou R$ 4,10": as últimas compras deste produto pelo
 * cliente, nesta fábrica, ao lado do preço que o vendedor vai dar. Só pedido
 * feito — orçamento não é preço que o cliente aceitou.
 */
export function LastPurchasePrices({
  purchases,
  loading,
  tablePrice,
  compareLabel = "Tabela hoje",
  unitName,
  onUsePrice,
}: Props) {
  const unit = (unitName ?? "unidade").toLowerCase();

  if (loading && !purchases) {
    return (
      <Title variant="caption" color="muted">
        Buscando as últimas compras deste cliente…
      </Title>
    );
  }
  if (!purchases) return null;
  if (purchases.length === 0) {
    return (
      <Title variant="caption" color="muted">
        Este cliente ainda não comprou este produto nesta fábrica.
      </Title>
    );
  }

  const variation = variationFromLast(
    tablePrice,
    Number(purchases[0].netUnitPrice)
  );

  return (
    <Card.Root inset>
      <Card.Body padding="compact" className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <Title variant="label" weight="bold" className="tracking-normal">
            Últimas compras deste cliente
          </Title>
          {variation !== null && Math.abs(variation) >= 0.01 && (
            <Badge.Root
              color={variation > 0 ? "red" : "green"}
              appearance="tinted"
            >
              <Badge.Text>
                {compareLabel} {variation > 0 ? "+" : "−"}
                {Math.abs(variation).toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
                % sobre a última
              </Badge.Text>
            </Badge.Root>
          )}
        </div>
        <RowList.Root>
          {purchases.map((p) => {
            const net = Number(p.netUnitPrice);
            const hasDiscount = net < Number(p.unitPrice) - 0.0001;
            return (
              <RowList.Item
                key={p.orderId}
                className="flex flex-wrap items-center justify-between gap-8"
              >
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-6">
                    <Title variant="body-sm" weight="semibold">
                      {formatMoney(net)} / {unit}
                    </Title>
                    {p.isPromo && (
                      <Badge.Root
                        color="orange"
                        appearance="tinted"
                        title="Comprado em promoção relâmpago"
                      >
                        <Badge.Icon>
                          <Zap />
                        </Badge.Icon>
                      </Badge.Root>
                    )}
                  </div>
                  <Title variant="caption" color="muted">
                    {[
                      formatDateDMY(p.orderDate),
                      `${formatUnits(p.units)} ${unit}${Number(p.units) === 1 ? "" : "s"}`,
                      p.tierName,
                      hasDiscount
                        ? `com desconto (tabela ${formatMoney(Number(p.unitPrice))})`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Title>
                </div>
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="sm"
                  noUppercase
                  onClick={() => onUsePrice(net)}
                >
                  <Button.Title>Usar este preço</Button.Title>
                </Button.Root>
              </RowList.Item>
            );
          })}
        </RowList.Root>
      </Card.Body>
    </Card.Root>
  );
}
