"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { installmentDueBasisLabel } from "@/app/(inside)/_shared/commissions";
import { INSTALLMENT_COLUMN_HELP } from "../../../help";
import { OrderDetail } from "../../interface";
import {
  commissionModeLabel,
  installmentCommission,
  isPaymentBasis,
} from "../../utils";
import { InstallmentRowActions } from "./InstallmentRowActions";
import { InstallmentStatusCell } from "./InstallmentStatusCell";

interface Props {
  order: OrderDetail;
  onChanged: () => void;
}

export function InstallmentsCard({ order, onChanged }: Props) {
  const paymentMode = isPaymentBasis(order.commissionCalcBasis);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          Parcelas e comissão
          <HelpTooltip
            label="Como funciona a comissão deste pedido?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" weight="semibold">
                  Modo {commissionModeLabel(order.commissionCalcBasis)}
                </Title>
                <Title variant="body-sm">
                  {paymentMode
                    ? "A fábrica paga a comissão de cada parcela conforme o cliente paga o boleto. Marque cada boleto como pago para liberar a comissão proporcional."
                    : "A fábrica paga a comissão inteira no faturamento, independentemente dos boletos. As parcelas abaixo são o cronograma de cobrança do cliente."}
                </Title>
                <Title variant="body-sm">
                  Se o cliente não pagar, marque a parcela como inadimplente: a
                  comissão deixa de ser devida e, se já tiver sido paga, volta
                  como estorno no próximo fechamento.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        {/* Faturamento, nota e base do vencimento numa linha cinza: eram três
            pílulas iguais que pareciam filtros ou situações (crítica do
            detalhe do pedido, 23/11/2026). A nota é a chave que a fábrica usa
            na planilha de comissão; a base do vencimento evita que um prazo
            contado da compra pareça erro para quem confere pela nota. */}
        <Table.CardHead.Actions>
          <Title variant="body-sm" color="muted">
            {[
              `Faturado em ${formatDateDMY(order.invoicedAt ?? undefined)}`,
              order.invoiceNumber && `NF ${order.invoiceNumber}`,
              `vencimentos contam ${installmentDueBasisLabel(order.installmentDueBasis)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Title>
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada parcela vira um cartão, sem rolar de lado. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head title={INSTALLMENT_COLUMN_HELP.sequence}>#</Table.Head>
            <Table.Head title={INSTALLMENT_COLUMN_HELP.dueDate}>
              Vencimento
            </Table.Head>
            <Table.Head align="right" title={INSTALLMENT_COLUMN_HELP.amount}>
              Valor
            </Table.Head>
            <Table.Head
              align="right"
              title={INSTALLMENT_COLUMN_HELP.commission}
            >
              Comissão
            </Table.Head>
            <Table.Head title={INSTALLMENT_COLUMN_HELP.status}>
              Situação
            </Table.Head>
            <Table.Head align="right" title={INSTALLMENT_COLUMN_HELP.actions}>
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {order.installments.map((inst) => (
            <Table.Row key={inst.id}>
              <Table.Cell label="Parcela" variant="strong">
                {inst.sequence}
              </Table.Cell>
              <Table.Cell card="title">
                {formatDateDMY(inst.dueDate ?? undefined)}
              </Table.Cell>
              <Table.Cell card="amount" label="Valor" align="right">
                {formatMoney(inst.amount)}
              </Table.Cell>
              <Table.Cell label="Comissão" align="right">
                <Title variant="body-sm" weight="bold">
                  {formatMoney(installmentCommission(inst))}
                </Title>
              </Table.Cell>
              <Table.Cell card="status">
                <InstallmentStatusCell installment={inst} />
              </Table.Cell>
              <Table.Cell card="actions">
                <InstallmentRowActions
                  installment={inst}
                  onChanged={onChanged}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
