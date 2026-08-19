"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";

import {
  GOAL_METRICS,
  overallPercent,
  percentTone,
  SellerGroup,
  sumRows,
} from "../../utils";
import { GoalMetricCells } from "../GoalMetricCells";

interface Props {
  groups: SellerGroup[];
  /** Troca esta lista pelo detalhe do vendedor — as fábricas dele. */
  onOpen: (group: SellerGroup) => void;
}

/**
 * Uma linha por vendedor, com o mês inteiro resumido.
 *
 * A tela mostrava quatro barras por FÁBRICA de cada pessoa, todas abertas: com
 * oito vendedores e cinco fábricas eram cento e sessenta barras empilhadas, e
 * comparar duas pessoas exigia rolar a página inteira. Aqui as pessoas ficam
 * lado a lado — que é a leitura do gestor no fechamento do mês — e clicar numa
 * delas troca esta lista pelas fábricas dela (ver `SellerGoalsPanel`).
 */
export function GoalsTable({ groups, onOpen }: Props) {
  return (
    <Table.Root>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head title="Clique na linha para ver as fábricas deste vendedor.">
              Vendedor
            </Table.Head>
            {GOAL_METRICS.map((metric) => (
              <Table.Head key={metric.id} align="right" title={metric.help}>
                {metric.label}
              </Table.Head>
            ))}
            <Table.Head
              align="right"
              title="Média dos indicadores que têm meta combinada. Indicador sem meta fica de fora da conta — ninguém combinou aquele número."
            >
              Da meta
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {groups.map((group) => {
            const totals = sumRows(group.rows);
            const overall = overallPercent(totals);

            return (
              <Table.Row
                key={group.sellerId}
                onClick={() => onOpen(group)}
                className="cursor-pointer"
              >
                <Table.Cell variant="strong">
                  <div className="flex flex-col gap-2">
                    {group.sellerName}
                    <Table.CellText variant="dim2">
                      {group.rows.length}{" "}
                      {group.rows.length === 1 ? "fábrica" : "fábricas"}
                    </Table.CellText>
                  </div>
                </Table.Cell>

                <GoalMetricCells totals={totals} />

                <Table.Cell align="right">
                  {overall === null ? (
                    <Badge.Root appearance="tinted" color="neutral" size="xs">
                      <Badge.Text>Sem meta neste mês</Badge.Text>
                    </Badge.Root>
                  ) : (
                    <Title
                      variant="body-sm"
                      weight="semibold"
                      color={percentTone(overall)}
                    >
                      {overall.toFixed(0)}%
                    </Title>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
