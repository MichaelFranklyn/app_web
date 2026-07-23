import { Alert } from "@/components/Alert";
import { formatDate } from "@/utils/format/date";
import { GitBranch, PackageX } from "lucide-react";
import Link from "next/link";

import { OrderDetail } from "../../interface";

interface Props {
  order: OrderDetail;
}

const linkClass = "font-medium text-(--amber) underline underline-offset-2";

/**
 * Vínculo do faturamento parcial: quando ESTE pedido é o restante de outro
 * (backorder), aponta para o pai; quando ELE gerou restantes, aponta para os
 * filhos. Sem vínculo, não renderiza nada.
 */
export function BackorderBanner({ order }: Props) {
  const children = order.backorderChildren ?? [];

  return (
    <>
      {order.isBackorder && order.parentOrder && (
        <Alert.Root variant="info">
          <Alert.Icon icon={GitBranch} />
          <Alert.Content>
            <Alert.Description>
              Este pedido é o restante (backorder) de um faturamento parcial do{" "}
              <Link
                href={`/orders/${order.parentOrder.id}`}
                className={linkClass}
              >
                pedido de {formatDate(order.parentOrder.orderDate)}
              </Link>
              . Fature-o quando a fábrica repuser o estoque.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {children.length > 0 && (
        <Alert.Root variant="info">
          <Alert.Icon icon={PackageX} />
          <Alert.Content>
            <Alert.Description>
              Faturado parcial — o que faltou foi para{" "}
              {children.length === 1 ? "um novo pedido" : "novos pedidos"} de
              backorder:{" "}
              {children.map((child, i) => (
                <span key={child.id}>
                  {i > 0 && ", "}
                  <Link href={`/orders/${child.id}`} className={linkClass}>
                    ver restante
                  </Link>
                </span>
              ))}
              .
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
}
