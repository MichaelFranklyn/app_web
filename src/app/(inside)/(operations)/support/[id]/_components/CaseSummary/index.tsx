"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_PRIORITY_COLOR,
  SUPPORT_PRIORITY_LABEL,
  SupportCase,
  supportAgeLabel,
} from "@/utils/support";
import Link from "next/link";

interface Props {
  supportCase: SupportCase;
}

/** Um dado da ficha: o rótulo em cima, o valor embaixo. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Title variant="label" color="muted">
        {label}
      </Title>
      {children}
    </div>
  );
}

/**
 * A ficha do caso: quem, o quê, de qual fábrica e desde quando.
 *
 * Fica acima da linha do tempo porque é o que se lê ANTES de decidir o que
 * fazer — a conversa vem depois.
 */
export function CaseSummary({ supportCase }: Props) {
  const client = clientDisplayName(supportCase.client);

  return (
    <Card.Root>
      <div className="tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-2 gap-16">
        <Field label="Cliente">
          {/* Leva à ficha do cliente: quem trata a reclamação quase sempre
              precisa do histórico de pedidos dele na mesma conversa. */}
          <Link
            href={`/clients/${supportCase.clientId}/overview`}
            className="text-(--amber) hover:underline"
          >
            <Title variant="body-sm" weight="medium" className="text-inherit">
              {client}
            </Title>
          </Link>
        </Field>
        <Field label="Vendedor">
          <Title variant="body-sm">{supportCase.seller?.name ?? "—"}</Title>
        </Field>
        <Field label="Fábrica">
          <Title variant="body-sm">
            {supportCase.factory ? factoryName(supportCase.factory) : "—"}
          </Title>
        </Field>
        <Field label="Tipo de problema">
          <Title variant="body-sm">
            {SUPPORT_CATEGORY_LABEL[supportCase.category]}
          </Title>
        </Field>
        <Field label="Urgência">
          <Badge.Root
            color={SUPPORT_PRIORITY_COLOR[supportCase.priority]}
            appearance="tinted"
            size="sm"
          >
            <Badge.Text>
              {SUPPORT_PRIORITY_LABEL[supportCase.priority]}
            </Badge.Text>
          </Badge.Root>
        </Field>
        <Field label="Cliente avisou em">
          <Title variant="body-sm">{formatDate(supportCase.reportedAt)}</Title>
        </Field>
        <Field label="Tempo">
          <Title variant="body-sm">
            {supportAgeLabel(supportCase.ageDays, supportCase.isOpen)}
          </Title>
        </Field>
        <Field label="Valor envolvido">
          <Title variant="body-sm">
            {supportCase.amount ? formatMoney(supportCase.amount) : "—"}
          </Title>
        </Field>
        {supportCase.order && (
          <Field label="Pedido">
            <Link
              href={`/orders/${supportCase.order.id}`}
              className="text-(--amber) hover:underline"
            >
              <Title variant="body-sm" className="text-inherit">
                {supportCase.order.invoiceNumber
                  ? `NF ${supportCase.order.invoiceNumber}`
                  : formatDate(supportCase.order.orderDate)}
              </Title>
            </Link>
          </Field>
        )}
        <Field label="Registrado por">
          <Title variant="body-sm">{supportCase.openedBy?.name ?? "—"}</Title>
        </Field>
      </div>

      {supportCase.description && (
        <div className="mt-16 flex flex-col gap-4">
          <Title variant="label" color="muted">
            O que o cliente contou
          </Title>
          <Title variant="body-sm" className="whitespace-pre-line">
            {supportCase.description}
          </Title>
        </div>
      )}

      {supportCase.resolution && (
        <div className="mt-16 flex flex-col gap-4">
          <Title variant="label" color="muted">
            Como terminou
          </Title>
          <Title variant="body-sm" className="whitespace-pre-line">
            {supportCase.resolution}
          </Title>
        </div>
      )}
    </Card.Root>
  );
}
