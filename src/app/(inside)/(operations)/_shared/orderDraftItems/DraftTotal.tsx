"use client";

import { AlertTriangle } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";

import { PaymentTermMinimum } from "./interface";

interface Props {
  /** Mercadoria acumulada no rascunho, sem IPI — a base que o piso cobra. */
  total: number;
  minimum?: PaymentTermMinimum | null;
}

/**
 * Total do rascunho e, quando a condição de pagamento tem piso, quanto falta
 * para alcançá-lo.
 *
 * O aviso aparece aqui, enquanto o vendedor ainda está montando o pedido, e não
 * como recusa no fim: o rascunho abaixo do piso é salvo normalmente, e só a
 * confirmação — já com pedido e itens gravados — é que barra.
 */
export function DraftTotal({ total, minimum }: Props) {
  const missing = minimum ? minimum.amount - total : 0;
  const isBelow = missing > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-16">
        <Title variant="label" weight="bold" className="tracking-normal">
          Total do pedido
        </Title>
        <Title variant="value" weight="bold">
          {formatMoney(total)}
        </Title>
      </div>

      {minimum && !isBelow && (
        <Title variant="caption" color="muted">
          A condição {minimum.termName} pede no mínimo{" "}
          {formatMoney(minimum.amount)} — este pedido já alcança.
        </Title>
      )}

      {isBelow && minimum && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={AlertTriangle} />
          <Alert.Content>
            <Alert.Title>
              Faltam {formatMoney(missing)} para a condição {minimum.termName}
            </Alert.Title>
            <Alert.Description>
              A fábrica pede no mínimo {formatMoney(minimum.amount)} neste
              prazo. Você pode continuar e salvar o pedido do jeito que está —
              ele fica como rascunho —, mas para confirmá-lo é preciso incluir
              mais itens ou escolher outra condição de pagamento.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
