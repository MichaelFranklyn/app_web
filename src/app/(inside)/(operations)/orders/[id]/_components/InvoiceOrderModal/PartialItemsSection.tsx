import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { formatNumber } from "@/utils/format/masks";

import { OrderItem } from "../../interface";
import { RemainderChoice } from "./RemainderChoice";
import { RemainderMode } from "./usePartialInvoice";

interface Props {
  items: OrderItem[];
  partial: boolean;
  onPartialChange: (v: boolean) => void;
  quantities: Record<string, string>;
  onQuantityChange: (id: string, value: string) => void;
  backorderCount: number;
  remainderMode: RemainderMode;
  onRemainderModeChange: (mode: RemainderMode) => void;
}

/**
 * Faturamento parcial: um interruptor "faturou tudo?" e, quando desligado, a
 * lista de itens com a quantidade faturada editável (a fábrica não tinha estoque
 * de tudo). Havendo sobra, o vendedor escolhe o destino dela: virar um pedido
 * novo (backorder) para faturar depois, ou ser cancelada de vez.
 */
export function PartialItemsSection({
  items,
  partial,
  onPartialChange,
  quantities,
  onQuantityChange,
  backorderCount,
  remainderMode,
  onRemainderModeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-12 border-t border-(--border) pt-16">
      <Input.Toggle
        checked={!partial}
        onChange={(e) => onPartialChange(!e.target.checked)}
        label="A fábrica faturou o pedido inteiro"
      />

      {partial && (
        <div className="flex flex-col gap-8">
          <Title variant="body-sm" color="muted">
            Ajuste a quantidade faturada de cada item conforme a nota da
            fábrica. O que faltar vira um novo pedido para faturar quando ela
            repuser.
          </Title>

          <div className="flex flex-col gap-6">
            {items.map((it) => {
              const ordered = Number(it.quantity);
              const invoiced = Number(
                String(quantities[it.id] ?? it.quantity).replace(",", ".")
              );
              const missing =
                Number.isFinite(invoiced) && invoiced < ordered
                  ? ordered - invoiced
                  : 0;
              return (
                <div
                  key={it.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-8 rounded-(--r-md) border border-(--border) bg-(--bg2) px-12 py-8"
                >
                  <div className="flex min-w-0 flex-col">
                    <Title
                      variant="body-sm"
                      weight="medium"
                      className="truncate"
                    >
                      {it.product?.name ?? "—"}
                    </Title>
                    {/* O código vem antes da quantidade: é por ele que o vendedor
                        acha a linha na nota da fábrica. */}
                    {it.product?.sku && (
                      <Title variant="body-xs" color="muted">
                        Código {it.product.sku}
                      </Title>
                    )}
                    <Title variant="body-xs" color="muted">
                      Pedido: {formatNumber(ordered)} un
                      {missing > 0 && (
                        <>
                          {" · "}
                          <span className="text-(--amber)">
                            faltam {formatNumber(missing)}
                          </span>
                        </>
                      )}
                    </Title>
                  </div>
                  <div className="w-[110px]">
                    <Input.Number
                      size="sm"
                      min={0}
                      max={ordered}
                      step="any"
                      value={quantities[it.id] ?? ""}
                      onChange={(e) => onQuantityChange(it.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {backorderCount > 0 && (
            <RemainderChoice
              count={backorderCount}
              mode={remainderMode}
              onChange={onRemainderModeChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
