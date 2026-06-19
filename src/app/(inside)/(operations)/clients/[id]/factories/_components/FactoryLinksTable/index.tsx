"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Factory } from "lucide-react";
import { DeleteFactoryLinkModal } from "./_components/DeleteFactoryLinkModal";
import { EditFactoryLinkModal } from "./_components/EditFactoryLinkModal";
import { LinkFactoryModal } from "./_components/LinkFactoryModal";
import { FactoryLinksTableProps } from "./interface";
import { factoryName, formatDate, priorityColor, priorityLabel } from "./utils";

export function FactoryLinksTable({
  clientId,
  connections,
  onChanged,
  onUpdateOptimistic,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: FactoryLinksTableProps) {
  return (
    <Table.Root>
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
        <Table.CardHead.Actions>
          <LinkFactoryModal clientId={clientId} onSuccess={onChanged} />
        </Table.CardHead.Actions>
      </Table.CardHead>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Prioridade</Table.Head>
            <Table.Head>Frequência</Table.Head>
            <Table.Head>Última Visita</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Ações</Table.Head>
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
                <Table.CellText variant="dim">
                  {c.visitFrequencyDays != null
                    ? `${c.visitFrequencyDays} dias`
                    : "—"}
                </Table.CellText>
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
