import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { Building2 } from "lucide-react";
import { TenantHealthRow } from "../../interface";
import { TREND_COLOR, TREND_LABEL, formatChange } from "../../utils";

const COLUMN_COUNT = 5;

/**
 * Cada empresa classificada por para onde está indo, comparando os 30 dias
 * atuais com os 30 anteriores.
 *
 * Ordenada do pior para o melhor, e é essa a razão de existir: a lista de
 * empresas mostra quem é grande, esta mostra quem está escorregando. Cliente
 * grande em queda é o item mais caro da plataforma.
 */
export function TenantHealthCard({ rows }: { rows: TenantHealthRow[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Saúde da carteira
        </Card.Header.Title>
        <Card.Header.Description>
          Últimos 30 dias contra os 30 anteriores. Quem precisa de atenção vem
          primeiro.
        </Card.Header.Description>
      </Card.Header>

      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Empresa</Table.Head>
              <Table.Head>Situação</Table.Head>
              <Table.Head>Pedidos</Table.Head>
              <Table.Head>Faturamento</Table.Head>
              <Table.Head>Último pedido</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={COLUMN_COUNT}>
                  <EmptyState.Root>
                    <EmptyState.Icon>
                      <Building2 size={32} />
                    </EmptyState.Icon>
                    <EmptyState.Title>Nenhuma empresa ainda</EmptyState.Title>
                    <EmptyState.Description>
                      Provisione a primeira para acompanhar a evolução dela
                      aqui.
                    </EmptyState.Description>
                  </EmptyState.Root>
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((row) => (
                <Table.Row
                  key={row.companyId}
                  href={`/platform/companies/${row.companyId}`}
                >
                  <Table.Cell className="max-w-[260px]">
                    <div className="flex min-w-0 items-center gap-6">
                      <Title
                        variant="body-sm"
                        weight="semibold"
                        className="truncate"
                      >
                        {row.companyName}
                      </Title>
                      {!row.isActive && (
                        <Badge.Root color="red" appearance="tinted" size="xs">
                          <Badge.Text>Suspensa</Badge.Text>
                        </Badge.Root>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="whitespace-nowrap">
                    <Title variant="body-sm" color={TREND_COLOR[row.trend]}>
                      {TREND_LABEL[row.trend]}
                    </Title>
                  </Table.Cell>

                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {/* Os dois números lado a lado: a variação sozinha esconde
                        a escala, e 2→4 pedidos não é o mesmo que 100→200. */}
                    {row.ordersPrevious} → {row.ordersCurrent}
                  </Table.Cell>

                  <Table.Cell className="whitespace-nowrap">
                    <div className="flex flex-col gap-[2px]">
                      <Title variant="body-sm">
                        {formatMoney(row.gmvCurrent)}
                      </Title>
                      <Title
                        variant="micro"
                        color={
                          row.changePercent === null
                            ? "muted"
                            : row.changePercent >= 0
                              ? "green"
                              : "red"
                        }
                      >
                        {formatChange(row.changePercent)} vs. período anterior
                      </Title>
                    </div>
                  </Table.Cell>

                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {formatDate(row.lastOrderDate)}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </Card.Root>
  );
}
