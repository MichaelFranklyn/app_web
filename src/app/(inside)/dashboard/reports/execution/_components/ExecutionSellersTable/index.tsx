"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table, TableSort } from "@/components/Table";
import { CalendarX } from "lucide-react";

import { formatPercent } from "../../../../utils";
import { ExecutionSellerRow } from "../../interface";
import { executionTone, recordedByPerson } from "../../utils";

interface Props {
  items: ExecutionSellerRow[];
  loading: boolean;
  sort: TableSort;
}

const TONE_COLOR = { urgente: "red", atencao: "amber", ok: "green" } as const;

/**
 * Uma linha por vendedor. Sem paginação: são poucos, e a leitura é comparar um
 * com o outro na mesma tela.
 */
export function ExecutionSellersTable({ items, loading, sort }: Props) {
  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Execução por vendedor
          <HelpTooltip
            label="Sobre a execução por vendedor"
            content="Visitas e contatos que a rotina planejou no período. Conta como execução qualquer resposta (fui, não estava, não deu tempo) e a visita que o pedido provou. Rotas fixas e visitas remarcadas ficam de fora."
          />
        </Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="seller">Vendedor</Table.Head>
            <Table.Head sortKey="planned" sortFirst="desc">
              Planejadas
            </Table.Head>
            <Table.Head sortKey="executionRate" sortFirst="desc">
              Execução
            </Table.Head>
            <Table.Head sortKey="recorded" sortFirst="desc">
              Registradas
            </Table.Head>
            <Table.Head sortKey="workedInferred" sortFirst="desc">
              Pelo pedido
            </Table.Head>
            <Table.Head sortKey="pending" sortFirst="desc">
              Aguardando
            </Table.Head>
            <Table.Head sortKey="autoClosed" sortFirst="desc">
              Fechadas sem resposta
            </Table.Head>
            <Table.Head sortKey="converted" sortFirst="desc">
              Viraram pedido
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={8} rows={4} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CalendarX size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma visita planejada no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Só entram dias que já passaram. Amplie o período no filtro
                    acima.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row key={row.sellerId}>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {row.sellerName}
                </Table.Cell>
                <Table.Cell variant="dim">{row.planned}</Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  <Badge.Root
                    color={TONE_COLOR[executionTone(row.executionRate)]}
                    appearance="tinted"
                  >
                    <Badge.Text>{formatPercent(row.executionRate)}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell variant="dim">{recordedByPerson(row)}</Table.Cell>
                <Table.Cell variant="dim">{row.workedInferred}</Table.Cell>
                <Table.Cell variant="dim">{row.pending}</Table.Cell>
                <Table.Cell variant="dim">{row.autoClosed}</Table.Cell>
                <Table.Cell variant="dim">{row.converted}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
