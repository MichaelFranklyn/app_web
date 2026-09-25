"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import {
  REACTIVATE_COMPANY_CLIENT_MUTATION,
  REFRESH_CLIENT_FROM_RECEITA_MUTATION,
} from "../gql";
import {
  ReactivateCompanyClientResponse,
  RefreshClientFromReceitaResponse,
} from "../interface";
import { describeReceitaChanges } from "../utils";

/**
 * As duas ações de um clique: reativar e conferir na Receita. Nenhuma pede
 * confirmação — reativar só devolve o que encerrar tirou, e a Receita é a
 * fonte oficial do nome.
 */
export function useHygieneMutations(
  companyClientId: string,
  onDone: () => void
) {
  const reactivateAction = useAsyncAction();
  const receitaAction = useAsyncAction();
  const [reactivate] = useMutation<ReactivateCompanyClientResponse>(
    REACTIVATE_COMPANY_CLIENT_MUTATION
  );
  const [refresh] = useMutation<RefreshClientFromReceitaResponse>(
    REFRESH_CLIENT_FROM_RECEITA_MUTATION
  );

  const runReactivate = () =>
    reactivateAction.execute(
      async () => {
        const res = await reactivate({ variables: { id: companyClientId } });
        const payload = res.data?.reactivateCompanyClient;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao reativar o cliente");
        }
        return payload;
      },
      { successMessage: (payload) => payload.message, onSuccess: onDone }
    );

  const runReceita = () =>
    receitaAction.execute(
      async () => {
        const res = await refresh({ variables: { companyClientId } });
        const payload = res.data?.refreshClientFromReceita;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao consultar a Receita");
        }
        return payload.data;
      },
      {
        successMessage: (data) => describeReceitaChanges(data.changes),
        onSuccess: onDone,
      }
    );

  return {
    runReactivate,
    runReceita,
    isBusy: reactivateAction.isLoading || receitaAction.isLoading,
  };
}
