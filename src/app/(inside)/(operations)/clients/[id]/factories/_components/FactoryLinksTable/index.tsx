"use client";

import { Badge } from "@/components/Badges";
import { NegativeTag } from "@/components/ClientFactoryNegative";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { CLIENT_FACTORY_COLUMN_HELP } from "../../../../help";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { Factory, TriangleAlert } from "lucide-react";
import { FactoryLinkRowActions } from "./_components/FactoryLinkRowActions";
import { LinkFactoryModal } from "./_components/LinkFactoryModal";
import { FactoryLinksTableProps } from "./interface";
import { priorityColor, priorityLabel } from "./utils";
import { cadenceDaysLabel, cadenceSourceLabel } from "@/utils/cadence";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { ICON_SIZE } from "@/components/Icon";

export function FactoryLinksTable({
  clientId,
  connections,
  onChanged,
  autoOpenLink,
  onUpdateOptimistic,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: FactoryLinksTableProps) {
  return (
    <Table.Root data-tour="client-factories-table">
      <Table.CardHead>
        <Table.CardHead.Title>
          Vínculos por Fábrica
          <HelpTooltip
            label="Sobre os vínculos por fábrica"
            content="Fábricas que este cliente compra, com o vendedor responsável, prioridade e frequência de visita. Só aparecem fábricas que o vendedor tem acesso."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions data-tour="client-factories-actions">
          <LinkFactoryModal
            clientId={clientId}
            onSuccess={onChanged}
            autoOpen={autoOpenLink}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>
      {/* Abaixo do desktop cada vínculo vira um cartão: as 7 colunas rolando de lado escondiam as ações. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.factory}>
              Fábrica
            </Table.Head>
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.seller}>
              Vendedor
            </Table.Head>
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.priority}>
              Prioridade
            </Table.Head>
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.frequency}>
              Frequência
            </Table.Head>
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.lastVisit}>
              Última Visita
            </Table.Head>
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.status}>
              Status
            </Table.Head>
            <Table.Head
              title={CLIENT_FACTORY_COLUMN_HELP.actions}
              align="right"
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {connections.map((c) => (
            <Table.Row key={c.id} className="group">
              <Table.Cell card="title">
                <Table.CellText variant="strong">
                  {factoryName(c.factory)}
                </Table.CellText>
              </Table.Cell>
              <Table.Cell label="Vendedor">
                <Table.CellText variant="dim">
                  {c.seller?.name ?? "—"}
                </Table.CellText>
              </Table.Cell>
              {/* No cartão, prioridade e situação fecham com as ações na última
                  linha, sem rótulo: "[Alta] [Ativo] ……… [⋯]" (14/11/2026). A
                  situação tem coluna própria no desktop; aqui ela vem junto. */}
              <Table.Cell card="aside">
                <Badge.Root
                  color={priorityColor(c.priority)}
                  appearance="tinted"
                >
                  <Badge.Text>{priorityLabel(c.priority)}</Badge.Text>
                </Badge.Root>
                <span className="desktop:hidden">
                  <NegativeTag
                    isNegative={c.isNegative}
                    negativeSince={c.negativeSince}
                    negativeReason={c.negativeReason}
                  />
                </span>
              </Table.Cell>
              <Table.Cell label="Frequência">
                {/* O número E a procedência dele. Mostrar só "45 dias"
                    esconderia do vendedor o que ele não tem como saber de
                    cabeça: o intervalo real entre os últimos pedidos. Quando a
                    estimativa dele contradiz esse intervalo, o aviso diz os
                    dois números e qual está valendo. */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <Table.CellText variant="dim">
                      {cadenceDaysLabel(c.cadence)}
                    </Table.CellText>
                    {c.cadence?.isDivergent && c.cadence.divergenceMessage && (
                      <Tooltip content={c.cadence.divergenceMessage}>
                        <span aria-label={c.cadence.divergenceMessage}>
                          <TriangleAlert
                            size={ICON_SIZE.sm}
                            className="text-(--color-action-text)"
                            aria-hidden
                          />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                  {c.cadence && c.cadence.days != null && (
                    <Title variant="micro" color="muted">
                      {cadenceSourceLabel(c.cadence.source)}
                    </Title>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell label="Última visita">
                <Table.CellText variant="dim">
                  {formatDate(c.lastVisitDate)}
                </Table.CellText>
              </Table.Cell>
              <Table.Cell card="hidden">
                {/* A coluna era um "Ativo" fixo. Negativado é o único estado que
                    o vínculo tem além de ativo, e é o que muda o que o vendedor
                    pode fazer: sai da rotina desta fábrica e não recebe pedido
                    dela. O porquê e o desde quando ficam no tooltip da tarja. */}
                <NegativeTag
                  isNegative={c.isNegative}
                  negativeSince={c.negativeSince}
                  negativeReason={c.negativeReason}
                />
              </Table.Cell>
              <Table.Cell card="actions" align="right">
                <FactoryLinkRowActions
                  negative={{
                    linkId: c.id,
                    factoryName: factoryName(c.factory),
                    isNegative: c.isNegative,
                    negativeSince: c.negativeSince,
                    // Repinta a linha com o que o servidor confirmou (a
                    // mutation já devolve o vínculo inteiro), e fecha o ciclo
                    // otimista para o próximo rollback partir daqui.
                    onSaved: (state) => {
                      onUpdateOptimistic(c.id, state);
                      onCommit();
                    },
                  }}
                  edit={{
                    link: c,
                    onSaved: onChanged,
                    onUpdateOptimistic,
                    onCommit,
                    onRollback,
                  }}
                  remove={{
                    linkId: c.id,
                    factoryName: factoryName(c.factory),
                    onRemoved: onChanged,
                    onRemoveOptimistic,
                    onCommit,
                    onRollback,
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
          {connections.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={7}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Factory />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum vínculo cadastrado</EmptyState.Title>
                  <EmptyState.Description>
                    Vincule uma fábrica a este cliente para definir vendedor,
                    prioridade e frequência de visita.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
