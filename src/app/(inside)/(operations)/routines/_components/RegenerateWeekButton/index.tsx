"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { GENERATE_WEEKLY_SCHEDULE_MUTATION } from "../../gql";

interface GenerateWeeklyScheduleResponse {
  generateWeeklySchedule?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

interface Props {
  weekStart: string;
  sellerId?: string | null;
  /** Rotina já confirmada não pode ser refeita — o backend recusa. */
  isConfirmed: boolean;
  onRegenerated: () => void;
}

/**
 * Refaz a rotina da semana que JÁ existe.
 *
 * A mesma mutation do botão de gerar (`generateWeeklySchedule`) substitui o
 * rascunho da semana: apaga os dias e visitas planejados e monta tudo de novo
 * com os scores e o estoque de hoje. Por isso passa por confirmação — o vendedor
 * pode ter mexido na rotina à mão, e essas mudanças se perdem.
 *
 * Duas coisas que o usuário precisa saber e a descrição diz:
 * - visitas já concluídas ficam em dias que não são recriados, então o que já
 *   foi feito não volta para a fila;
 * - dias que já passaram não são regerados (a semana recomeça em hoje).
 */
export function RegenerateWeekButton({
  weekStart,
  sellerId,
  isConfirmed,
  onRegenerated,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [generateWeeklySchedule] = useMutation<GenerateWeeklyScheduleResponse>(
    GENERATE_WEEKLY_SCHEDULE_MUTATION
  );

  const handleConfirm = async () => {
    const res = await generateWeeklySchedule({
      variables: { input: { weekStart, sellerId } },
    });
    const payload = res.data?.generateWeeklySchedule;
    if (!payload?.status) {
      throw new Error(payload?.message ?? "Erro ao refazer a rotina da semana");
    }
  };

  return (
    <>
      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        noUppercase
        disabled={isConfirmed}
        title={
          isConfirmed
            ? "Rotina confirmada não pode ser refeita — edite as visitas ou volte a rotina para rascunho."
            : "Monta a rotina desta semana de novo, com os scores de hoje"
        }
        onClick={() => setIsOpen(true)}
      >
        <Button.Icon icon={RefreshCw} />
        <Button.Title>Refazer rotina</Button.Title>
      </Button.Root>

      <ConfirmModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Refazer a rotina desta semana?"
        description="As visitas planejadas que ainda não aconteceram serão substituídas por uma rotina nova, montada com os scores e o estoque de hoje. Ajustes manuais nos dias que ainda vêm serão perdidos; dias que já passaram não são refeitos."
        confirmLabel="Refazer rotina"
        confirmColor="amber"
        onConfirm={handleConfirm}
        successMessage="Rotina da semana refeita"
        onSuccess={onRegenerated}
      />
    </>
  );
}
