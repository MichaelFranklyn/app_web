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
              Este é o <strong>saldo</strong> do{" "}
              <Link
                href={`/orders/${order.parentOrder.id}`}
                className={linkClass}
              >
                pedido de {formatDate(order.parentOrder.orderDate)}
              </Link>
              : o que a fábrica não conseguiu entregar de uma vez. É a mesma
              venda — não conta como pedido novo nem muda a frequência de compra
              do cliente. Fature quando a fábrica mandar o restante.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {children.length > 0 && (
        <Alert.Root variant="info">
          <Alert.Icon icon={PackageX} />
          <Alert.Content>
            <Alert.Description>
              Faturado parcial — o que faltou ficou como{" "}
              {children.length === 1 ? "saldo" : "saldos"} deste pedido (a mesma
              venda, entregue em partes):{" "}
              {children.map((child, i) => (
                <span key={child.id}>
                  {i > 0 && ", "}
                  <Link href={`/orders/${child.id}`} className={linkClass}>
                    ver saldo
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
