import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { OrderDetail } from "../../interface";

interface Props {
  order: OrderDetail;
}

export function OrderSummaryCard({ order }: Props) {
  const ipi = Number(order.ipiAmount);
  const hasIpi = ipi > 0;
  // A coluna Subtotal da tabela já soma o imposto embutido da linha; o resumo
  // acompanha para o subtotal e o total baterem com a tabela. O IPI, quando a
  // fábrica cobra no pedido, continua somado à parte (tem colunas próprias).
  const subtotalWithTax = Number(order.totalAmount) + Number(order.taxAmount);
  const grandTotal = subtotalWithTax + ipi;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Resumo financeiro
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        {hasIpi && (
          <>
            <Card.Item variant="stat">
              <Card.Item.Label>Subtotal (sem IPI)</Card.Item.Label>
              <Card.Item.Value>
                {formatMoney(subtotalWithTax.toFixed(2))}
              </Card.Item.Value>
            </Card.Item>
            <Divider.Root className="my-2" />
            <Card.Item variant="stat">
              <Card.Item.Label>IPI</Card.Item.Label>
              <Card.Item.Value>{formatMoney(order.ipiAmount)}</Card.Item.Value>
            </Card.Item>
            <Divider.Root className="my-2" />
          </>
        )}
        <Card.Item variant="stat">
          <Card.Item.Label>Total do pedido</Card.Item.Label>
          <Card.Item.Value>
            <Title variant="body" weight="bold" className="text-[15px]">
              {formatMoney(grandTotal.toFixed(2))}
            </Title>
          </Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <Card.Item.Label>Comissão</Card.Item.Label>
          <Card.Item.Value color="amber">
            {formatMoney(order.commissionAmount)}
          </Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <Card.Item.Label>Prazo de pagamento</Card.Item.Label>
          <Card.Item.Value>{order.paymentTerm?.name ?? "—"}</Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <Card.Item.Label>Frete</Card.Item.Label>
          <Card.Item.Value>
            {order.freightType === "FOB"
              ? "FOB — por conta do cliente"
              : order.freightType === "CIF"
                ? "CIF — entrega pela fábrica"
                : "—"}
          </Card.Item.Value>
        </Card.Item>
      </Card.Body>
    </Card.Root>
  );
}
