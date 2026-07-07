"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { BadgeCheck, RotateCcw, XCircle } from "lucide-react";
import {
  CANCEL_ORDER_INSTALLMENT_MUTATION,
  REVERT_ORDER_INSTALLMENT_MUTATION,
} from "../../gql";
import { OrderDetail } from "../../interface";
import {
  commissionModeLabel,
  INSTALLMENT_STATUS_LABEL,
  INSTALLMENT_STATUS_TONE,
  isPaymentBasis,
} from "../../utils";
import { PayInstallmentModal } from "./PayInstallmentModal";

interface StatusResponse {
  status: boolean;
  message: string;
  data: { id: string } | null;
}

interface Props {
  order: OrderDetail;
  onChanged: () => void;
}

export function InstallmentsCard({ order, onChanged }: Props) {
  const [cancelInstallment] = useMutation<{
    cancelOrderInstallment: StatusResponse;
  }>(CANCEL_ORDER_INSTALLMENT_MUTATION);
  const [revertInstallment] = useMutation<{
    revertOrderInstallment: StatusResponse;
  }>(REVERT_ORDER_INSTALLMENT_MUTATION);

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
                <div className="flex items-center gap-4">
                  <Badge.Root
                    color={INSTALLMENT_STATUS_TONE[inst.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      {INSTALLMENT_STATUS_LABEL[inst.status]}
                    </Badge.Text>
                  </Badge.Root>
                  {inst.isCommissionReceived && (
                    <Badge.Root color="green" appearance="tinted">
                      <Badge.Icon>
                        <BadgeCheck />
                      </Badge.Icon>
                      <Badge.Text>Comissão recebida</Badge.Text>
                    </Badge.Root>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center justify-end gap-4">
                  {inst.isCommissionReceived ? (
                    <Table.CellText variant="dim">—</Table.CellText>
                  ) : inst.status === "PENDING" ? (
                    <>
                      <PayInstallmentModal
                        installmentId={inst.id}
                        sequence={inst.sequence}
                        onSuccess={onChanged}
                      />
                      <ConfirmModal
                        trigger={
                          <Button.Root appearance="ghost" color="red" size="sm">
                            <Button.Icon icon={XCircle} />
                            <Button.Title>Não pago</Button.Title>
                          </Button.Root>
                        }
                        title={`Cancelar parcela ${inst.sequence}`}
                        description="Marque como não paga quando o cliente não quitar este boleto. No modo Pagamento, esta parcela não gera comissão."
                        confirmLabel="Marcar não pago"
                        successMessage="Parcela cancelada"
                        onConfirm={async () => {
                          const res = await cancelInstallment({
                            variables: { id: inst.id },
                          });
                          if (!res.data?.cancelOrderInstallment?.status) {
                            throw new Error(
                              res.data?.cancelOrderInstallment?.message ??
                                "Erro ao cancelar parcela"
                            );
                          }
                        }}
                        onSuccess={onChanged}
                      />
                    </>
                  ) : (
                    <ConfirmModal
                      trigger={
                        <Button.Root
                          appearance="ghost"
                          color="neutral"
                          size="sm"
                        >
                          <Button.Icon icon={RotateCcw} />
                          <Button.Title>Reverter</Button.Title>
                        </Button.Root>
                      }
                      title={`Reverter parcela ${inst.sequence}`}
                      description="Volta a parcela para pendente, desfazendo o pagamento ou cancelamento."
                      confirmLabel="Reverter"
                      successMessage="Parcela voltou para pendente"
                      onConfirm={async () => {
                        const res = await revertInstallment({
                          variables: { id: inst.id },
                        });
                        if (!res.data?.revertOrderInstallment?.status) {
                          throw new Error(
                            res.data?.revertOrderInstallment?.message ??
                              "Erro ao reverter parcela"
                          );
                        }
                      }}
                      onSuccess={onChanged}
                    />
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
