import { Alert } from "@/components/Alert";
import { Emphasis } from "@/components/Emphasis";
import { TextLink } from "@/components/TextLink";
import { formatDate } from "@/utils/format/date";
import { GitBranch, PackageX } from "lucide-react";

import { OrderDetail } from "../../interface";

interface Props {
  order: OrderDetail;
}

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
              Este é o <Emphasis>saldo</Emphasis> do{" "}
              <TextLink
                href={`/orders/${order.parentOrder.id}`}
                underline="always"
                emphasis
              >
                pedido de {formatDate(order.parentOrder.orderDate)}
              </TextLink>
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
                  <TextLink
                    href={`/orders/${child.id}`}
                    underline="always"
                    emphasis
                  >
                    ver saldo
                  </TextLink>
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
