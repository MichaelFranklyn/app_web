"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAsyncQuery } from "@/hooks/useAsyncQuery";

import {
  COMPANY_SETUP_PROGRESS_QUERY,
  COMPLETE_COMPANY_SETUP_MUTATION,
} from "./gql";
import {
  CompanySetupProgressResponse,
  CompleteCompanySetupResponse,
} from "./interface";

/**
 * O progresso da configuração inicial e a ação de concluir.
 *
 * Sem cache: cada passo é feito em OUTRA tela (fábricas, clientes, histórico),
 * e nenhuma delas invalida o progresso — voltar para cá tem de mostrar o
 * estado de agora.
 */
export function useCompanySetup() {
  const router = useRouter();
  const { data, loading, error, refetch } =
    useAsyncQuery<CompanySetupProgressResponse>(COMPANY_SETUP_PROGRESS_QUERY, {
      cache: false,
      skip: false,
    });
  const [completeSetup] = useMutation<CompleteCompanySetupResponse>(
    COMPLETE_COMPANY_SETUP_MUTATION
  );
  const { execute, isLoading: isCompleting } = useAsyncAction();

  const complete = () =>
    execute(
      async () => {
        const res = await completeSetup();
        const payload = res.data?.completeCompanySetup;
        if (!payload?.status || !payload.data) {
          throw new Error(
            payload?.message ?? "Erro ao concluir a configuração"
          );
        }
        return payload.message;
      },
      {
        successMessage: (message) => message,
        onSuccess: () => {
          void refetch();
          // O item fixo do menu vem do layout (servidor): sem o refresh ele
          // ficaria lá até a próxima carga cheia.
          router.refresh();
        },
      }
    );

  return {
    progress: data?.companySetupProgress?.data ?? null,
    loading,
    error,
    refetch,
    complete,
    isCompleting,
  };
}
