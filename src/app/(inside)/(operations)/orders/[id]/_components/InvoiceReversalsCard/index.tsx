import { Table } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";

import { InvoiceReversal } from "../../interface";
import { reversalSummary } from "../../utils";

interface Props {
  reversals: InvoiceReversal[];
}

const KIND_LABEL: Record<string, string> = {
  uninvoice: "Faturamento desfeito",
  revise: "Parcelas refeitas",
};

/**
 * Vezes em que o faturamento deste pedido foi desfeito ou refeito.
 *
 * Desfazer apaga as parcelas — e com elas boleto pago e comissão recebida.
 * Aqui fica quem fez, quando, por quê e quanto havia: é o que responde, meses
 * depois, "por que este pedido foi faturado duas vezes?". Some quando não há
 * nada a mostrar: a maioria dos pedidos nunca passa por isso.
 */
export function InvoiceReversalsCard({ reversals }: Props) {
  if (reversals.length === 0) return null;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Histórico do faturamento</Table.CardHead.Title>
      </Table.CardHead>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Quando</Table.Head>
            <Table.Head>O que foi feito</Table.Head>
            <Table.Head>Quem</Table.Head>
            <Table.Head>Motivo</Table.Head>
            <Table.Head align="right">Valor que estava faturado</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {reversals.map((reversal) => (
            <Table.Row key={reversal.id}>
              <Table.Cell variant="dim">
                {formatDateDMY(reversal.createdAt)}
              </Table.Cell>
              <Table.Cell>
                <div className="flex flex-col items-start gap-2">
                  <Table.CellText variant="strong">
                    {KIND_LABEL[reversal.kind] ?? reversal.kind}
                  </Table.CellText>
                  <Table.CellText variant="dim2">
                    {reversalSummary(reversal)}
                  </Table.CellText>
                </div>
              </Table.Cell>
              <Table.Cell variant="dim">{reversal.userEmail ?? "—"}</Table.Cell>
              <Table.Cell variant="dim">{reversal.reason ?? "—"}</Table.Cell>
              <Table.Cell variant="strong" align="right">
                {formatMoney(reversal.totalAmount)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
