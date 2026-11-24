import { Card } from "@/components/Card";
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
  // `min-w-0 flex-1`: o rótulo comprido ("Mercadoria (sem impostos)") quebra
  // dentro da própria coluna em vez de empurrar o valor para a linha de baixo
  // (crítica de /orders/[id], 23/11/2026).
  <Card.Item.Label className="inline-flex min-w-0 flex-1 items-center gap-2">
    {children}
    <HelpTooltip label="Sobre este valor" content={help} position="left" />
  </Card.Item.Label>
);

interface SummaryRow {
  key: string;
  label: string;
  help: ReactNode;
  value: ReactNode;
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
            value: formatMoney(subtotalWithTax),
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
        <Title variant="body-md" as="span" weight="bold">
          {formatMoney(grandTotal)}
        </Title>
      ),
    },
    {
      key: "commission",
      label: "Comissão",
      help: SUMMARY_HELP.commission,
      // Valor em cor de texto: âmbar é só do que se clica (revisão 13/11/2026).
      value: formatMoney(order.sellerCommissionAmount),
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
        <Card.Header.Title>Resumo financeiro</Card.Header.Title>
      </Card.Header>
      {/* Entre 1024 e 1600px o resumo ocupa a largura toda, acima da tabela
          de itens (ver content.tsx): `wide` põe as linhas em duas colunas. */}
      <Card.Body padding="compact" columns="wide">
        {/* O separador é a borda do próprio Card.Item: um Divider a mais
            entre eles desenhava linha dupla. */}
        {rows.map((row) => (
          <Card.Item key={row.key} variant="stat">
            <LabelWithHelp help={row.help}>{row.label}</LabelWithHelp>
            <Card.Item.Value className="shrink-0 whitespace-nowrap">
              {row.value}
            </Card.Item.Value>
          </Card.Item>
        ))}
      </Card.Body>
    </Card.Root>
  );
}
