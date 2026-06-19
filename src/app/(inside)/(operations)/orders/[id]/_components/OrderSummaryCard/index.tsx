import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { OrderDetail } from "../../interface";

interface Props {
  order: OrderDetail;
}

export function OrderSummaryCard({ order }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Resumo financeiro
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        <Card.Item variant="stat">
          <Card.Item.Label>Total do pedido</Card.Item.Label>
          <Card.Item.Value>
            <Title variant="body" weight="bold" className="text-[15px]">
              {formatMoney(order.totalAmount)}
            </Title>
          </Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <Card.Item.Label>Comissão</Card.Item.Label>
          <Card.Item.Value color="amber">{formatMoney(order.commissionAmount)}</Card.Item.Value>
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
