"use client";

import { Alert } from "@/components/Alert";
import { Loading } from "@/components/Loading";
import { useEffect, useState } from "react";

import { ReadingPhase } from "./interface";

/** A partir daqui a espera já parece travada: a tela diz que é normal. */
export const SLOW_READING_SECONDS = 10;

const PHASE_TITLE: Record<ReadingPhase, string> = {
  upload: "Enviando o arquivo…",
  read: "Lendo o pedido…",
};

/**
 * O que dizer enquanto o PDF é lido. Por fase, não em porcentagem: o servidor
 * não sabe quanto falta, e uma barra inventada mentiria.
 */
export function readingMessage(phase: ReadingPhase, seconds: number) {
  const title = PHASE_TITLE[phase];
  if (seconds < SLOW_READING_SECONDS) return { title, description: null };
  return {
    title: `${title} ${seconds} segundos`,
    description:
      "Pedidos com muitas páginas podem levar até 20 segundos. Pode aguardar nesta tela.",
  };
}

interface Props {
  phase: ReadingPhase;
}

/** Montado só durante a leitura: o relógio começa do zero a cada arquivo. */
export function ReadingProgress({ phase }: Props) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  const { title, description } = readingMessage(phase, seconds);

  return (
    <Alert.Root variant="info" role="status" aria-live="polite">
      {/* Mesma caixa do Alert.Icon, para o texto alinhar igual. */}
      <div className="grid size-[28px] shrink-0 place-items-center">
        <Loading.Spinner size="sm" colorClass="blue" />
      </div>
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {description && <Alert.Description>{description}</Alert.Description>}
      </Alert.Content>
    </Alert.Root>
  );
}
