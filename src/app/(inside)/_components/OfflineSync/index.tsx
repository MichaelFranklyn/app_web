"use client";

import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { recordsLabel, useOfflineQueue } from "@/services/offlineQueue";
import { CircleAlert, CloudUpload } from "lucide-react";

import { useOfflineSync } from "./useOfflineSync";

/**
 * O que foi registrado sem sinal e ainda não chegou ao servidor.
 *
 * A faixa azul existe para a pessoa não repetir o trabalho: sem ela, a visita
 * marcada na loja parece não ter "pegado" e é marcada de novo — ou, pior, a
 * pessoa sai da conta e o registro fica esperando alguém que não volta.
 *
 * A vermelha é o registro que chegou e foi RECUSADO (visita apagada, acesso
 * retirado). Ela fica até o "Entendi": um toast sumiria antes de a pessoa, que
 * nem estava olhando a tela quando o sinal voltou, ler.
 */
export function OfflineSync() {
  const { userId, entries, failures, dismissFailures } = useOfflineQueue();
  useOfflineSync(userId, entries.length);

  return (
    <>
      {entries.length > 0 && (
        <Banner
          tone="blue"
          icon={CloudUpload}
          role="status"
          data-testid="offline-queue-banner"
        >
          <Title variant="body-xs" color="inverse">
            <Emphasis>{recordsLabel(entries.length)}</Emphasis> guardado
            {entries.length === 1 ? "" : "s"} neste aparelho. Vão sozinhos
            quando o sinal voltar — não precisa marcar de novo, e não saia da
            sua conta até lá.
          </Title>
        </Banner>
      )}

      {failures.length > 0 && (
        <Banner
          tone="red"
          icon={CircleAlert}
          role="alert"
          data-testid="offline-failures-banner"
          action={
            <Button.Root
              appearance="solid"
              color="neutral"
              size="xs"
              onClick={dismissFailures}
            >
              <Button.Title>Entendi</Button.Title>
            </Button.Root>
          }
        >
          <Title variant="body-xs" color="inverse">
            Não foi possível gravar o que ficou guardado de{" "}
            <Emphasis>
              {[...new Set(failures.map((f) => f.label))].join(", ")}
            </Emphasis>{" "}
            (motivo: {failures[0].message.replace(/\.$/, "")}). Confira e
            registre de novo.
          </Title>
        </Banner>
      )}
    </>
  );
}
