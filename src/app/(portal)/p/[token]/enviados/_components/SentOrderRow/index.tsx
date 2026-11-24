import { BRT_TIME_ZONE, formatDate } from "@/utils/format/date";
import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import Link from "next/link";
import { PortalOrderStatus, PortalSentOrder } from "../../../interface";
import { portalStatusLabel, portalStatusTone } from "../../../utils";
import {
  sentOrderHref,
  sentOrderNumberLine,
  sentOrderStage,
  sentOrderTotal,
} from "../../utils";
import { SentOrderBadge } from "../SentOrderBadge";

interface SentOrderRowProps {
  order: PortalSentOrder;
  token: string;
}

/**
 * Um pedido ou orçamento em uma linha (um cartão no celular). A linha inteira
 * abre o detalhe; o nome da fábrica é também um link de verdade, para o
 * teclado e para quem abre antes de o JavaScript carregar.
 *
 * Pedido feito mostra a situação da mercadoria; orçamento, a resposta do
 * representante — a mesma etiqueta do detalhe.
 */
export function SentOrderRow({ order, token }: SentOrderRowProps) {
  const href = sentOrderHref(token, order);
  const isOrder = sentOrderStage(order) === "ordered";
  const status = order.status as PortalOrderStatus;

  return (
    <Table.Row href={href}>
      <Table.Cell card="title" wrap>
        <div className="flex min-w-0 flex-col gap-2">
          <Link href={href} className="min-w-0 break-words hover:underline">
            <Title variant="body-md" weight="semibold" className="break-words">
              {order.factoryName}
            </Title>
          </Link>
          <Title variant="body-xs" color="muted">
            {sentOrderNumberLine(order)}
          </Title>
        </div>
      </Table.Cell>
      <Table.Cell label="Data" variant="dim" className="whitespace-nowrap">
        {formatDate(order.createdAt, "", { timeZone: BRT_TIME_ZONE })}
      </Table.Cell>
      <Table.Cell label="Produtos" variant="dim" align="right">
        {order.itemCount}
      </Table.Cell>
      <Table.Cell
        card="amount"
        label={isOrder ? "Total" : "Total estimado"}
        variant="strong"
        align="right"
        className="whitespace-nowrap"
      >
        {formatMoney(sentOrderTotal(order))}
      </Table.Cell>
      <Table.Cell card="status">
        {isOrder ? (
          <Badge.Root color={portalStatusTone(status)} size="sm">
            <Badge.Text>{portalStatusLabel(status)}</Badge.Text>
          </Badge.Root>
        ) : (
          <SentOrderBadge order={order} />
        )}
      </Table.Cell>
    </Table.Row>
  );
}
