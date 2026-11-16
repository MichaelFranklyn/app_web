import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { PortalFinancialSummary } from "../../../../_components/PortalFinancialSummary";
import { PortalSentOrderDetail } from "../../../../interface";
import { itemCountLabel, sentOrderHint, sentOrderStage } from "../../../utils";

interface SentOrderStatusProps {
  order: PortalSentOrderDetail;
  token: string;
}

/**
 * O resumo da coluna lateral: o "Resumo financeiro" estimado (mercadoria,
 * impostos, IPI e total — a mesma conta do pedido confirmado), o que acontece
 * agora e o recado que o cliente deixou. A situação (badge) fica no cabeçalho.
 */
export function SentOrderStatus({ order, token }: SentOrderStatusProps) {
  const isOrdered = sentOrderStage(order) === "ordered";

  return (
    <PortalFinancialSummary amounts={order} totalLabel="Total estimado">
      <Title variant="body-xs" color="muted">
        {itemCountLabel(order.itemCount)} · o representante confirma preço e
        condição
      </Title>
      <Title variant="body-sm">{sentOrderHint(order)}</Title>
      {order.clientRequestNote ? (
        <Title variant="body-xs" color="muted" className="break-words">
          Seu recado: {order.clientRequestNote}
        </Title>
      ) : null}
      {isOrdered ? (
        <Button.Link
          href={`/p/${token}/pedidos/${order.id}`}
          appearance="solid"
          color="amber"
          fullWidth
        >
          <Button.Title>Ver o pedido confirmado</Button.Title>
        </Button.Link>
      ) : null}
    </PortalFinancialSummary>
  );
}
