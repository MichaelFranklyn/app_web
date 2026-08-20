"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { CLIENT_FACTORY_COLUMN_HELP } from "../../../../help";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { Factory, TriangleAlert } from "lucide-react";
import { DeleteFactoryLinkModal } from "./_components/DeleteFactoryLinkModal";
import { EditFactoryLinkModal } from "./_components/EditFactoryLinkModal";
import { LinkFactoryModal } from "./_components/LinkFactoryModal";
import { FactoryLinksTableProps } from "./interface";
import { priorityColor, priorityLabel } from "./utils";
import { cadenceDaysLabel, cadenceSourceLabel } from "@/utils/cadence";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";

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
        <Table.CardHead.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
        >
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
      <Table.Table>
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
            <Table.Head title={CLIENT_FACTORY_COLUMN_HELP.actions}>
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {connections.map((c) => (
            <Table.Row key={c.id} className="group">
              <Table.Cell>
                <Table.CellText variant="strong">
                  {factoryName(c.factory)}
                </Table.CellText>
              </Table.Cell>
              <Table.Cell>
                <Table.CellText variant="dim">
                  {c.seller?.name ?? "—"}
                </Table.CellText>
              </Table.Cell>
              <Table.Cell>
                <Badge.Root
                  color={priorityColor(c.priority)}
                  appearance="tinted"
                >
                  <Badge.Text>{priorityLabel(c.priority)}</Badge.Text>
                </Badge.Root>
              </Table.Cell>
              <Table.Cell>
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
                        <span
                          className="text-(--amber)"
                          aria-label={c.cadence.divergenceMessage}
                        >
                          <TriangleAlert size={13} aria-hidden />
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
              <Table.Cell>
                <Table.CellText variant="dim">
                  {formatDate(c.lastVisitDate)}
                </Table.CellText>
              </Table.Cell>
              <Table.Cell>
                <Badge.Root color="green" appearance="tinted">
                  <Badge.Text>Ativo</Badge.Text>
                </Badge.Root>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center justify-end gap-2">
                  <EditFactoryLinkModal
                    link={c}
                    onSaved={onChanged}
                    onUpdateOptimistic={onUpdateOptimistic}
                    onCommit={onCommit}
                    onRollback={onRollback}
                  />
                  <DeleteFactoryLinkModal
                    linkId={c.id}
                    factoryName={factoryName(c.factory)}
                    onRemoved={onChanged}
                    onRemoveOptimistic={onRemoveOptimistic}
                    onCommit={onCommit}
                    onRollback={onRollback}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
          {connections.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={7}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Factory size={32} />
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
