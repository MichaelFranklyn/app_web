"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { Ruler } from "lucide-react";
import { PRODUCT_UNITS_QUERY } from "../../gql";
import { AddUnitModal } from "./AddUnitModal";
import { DeleteUnitModal } from "./DeleteUnitModal";
import { EditUnitModal } from "./EditUnitModal";

interface UnitNode {
  id: string;
  label: string;
  isActive: boolean;
}

const listInput = { first: 200 };

export function UnitsSection() {
  const { data, loading, refetch } = useQuery<{
    productUnits: { edges: { node: UnitNode }[]; totalCount: number };
  }>(PRODUCT_UNITS_QUERY, { variables: { input: listInput } });

  const units = data?.productUnits.edges.map((e) => e.node) ?? [];

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Unidades
          <HelpTooltip
            label="O que é uma unidade?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Unidade
                </Title>
                <Title variant="body-sm">
                  Como o produto é medido e vendido. Ex.: &quot;Saco&quot;,
                  &quot;Metro&quot;, &quot;Quilograma&quot;, &quot;Unidade&quot;.
                </Title>
                <Title variant="body-sm" color="muted">
                  É um catálogo da empresa, compartilhado por todas as fábricas.
                  Cada produto escolhe uma unidade base.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddUnitModal onDone={() => refetch()} />
        </Table.CardHead.Actions>
      </Table.CardHead>
      <Table.Table maxHeight={360}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Nome</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={2} rows={3} />
          ) : units.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Ruler size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma unidade cadastrada
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Nova unidade&quot; para definir como os produtos são
                    medidos e vendidos.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            units.map((u) => (
              <Table.Row key={u.id}>
                <Table.Cell variant="strong">{u.label}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditUnitModal unit={u} onDone={() => refetch()} />
                    <DeleteUnitModal
                      unitId={u.id}
                      unitLabel={u.label}
                      onDone={() => refetch()}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
