"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import {
  PersonDataInput,
  PersonDataModal,
  UserDetail,
} from "../../../../../_shared/userProfile";
import { UPDATE_PERSON_DATA_MUTATION } from "./gql";
import { UpdatePersonDataResponse } from "./interface";

interface Props {
  user: UserDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

/**
 * O gestor completando os dados de outra pessoa. Mesmo formulário que ela usaria
 * em "Meu perfil" — a diferença é a mutation: `updateUser` em vez de
 * `updateMyProfile`.
 */
export function EditPersonDataModal({
  user,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const [updatePerson] = useMutation<UpdatePersonDataResponse>(
    UPDATE_PERSON_DATA_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (input: PersonDataInput) => {
    await execute(
      async () => {
        const res = await updatePerson({
          variables: { id: user.id, input },
        });

        if (!res.data?.updateUser?.status || !res.data.updateUser.data) {
          throw new Error(
            res.data?.updateUser?.message ?? "Erro ao atualizar os dados"
          );
        }

        return res.data.updateUser.data;
      },
      {
        successMessage: "Dados atualizados com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <PersonDataModal
      profile={user}
      open={open}
      onOpenChange={onOpenChange}
      description="Contato e endereço desta pessoa. Para quem vende, o endereço é o ponto de partida da rota do dia."
      isLoading={isLoading}
      onSubmit={handleSubmit}
    />
  );
}
