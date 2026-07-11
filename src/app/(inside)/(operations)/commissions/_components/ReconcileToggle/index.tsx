"use client";

import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { CircleCheckBig, CircleDashed } from "lucide-react";
import { useEffect, useState } from "react";
import { SET_COMMISSION_RECONCILED_MUTATION } from "../../gql";

interface SetResponse {
  setCommissionReconciled: { status: boolean; message: string };
}

interface Props {
  installmentId: string;
  reconciled: boolean;
  onChanged: () => void;
  /**
   * Trava a conferência: recebido implica conferido, então uma parcela já
   * recebida não pode ser desconferida. Mostra "Conferido" fixo, sem clique.
   */
  locked?: boolean;
}

/**
 * "Conferido/bateu": alterna se a parcela já foi conferida contra a planilha
 * que a fábrica envia. Flip otimista para resposta imediata; em erro reverte e
 * o toast do useAsyncAction avisa. Depois pede refetch para o cabeçalho da
 * fábrica atualizar o contador de conferidas.
 */
export function ReconcileToggle({
  installmentId,
  reconciled,
  onChanged,
  locked = false,
}: Props) {
  const [local, setLocal] = useState(reconciled);
  useEffect(() => setLocal(reconciled), [reconciled]);

  const [setReconciled] = useMutation<SetResponse>(
    SET_COMMISSION_RECONCILED_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Recebido implica conferido: parcela recebida mostra "Conferido" fixo, sem
  // clique. O branch vem DEPOIS dos hooks (a linha pode virar "recebido" após um
  // refetch no mesmo componente — hooks precisam rodar sempre, na mesma ordem).
  if (locked) {
    return (
      <Button.Root
        appearance="tinted"
        color="green"
        size="sm"
        noUppercase
        disabled
        title="Recebido já conta como conferido"
      >
        <Button.Icon icon={CircleCheckBig} />
        <Button.Title>Conferido</Button.Title>
      </Button.Root>
    );
  }

  const handleClick = async () => {
    const next = !local;
    setLocal(next); // otimista
    await execute(
      async () => {
        const res = await setReconciled({
          variables: { installmentIds: [installmentId], reconciled: next },
        });
        if (!res.data?.setCommissionReconciled?.status) {
          throw new Error(
            res.data?.setCommissionReconciled?.message ??
              "Erro ao marcar conferência"
          );
        }
        return res.data.setCommissionReconciled;
      },
      {
        successMessage: next ? "Parcela conferida" : "Conferência desmarcada",
        onSuccess: onChanged,
        onError: () => setLocal(!next), // reverte
      }
    );
  };

  return (
    <Button.Root
      appearance={local ? "tinted" : "ghost"}
      color={local ? "green" : "neutral"}
      size="sm"
      noUppercase
      loading={isLoading}
      onClick={handleClick}
    >
      <Button.Icon icon={local ? CircleCheckBig : CircleDashed} />
      <Button.Title>{local ? "Conferido" : "Conferir"}</Button.Title>
    </Button.Root>
  );
}
