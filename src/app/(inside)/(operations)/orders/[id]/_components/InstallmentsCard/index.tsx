"use client";

import { Badge } from "@/components/Badges";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { installmentDueBasisLabel } from "@/app/(inside)/_shared/commissions";
import { OrderDetail } from "../../interface";
import { commissionModeLabel, isPaymentBasis } from "../../utils";
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
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Parcelas e comissão
          <HelpTooltip
            label="Como funciona a comissão deste pedido?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
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
        <Table.CardHead.Actions>
          <Badge.Root color="subtle" appearance="tinted">
            <Badge.Text>
              Faturado em {formatDateDMY(order.invoicedAt ?? undefined)}
            </Badge.Text>
          </Badge.Root>
          {/* Sem isto, um vencimento contado da compra parece erro de cálculo
              para quem confere olhando a data da nota. */}
          <Badge.Root color="subtle" appearance="tinted">
            <Badge.Text>
              Vencimentos contam{" "}
              {installmentDueBasisLabel(order.installmentDueBasis)}
            </Badge.Text>
          </Badge.Root>
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>#</Table.Head>
            <Table.Head>Vencimento</Table.Head>
            <Table.Head className="text-right">Valor</Table.Head>
            <Table.Head className="text-right">Comissão</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {order.installments.map((inst) => (
            <Table.Row key={inst.id}>
              <Table.Cell variant="strong">{inst.sequence}</Table.Cell>
              <Table.Cell>
                {formatDateDMY(inst.dueDate ?? undefined)}
              </Table.Cell>
              <Table.Cell className="text-right">
                {formatMoney(inst.amount)}
              </Table.Cell>
              <Table.Cell className="text-right">
                <Title variant="body-sm" color="amber" weight="bold">
                  {formatMoney(inst.commissionAmount)}
                </Title>
              </Table.Cell>
              <Table.Cell>
                <InstallmentStatusCell installment={inst} />
              </Table.Cell>
              <Table.Cell>
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
