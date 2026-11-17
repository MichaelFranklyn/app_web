import { Table } from "@/components/Table";
import { formatDateDMY } from "@/utils/format/masks";

import { OrderReopening } from "../../interface";

interface Props {
  reopenings: OrderReopening[];
}

/** O status gravado vem no valor do banco; aqui, na palavra da tela. */
const RESTORED_LABEL: Record<string, string> = {
  rascunho: "Orçamento",
  enviado: "Orçamento enviado",
  confirmado: "Pedido confirmado",
};

/**
 * Vezes em que este pedido estava cancelado e foi reaberto.
 *
 * Responde, meses depois, "esse pedido não tinha sido cancelado?": quem
 * reabriu, quando, por quê, e o cancelamento que foi desfeito. Some quando não
 * há nada a mostrar — quase nenhum pedido passa por isso.
 */
export function ReopeningsCard({ reopenings }: Props) {
  if (reopenings.length === 0) return null;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Histórico de reaberturas</Table.CardHead.Title>
      </Table.CardHead>
      {/* Abaixo do desktop cada registro vira um cartão, sem rolar de lado. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Quando</Table.Head>
            <Table.Head>Voltou para</Table.Head>
            <Table.Head>Quem</Table.Head>
            <Table.Head>Motivo</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {reopenings.map((reopening) => (
            <Table.Row key={reopening.id}>
              <Table.Cell label="Quando" variant="dim">
                {formatDateDMY(reopening.createdAt)}
              </Table.Cell>
              <Table.Cell card="title">
                <div className="flex flex-col items-start gap-2">
                  <Table.CellText variant="strong">
                    {RESTORED_LABEL[reopening.restoredStatus] ??
                      reopening.restoredStatus}
                  </Table.CellText>
                  <Table.CellText variant="dim2">
                    {cancellationSummary(reopening)}
                  </Table.CellText>
                </div>
              </Table.Cell>
              <Table.Cell label="Quem" variant="dim">
                {reopening.userEmail ?? "—"}
              </Table.Cell>
              <Table.Cell label="Motivo" variant="dim">
                {reopening.reason}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}

function cancellationSummary(reopening: OrderReopening): string {
  const when = reopening.cancelledAt
    ? `Cancelado em ${formatDateDMY(reopening.cancelledAt)}`
    : "Cancelamento desfeito";
  return reopening.cancelReason ? `${when} · ${reopening.cancelReason}` : when;
}
