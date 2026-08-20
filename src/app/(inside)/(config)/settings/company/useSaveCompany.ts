import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { UPDATE_COMPANY_MUTATION } from "./gql";
import { UpdateCompanyInput, UpdateCompanyResponse } from "./interface";

/**
 * Salvar da tela de empresa. Todos os assuntos gravam pela mesma `updateCompany`
 * com input parcial, então o unwrap mora aqui em vez de repetido em cada modal.
 *
 * "Nada mudou" é decidido por quem chama: no modal de dados o certo é fechar
 * (fechar já é o retorno visível), e no de imagens é avisar que nenhuma foi
 * escolhida. Um aviso genérico aqui atrapalharia os dois.
 */
export function useSaveCompany(companyId: string, onSaved: () => void) {
  const { execute, isLoading } = useAsyncAction();
  const [updateCompany] = useMutation<UpdateCompanyResponse>(
    UPDATE_COMPANY_MUTATION
  );

  const save = async (
    input: UpdateCompanyInput,
    afterSave?: () => void
  ): Promise<void> => {
    await execute(
      async () => {
        const res = await updateCompany({
          variables: { id: companyId, input },
        });
        if (!res.data?.updateCompany?.status || !res.data.updateCompany.data) {
          throw new Error(
            res.data?.updateCompany?.message ?? "Erro ao salvar os dados"
          );
        }
        return res.data.updateCompany.data;
      },
      {
        successMessage: "Dados da empresa atualizados",
        onSuccess: () => {
          afterSave?.();
          onSaved();
          // Sem evict de `myCompany`: o `data` tem `id`, então o Apollo o
          // normaliza em `Company:<id>` e o refetch do `onSaved` já atualiza a
          // logo/apelido lidos por `useCompanyBranding` na barra superior.
        },
      }
    );
  };

  return { save, isSaving: isLoading };
}
