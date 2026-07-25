"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import {
  PersonDataInput,
  PersonDataModal,
  UserDetail,
} from "../../../../../_shared/userProfile";
import { UPDATE_MY_PROFILE_MUTATION } from "./gql";
import { UpdateMyProfileResponse } from "./interface";

interface Props {
  profile: UserDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

/**
 * Editar os próprios dados. O formulário (e os dois passos) é o mesmo que o
 * gestor usa — aqui só entra a mutation do dono, `updateMyProfile`.
 */
export function EditMyProfileModal({
  profile,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const [updateProfile] = useMutation<UpdateMyProfileResponse>(
    UPDATE_MY_PROFILE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (input: PersonDataInput) => {
    await execute(
      async () => {
        const res = await updateProfile({ variables: { input } });

        if (
          !res.data?.updateMyProfile?.status ||
          !res.data.updateMyProfile.data
        ) {
          throw new Error(
            res.data?.updateMyProfile?.message ?? "Erro ao atualizar perfil"
          );
        }

        return res.data.updateMyProfile.data;
      },
      {
        successMessage: "Perfil atualizado com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <PersonDataModal
      profile={profile}
      open={open}
      onOpenChange={onOpenChange}
      isSelf
      description="Seu nome, seu contato e o endereço onde você mora."
      isLoading={isLoading}
      onSubmit={handleSubmit}
    />
  );
}
