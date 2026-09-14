import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Fragment, ReactNode } from "react";
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

interface SummaryRow {
  key: string;
  label: string;
  help: ReactNode;
  value: ReactNode;
  color?: "amber";
}

interface Props {
  order: OrderDetail;
}

export function OrderSummaryCard({ order }: Props) {
  const ipi = Number(order.ipiAmount);
  const tax = Number(order.taxAmount);
  const hasIpi = ipi > 0;
  const hasTax = tax > 0;
  // A coluna Subtotal da tabela já soma o imposto embutido da linha; o resumo
  // acompanha para o subtotal e o total baterem com a tabela. O IPI, quando a
  // fábrica cobra no pedido, continua somado à parte (tem colunas próprias).
  const subtotalWithTax = Number(order.totalAmount) + tax;
  const grandTotal = subtotalWithTax + ipi;

  // Mercadoria e impostos só aparecem quando há imposto embutido: sem ST, a
  // mercadoria é o próprio subtotal e as duas linhas seriam ruído.
  const rows: SummaryRow[] = [
    ...(hasTax
      ? [
          {
            key: "merchandise",
            label: "Mercadoria (sem impostos)",
            help: SUMMARY_HELP.merchandise,
            value: formatMoney(order.totalAmount),
          },
          {
            key: "tax",
            label: "Impostos no preço",
            help: SUMMARY_HELP.tax,
            value: formatMoney(order.taxAmount),
          },
        ]
      : []),
    ...(hasIpi
      ? [
          {
            key: "subtotal",
            label: "Subtotal (sem IPI)",
            help: SUMMARY_HELP.subtotal,
            value: formatMoney(subtotalWithTax.toFixed(2)),
          },
          {
            key: "ipi",
            label: "IPI",
            help: SUMMARY_HELP.ipi,
            value: formatMoney(order.ipiAmount),
          },
        ]
      : []),
    {
      key: "total",
      label: "Total do pedido",
      help: SUMMARY_HELP.total,
      value: (
        <Title variant="body" weight="bold" className="text-[15px]">
          {formatMoney(grandTotal.toFixed(2))}
        </Title>
      ),
    },
    {
      key: "commission",
      label: "Comissão",
      help: SUMMARY_HELP.commission,
      value: formatMoney(order.commissionAmount),
      color: "amber" as const,
    },
    {
      key: "paymentTerm",
      label: "Prazo de pagamento",
      help: SUMMARY_HELP.paymentTerm,
      value: order.paymentTerm?.name ?? "—",
    },
    {
      key: "freight",
      label: "Frete",
      help: SUMMARY_HELP.freight,
      value:
        order.freightType === "FOB"
          ? "FOB — por conta do cliente"
          : order.freightType === "CIF"
            ? "CIF — entrega pela fábrica"
            : "—",
    },
  ];

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Resumo financeiro
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        {rows.map((row, index) => (
          <Fragment key={row.key}>
            {index > 0 && <Divider.Root className="my-2" />}
            <Card.Item variant="stat">
              <LabelWithHelp help={row.help}>{row.label}</LabelWithHelp>
              <Card.Item.Value color={row.color}>{row.value}</Card.Item.Value>
            </Card.Item>
          </Fragment>
        ))}
      </Card.Body>
    </Card.Root>
  );
}
