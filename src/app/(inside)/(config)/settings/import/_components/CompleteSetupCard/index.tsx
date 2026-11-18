"use client";

import { CheckCircle2, Info } from "lucide-react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";

import { CompanySetupProgress } from "../../interface";

interface Props {
  progress: CompanySetupProgress;
  onComplete: () => void;
  isCompleting: boolean;
}

/**
 * Fecha a configuração: libera os emails de acesso que a importação segurou e
 * tira o item fixo do menu. Só habilita quando os passos obrigatórios estão
 * feitos — o backend confere de novo.
 */
export function CompleteSetupCard({
  progress,
  onComplete,
  isCompleting,
}: Props) {
  const pendingEmails = progress.pendingAccessEmailsCount;

  return (
    <Card.Root>
      <Card.Body className="flex flex-col gap-16">
        <div className="flex flex-col gap-3">
          <Title variant="heading-sm">Concluir configuração</Title>
          <Title variant="body-sm" color="muted">
            {progress.canComplete
              ? "Os passos obrigatórios estão feitos. Clientes e histórico podem vir agora ou depois."
              : "Faça os passos marcados como pendentes para concluir. Clientes e histórico são opcionais."}
          </Title>
        </div>

        {pendingEmails > 0 && (
          <Alert.Root variant="info">
            <Alert.Icon icon={Info} />
            <Alert.Content>
              <Alert.Description>
                {pendingEmails === 1
                  ? "1 pessoa vai receber o email de acesso quando você concluir."
                  : `${pendingEmails} pessoas vão receber o email de acesso quando você concluir.`}
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <div>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            loading={isCompleting}
            disabled={!progress.canComplete}
            onClick={onComplete}
          >
            <Button.Icon icon={CheckCircle2} />
            <Button.Title>Concluir configuração</Button.Title>
          </Button.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
