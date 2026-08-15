import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { PortalOrderItem } from "../../../../interface";
import { itemLineTotal } from "../../../../utils";

interface PortalOrderItemsProps {
  items: PortalOrderItem[];
}

/**
 * Os itens, empilhados — nunca em tabela.
 *
 * Aqui a tentação da tabela é maior que na lista (são cinco números por linha),
 * e é justamente onde ela falharia pior: no celular, cinco colunas viram fonte
 * de 9px ou rolagem horizontal, e este é o bloco que o cliente lê CONFERINDO,
 * item a item, contra a nota na outra mão.
 */
export function PortalOrderItems({ items }: PortalOrderItemsProps) {
  if (items.length === 0) return null;

  return (
    <Card.Root className="h-auto p-[16px]">
      <div className="mb-[12px] flex flex-col gap-[2px]">
        <Title variant="heading-sm">
          {items.length === 1 ? "1 item" : `${items.length} itens`}
        </Title>
        <Title variant="body-xs" color="muted">
          Quantidades em unidades.
        </Title>
      </div>

      <ul className="flex flex-col">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={
              index > 0 ? "border-t border-(--border) pt-[12px]" : undefined
            }
          >
            <div className="flex flex-col gap-[4px] pb-[12px]">
              <Title
                variant="body-sm"
                weight="semibold"
                className="break-words"
              >
                {item.productName}
              </Title>
              {item.sku ? (
                <Title variant="body-xs" color="muted">
                  Código {item.sku}
                </Title>
              ) : null}
              <div className="flex items-baseline justify-between gap-[12px]">
                <Title variant="body-xs" color="muted">
                  {formatNumber(Number(item.quantity))} ×{" "}
                  {formatMoney(item.unitPrice)}
                </Title>
                <Title variant="body-sm" weight="semibold">
                  {formatMoney(itemLineTotal(item))}
                </Title>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card.Root>
  );
}
