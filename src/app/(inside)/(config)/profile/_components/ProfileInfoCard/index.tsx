"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { MyProfile } from "../../interface";
import { UPDATE_MY_PROFILE_MUTATION } from "./gql";
import { UpdateMyProfileResponse } from "./interface";
import { PROFILE_FORM_STEPS, normalizeProfile } from "./utils";

interface Props {
  profile: MyProfile;
  onRefetch: () => void;
}

export function ProfileInfoCard({ profile, onRefetch }: Props) {
  const formRef = useRef<FormBuilderRef>(null);

  const [updateProfile] = useMutation<UpdateMyProfileResponse>(
    UPDATE_MY_PROFILE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeProfile(data, profile);

    if (Object.keys(normalized).length === 0) return;

    await execute(
      async () => {
        const res = await updateProfile({ variables: { input: normalized } });

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
          onRefetch();
        },
      }
    );
  };

  return (
    <Card.Root className="h-auto shrink-0">
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Dados pessoais
        </Card.Header.Title>
      </Card.Header>
      <Card.Body>
        <FormBuilder
          ref={formRef}
          steps={PROFILE_FORM_STEPS}
          onSubmit={handleSubmit}
          loading={isLoading}
          initialData={{ name: profile.name, email: profile.email }}
          unstyled
        />
        <div className="mt-16 flex justify-end">
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar alterações</Button.Title>
          </Button.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
