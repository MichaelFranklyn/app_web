"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DELETE_SUPPORT_CASE_MUTATION } from "@/graphql/support";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { DeleteSupportCaseResponse } from "../../interface";

interface Props {
  caseId: string;
  caseTitle: string;
}

/**
 * Excluir o caso — com confirmação em modal, como toda deleção do sistema.
 *
 * Volta para a fila depois: a tela que o usuário estava vendo deixou de existir,
 * e o `redirectTo` mantém o botão em carregamento até a rota trocar.
 */
export function DeleteCaseModal({ caseId, caseTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteCase] = useMutation<DeleteSupportCaseResponse>(
    DELETE_SUPPORT_CASE_MUTATION
  );

  return (
    <>
      <Button.Root
        type="button"
        appearance="outline"
        color="red"
        size="sm"
        noUppercase
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={Trash2} />
        <Button.Title>Excluir</Button.Title>
      </Button.Root>

      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="Excluir atendimento"
        description={`"${caseTitle}" e todo o histórico de andamentos saem do sistema. Se o caso não se resolveu, prefira encerrá-lo com um andamento — o histórico continua servindo.`}
        confirmLabel="Excluir"
        successMessage="Atendimento removido"
        redirectTo="/support"
        onConfirm={async () => {
          const res = await deleteCase({ variables: { id: caseId } });
          const payload = res.data?.deleteClientSupportCase;
          if (!payload?.status) {
            throw new Error(payload?.message ?? "Erro ao excluir");
          }
        }}
      />
    </>
  );
}
