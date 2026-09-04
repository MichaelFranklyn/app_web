"use client";

import { ADD_SUPPORT_UPDATE_MUTATION } from "@/graphql/support";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { SupportStatus, SupportUpdateKind } from "@/utils/support";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { AddSupportUpdateResponse } from "../../interface";
import { isClosingStatus } from "../../utils";

interface Params {
  caseId: string;
  onSaved: () => void;
}

/**
 * O andamento e a mudança de situação são UM ato: "falei com a fábrica, eles vão
 * trocar" é ao mesmo tempo o que aconteceu e a razão de o caso passar a
 * "aguardando fábrica". Por isso um formulário só, e uma chamada só.
 */
export function useAddUpdate({ caseId, onSaved }: Params) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<SupportUpdateKind>("NOTE");
  const [status, setStatus] = useState<SupportStatus | "">("");
  const [resolution, setResolution] = useState("");

  const [addUpdate] = useMutation<AddSupportUpdateResponse>(
    ADD_SUPPORT_UPDATE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const isClosing = isClosingStatus(status);
  const isValid = body.trim().length > 0;

  const submit = () =>
    execute(
      async () => {
        const res = await addUpdate({
          variables: {
            input: {
              caseId,
              body: body.trim(),
              kind,
              status: status || null,
              // A solução por escrito só faz sentido ao encerrar; mandá-la
              // sempre sobrescreveria a que já estava lá com um texto vazio.
              resolution: isClosing ? resolution.trim() || null : null,
            },
          },
        });
        const payload = res.data?.addClientSupportUpdate;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao registrar o andamento");
        }
        return payload;
      },
      {
        successMessage: "Andamento registrado",
        onSuccess: () => {
          setBody("");
          setStatus("");
          setResolution("");
          setKind("NOTE");
          onSaved();
        },
      }
    );

  return {
    body,
    setBody,
    kind,
    setKind,
    status,
    setStatus,
    resolution,
    setResolution,
    isClosing,
    isValid,
    isLoading,
    submit,
  };
}
