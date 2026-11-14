"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { TextLink } from "@/components/TextLink";
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

interface Props {
  supportCase: SupportCase;
}

/**
 * Um dado da ficha: uma linha por conteúdo — rótulo à esquerda, valor à
 * direita (14/11/2026). Em grade de colunas o celular empilhava rótulo sobre
 * valor e a ficha virava um mosaico difícil de varrer.
 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    // `flex-nowrap` + valor `min-w-0 flex-1`: um nome comprido de cliente
    // ("Comercial de Materiais … Ltda") não cabia ao lado do rótulo e o
    // `flex-wrap` do stat jogava o valor inteiro para baixo, à esquerda. Agora
    // ele quebra DENTRO da coluna da direita, alinhado com os outros valores.
    <Card.Item variant="stat" className="flex-nowrap">
      <Card.Item.Label className="shrink-0">{label}</Card.Item.Label>
      <Card.Item.Actions className="min-w-0 flex-1 justify-end text-right break-words">
        {children}
      </Card.Item.Actions>
    </Card.Item>
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
      {/* Sem o Body o conteúdo encostava na borda do cartão (14/11/2026). */}
      <Card.Body padding="compact">
        <div className="flex flex-col">
          <Field label="Cliente">
            {/* Leva à ficha do cliente: quem trata a reclamação quase sempre
              precisa do histórico de pedidos dele na mesma conversa. A rota é
              pelo id da CARTEIRA — com o `clientId` abria "não encontrado". */}
            {supportCase.companyClientId ? (
              <TextLink
                href={`/clients/${supportCase.companyClientId}/overview`}
              >
                <Title variant="body-sm" weight="medium" color="inherit">
                  {client}
                </Title>
              </TextLink>
            ) : (
              <Title variant="body-sm" weight="medium">
                {client}
              </Title>
            )}
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
            <Title variant="body-sm">
              {formatDate(supportCase.reportedAt)}
            </Title>
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
              <TextLink href={`/orders/${supportCase.order.id}`}>
                <Title variant="body-sm" color="inherit">
                  {supportCase.order.invoiceNumber
                    ? `NF ${supportCase.order.invoiceNumber}`
                    : formatDate(supportCase.order.orderDate)}
                </Title>
              </TextLink>
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
      </Card.Body>
    </Card.Root>
  );
}
