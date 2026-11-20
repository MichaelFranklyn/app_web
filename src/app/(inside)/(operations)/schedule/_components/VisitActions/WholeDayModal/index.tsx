"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";

import { MARK_VISIT_WHOLE_DAY_MUTATION } from "../gql";

interface Props {
  itemId: string;
  clientName: string;
  /** A visita ainda está pendente? Muda o que a confirmação promete fazer. */
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

interface Response {
  markVisitWholeDay?: {
    status: boolean;
    message: string;
  };
}

/**
 * "Esta visita tomou o dia inteiro."
 *
 * O vendedor entrou no cliente de manhã e saiu no fim da tarde. As outras
 * paradas daquele dia não vão acontecer — e a alternativa que ele tem hoje é
 * remarcar uma a uma, ou deixá-las vencer e responder tudo no dia seguinte.
 *
 * A confirmação existe porque a ação alcança o dia inteiro, não só esta visita:
 * o texto diz o que vai acontecer com as outras paradas ANTES de confirmar.
 */
export function WholeDayModal({
  itemId,
  clientName,
  isPending,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const [markWholeDay] = useMutation<Response>(MARK_VISIT_WHOLE_DAY_MUTATION);

  const handleConfirm = async () => {
    const { data } = await markWholeDay({ variables: { itemId } });
    const payload = data?.markVisitWholeDay;
    if (!payload?.status) {
      throw new Error(payload?.message ?? "Não foi possível registrar o dia.");
    }
    onDone();
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Esta visita tomou o dia inteiro?"
      description={
        (isPending
          ? `A visita a ${clientName} é registrada como concluída e o dia fecha nela. `
          : `O dia fecha nesta visita a ${clientName}. `) +
        "As outras paradas ainda pendentes deste dia vão para o próximo dia com vaga — e o que não couber nesta semana sai do plano."
      }
      confirmLabel="Tomou o dia inteiro"
      confirmColor="amber"
      onConfirm={handleConfirm}
    />
  );
}
