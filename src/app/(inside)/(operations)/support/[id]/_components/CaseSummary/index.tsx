"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
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
 * A ficha do caso: quem, o quê, de qual fábrica e desde quando.
 *
 * Fica acima da linha do tempo porque é o que se lê ANTES de decidir o que
 * fazer — a conversa vem depois.
 */
export function CaseSummary({ supportCase }: Props) {
  const client = clientDisplayName(supportCase.client);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Resumo</Card.Header.Title>
      </Card.Header>
      <Card.Body>
        {/* Padrão das fichas (24/11/2026): em duas colunas o rótulo vai EM
            CIMA do valor (Card.Field), como em /settings/company. Dado vazio
            não ganha campo — corrigir é no "Corrigir dados". */}
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          {/* Leva à ficha do cliente: quem trata a reclamação quase sempre
              precisa do histórico de pedidos dele na mesma conversa. A rota é
              pelo id da CARTEIRA — com o `clientId` abria "não encontrado". */}
          {supportCase.companyClientId ? (
            <Card.Field label="Cliente">
              <TextLink
                href={`/clients/${supportCase.companyClientId}/overview`}
              >
                <Title variant="body" weight="medium" color="inherit">
                  {client}
                </Title>
              </TextLink>
            </Card.Field>
          ) : (
            <Card.Field label="Cliente" value={client} />
          )}
          {supportCase.seller?.name && (
            <Card.Field label="Vendedor" value={supportCase.seller.name} />
          )}
          {supportCase.factory && (
            <Card.Field
              label="Fábrica"
              value={factoryName(supportCase.factory)}
            />
          )}
          <Card.Field
            label="Tipo de problema"
            value={SUPPORT_CATEGORY_LABEL[supportCase.category]}
          />
          {/* "Normal" é texto: a pílula fica para a exceção. */}
          {supportCase.priority === "NORMAL" ? (
            <Card.Field
              label="Urgência"
              value={SUPPORT_PRIORITY_LABEL[supportCase.priority]}
            />
          ) : (
            <Card.Field label="Urgência">
              <div className="flex">
                <Badge.Root
                  color={SUPPORT_PRIORITY_COLOR[supportCase.priority]}
                  appearance="tinted"
                  size="sm"
                >
                  <Badge.Text>
                    {SUPPORT_PRIORITY_LABEL[supportCase.priority]}
                  </Badge.Text>
                </Badge.Root>
              </div>
            </Card.Field>
          )}
          <Card.Field
            label="Cliente avisou em"
            value={formatDate(supportCase.reportedAt)}
          />
          <Card.Field
            label="Tempo"
            value={supportAgeLabel(supportCase.ageDays, supportCase.isOpen)}
          />
          {!!supportCase.amount && (
            <Card.Field
              label="Valor envolvido"
              value={formatMoney(supportCase.amount)}
            />
          )}
          {supportCase.order && (
            <Card.Field label="Pedido">
              <TextLink href={`/orders/${supportCase.order.id}`}>
                <Title variant="body" color="inherit">
                  {supportCase.order.invoiceNumber
                    ? `NF ${supportCase.order.invoiceNumber}`
                    : formatDate(supportCase.order.orderDate)}
                </Title>
              </TextLink>
            </Card.Field>
          )}
          {supportCase.openedBy?.name && (
            <Card.Field
              label="Registrado por"
              value={supportCase.openedBy.name}
            />
          )}
          {/* Texto livre ocupa a largura toda: em meia coluna um relato longo
              virava uma tripa estreita. */}
          {supportCase.description && (
            <Grid.Item span={{ base: 1, desktop: 2 }}>
              <Card.Field label="O que o cliente contou">
                <Title variant="body" className="whitespace-pre-line">
                  {supportCase.description}
                </Title>
              </Card.Field>
            </Grid.Item>
          )}
          {supportCase.resolution && (
            <Grid.Item span={{ base: 1, desktop: 2 }}>
              <Card.Field label="Como terminou">
                <Title variant="body" className="whitespace-pre-line">
                  {supportCase.resolution}
                </Title>
              </Card.Field>
            </Grid.Item>
          )}
        </Grid.Root>
      </Card.Body>
    </Card.Root>
  );
}
