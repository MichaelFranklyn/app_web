import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ReactNode } from "react";
import { SUMMARY_HELP } from "../../../help";
import { OrderDetail } from "../../interface";

/**
 * Rótulo com o "?" ao lado. Cada linha deste resumo soma uma base diferente
 * (com IPI, sem IPI, só a comissão) e é aqui que o vendedor confere o pedido
 * contra o que a fábrica cobrou — o rótulo sozinho não diz qual é qual.
 */
const LabelWithHelp = ({
  children,
  help,
}: {
  children: ReactNode;
  help: ReactNode;
}) => (
  <Card.Item.Label className="inline-flex items-center gap-2">
    {children}
    <HelpTooltip label="Sobre este valor" content={help} position="left" />
  </Card.Item.Label>
);

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
              <LabelWithHelp help={SUMMARY_HELP.subtotal}>
                Subtotal (sem IPI)
              </LabelWithHelp>
              <Card.Item.Value>
                {formatMoney(subtotalWithTax.toFixed(2))}
              </Card.Item.Value>
            </Card.Item>
            <Divider.Root className="my-2" />
            <Card.Item variant="stat">
              <LabelWithHelp help={SUMMARY_HELP.ipi}>IPI</LabelWithHelp>
              <Card.Item.Value>{formatMoney(order.ipiAmount)}</Card.Item.Value>
            </Card.Item>
            <Divider.Root className="my-2" />
          </>
        )}
        <Card.Item variant="stat">
          <LabelWithHelp help={SUMMARY_HELP.total}>
            Total do pedido
          </LabelWithHelp>
          <Card.Item.Value>
            <Title variant="body" weight="bold" className="text-[15px]">
              {formatMoney(grandTotal.toFixed(2))}
            </Title>
          </Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <LabelWithHelp help={SUMMARY_HELP.commission}>Comissão</LabelWithHelp>
          <Card.Item.Value color="amber">
            {formatMoney(order.commissionAmount)}
          </Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <LabelWithHelp help={SUMMARY_HELP.paymentTerm}>
            Prazo de pagamento
          </LabelWithHelp>
          <Card.Item.Value>{order.paymentTerm?.name ?? "—"}</Card.Item.Value>
        </Card.Item>
        <Divider.Root className="my-2" />
        <Card.Item variant="stat">
          <LabelWithHelp help={SUMMARY_HELP.freight}>Frete</LabelWithHelp>
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
