"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { CopyPlus } from "lucide-react";

import { COPY_SELLER_GOALS_MUTATION } from "../../gql";
import {
  addMonths,
  monthLabel,
  monthStartIso,
  type YearMonth,
} from "@/utils/format/month";

interface Props {
  /** Mês aberto na tela — o DESTINO da cópia. */
  month: YearMonth;
  sellerId: string | null;
  onCopied: () => void;
}

interface CopyResponse {
  copySellerGoals: { status: boolean; message: string };
}

/**
 * Repete no mês aberto as metas do mês anterior. Meta de representação muda
 * pouco de um mês para o outro; sem isto, todo dia 1º o gestor redigita a grade
 * inteira — e é aí que ele para de usar metas.
 *
 * Não sobrescreve o que já foi definido no destino: quem já ajustou um número
 * neste mês decidiu alguma coisa, e a cópia não desfaz decisão.
 */
export function CopyGoalsModal({ month, sellerId, onCopied }: Props) {
  const [copyGoals] = useMutation<CopyResponse>(COPY_SELLER_GOALS_MUTATION);
  const previous = addMonths(month, -1);

  const handleConfirm = async () => {
    const res = await copyGoals({
      variables: {
        fromMonth: monthStartIso(previous),
        toMonth: monthStartIso(month),
        sellerId,
        overwrite: false,
      },
    });
    if (!res.data?.copySellerGoals?.status) {
      throw new Error(
        res.data?.copySellerGoals?.message ?? "Erro ao copiar as metas"
      );
    }
    onCopied();
  };

  return (
    <ConfirmModal
      title={`Repetir as metas de ${monthLabel(previous)}?`}
      description={`As metas de ${monthLabel(previous)} passam a valer também em ${monthLabel(month)}. O que já tem meta definida neste mês fica como está.`}
      confirmLabel="Repetir metas"
      confirmColor="amber"
      onConfirm={handleConfirm}
      trigger={
        <Button.Root appearance="outline" color="neutral" size="sm" noUppercase>
          <Button.Icon icon={CopyPlus} />
          <Button.Title>Repetir mês anterior</Button.Title>
        </Button.Root>
      }
    />
  );
}
