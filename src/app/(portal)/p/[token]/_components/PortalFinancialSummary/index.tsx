"use client";

// Cliente: `Card.Header` vem de módulo "use client", e a subpeça `.Title` não
// atravessa a fronteira servidor→cliente.
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ReactNode } from "react";
import { freightLabel, portalOrderTotal } from "../../utils";

interface PortalFinancialSummaryProps {
  amounts: {
    totalAmount: string;
    taxAmount: string;
    ipiAmount: string;
  };
  /** "Total do pedido" no confirmado, "Total estimado" no enviado. */
  totalLabel?: string;
  /** `undefined` esconde a linha (o enviado ainda não tem prazo combinado). */
  paymentTermName?: string | null;
  /** `undefined` esconde a linha (o enviado ainda não tem frete combinado). */
  freightType?: string | null;
  /** O que vem abaixo das linhas: o que acontece agora, recado, ação. */
  children?: ReactNode;
}

/**
 * O "Resumo financeiro" do detalhe de pedido do sistema, na versão do cliente:
 * as mesmas linhas e a mesma conta (mercadoria, impostos no preço, subtotal
 * sem IPI, IPI, total), sem a comissão — que é assunto do escritório.
 *
 * Mercadoria e impostos só aparecem quando há imposto embutido, e subtotal e
 * IPI só quando há IPI: sem eles, a linha repetiria o total.
 */
export function PortalFinancialSummary({
  amounts,
  totalLabel = "Total do pedido",
  paymentTermName,
  freightType,
  children,
}: PortalFinancialSummaryProps) {
  const tax = Number(amounts.taxAmount);
  const ipi = Number(amounts.ipiAmount);
  const subtotalWithTax = Number(amounts.totalAmount) + tax;

  const rows: { key: string; label: string; value: ReactNode }[] = [
    ...(tax > 0
      ? [
          {
            key: "merchandise",
            label: "Mercadoria (sem impostos)",
            value: formatMoney(amounts.totalAmount),
          },
          {
            key: "tax",
            label: "Impostos no preço",
            value: formatMoney(amounts.taxAmount),
          },
        ]
      : []),
    ...(ipi > 0
      ? [
          {
            key: "subtotal",
            label: "Subtotal (sem IPI)",
            value: formatMoney(subtotalWithTax),
          },
          { key: "ipi", label: "IPI", value: formatMoney(amounts.ipiAmount) },
        ]
      : []),
    {
      key: "total",
      label: totalLabel,
      value: (
        <Title variant="body-md" as="span" weight="bold">
          {formatMoney(portalOrderTotal(amounts))}
        </Title>
      ),
    },
    ...(paymentTermName !== undefined
      ? [
          {
            key: "paymentTerm",
            label: "Prazo de pagamento",
            value: paymentTermName || "—",
          },
        ]
      : []),
    ...(freightType !== undefined
      ? [{ key: "freight", label: "Frete", value: freightLabel(freightType) }]
      : []),
  ];

  return (
    <Card.Root className="h-auto">
      <Card.Header>
        <Card.Header.Title>Resumo financeiro</Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        {/* O separador é a borda do próprio Card.Item (como no sistema). */}
        {rows.map((row) => (
          <Card.Item key={row.key} variant="stat">
            <Card.Item.Label>{row.label}</Card.Item.Label>
            <Card.Item.Value>{row.value}</Card.Item.Value>
          </Card.Item>
        ))}
        {children ? (
          <div className="flex flex-col gap-8 pt-12">{children}</div>
        ) : null}
      </Card.Body>
    </Card.Root>
  );
}
