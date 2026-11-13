"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { UPDATE_MY_PROFILE_MUTATION } from "../../gql";
import { UpdateMyProfileResponse } from "../../interface";

interface Props {
  isEnabled: boolean;
  onDone: () => void;
}

/**
 * Liga/desliga os emails automáticos do Itinus (resumo da semana, pendências,
 * aniversários e datas comemorativas). O mesmo desligamento vale para o link
 * "não quero mais receber" no rodapé de cada um desses emails.
 *
 * Os avisos de ACESSO (convite, troca de senha, conta bloqueada) não passam por
 * aqui: são a única forma de a pessoa recuperar a própria conta.
 */
export function EmailDigestCard({ isEnabled, onDone }: Props) {
  const [updateProfile] = useMutation<UpdateMyProfileResponse>(
    UPDATE_MY_PROFILE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleChange = async (next: boolean) => {
    await execute(
      async () => {
        const res = await updateProfile({
          variables: { input: { isEmailDigestEnabled: next } },
        });
        if (!res.data?.updateMyProfile?.status) {
          throw new Error(
            res.data?.updateMyProfile?.message ?? "Erro ao salvar a preferência"
          );
        }
        return res.data.updateMyProfile;
      },
      {
        successMessage: next
          ? "Você voltará a receber os emails do Itinus"
          : "Pronto. Você não vai mais receber estes emails",
        onSuccess: onDone,
      }
    );
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Emails do Itinus</Card.Header.Title>
        <Card.Header.Description>
          Resumos e lembretes que chegam no seu email.
        </Card.Header.Description>
        <Card.Header.Actions>
          <HelpTooltip
            label="Quais emails são esses"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  O que esta opção liga e desliga
                </Title>
                <Title variant="body-sm">
                  Para proprietários e administradores: o resultado da semana e
                  as pendências, toda segunda de manhã. Para todos: parabéns no
                  aniversário e nas datas comemorativas.
                </Title>
                <Title variant="body-sm" color="muted">
                  Os emails de acesso (convite, troca de senha e conta
                  bloqueada) continuam chegando sempre — eles servem para você
                  entrar na sua conta.
                </Title>
              </div>
            }
          />
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body className="flex flex-col items-start gap-12">
        <Input.Toggle
          label={isEnabled ? "Recebendo os emails" : "Emails desligados"}
          checked={isEnabled}
          disabled={isLoading}
          onChange={(e) => handleChange(e.target.checked)}
        />
        <Title variant="body-sm" color="muted">
          Os emails de acesso à conta chegam mesmo com esta opção desligada.
        </Title>
      </Card.Body>
    </Card.Root>
  );
}
