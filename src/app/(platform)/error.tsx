"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { useReportRouteError } from "@/hooks/useReportRouteError";
import { TriangleAlert } from "lucide-react";

/**
 * Error boundary do console da plataforma. Fica DENTRO da casca (o layout do
 * grupo envolve este arquivo), então segue o `(inside)/error.tsx`: card na área
 * de conteúdo, com o menu do console ainda à mão.
 */
export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useReportRouteError(error);
  return (
    <PageContent>
      <EmptyState.Root>
        <EmptyState.Icon>
          <TriangleAlert size={32} />
        </EmptyState.Icon>
        <EmptyState.Title>
          Não foi possível carregar esta página
        </EmptyState.Title>
        <EmptyState.Description>
          Houve um problema inesperado ao abrir esta tela do console. Tente
          novamente ou volte para a visão geral.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button.Root
            appearance="solid"
            color="amber"
            size="md"
            onClick={reset}
          >
            <Button.Title>Tentar novamente</Button.Title>
          </Button.Root>
          <Button.Link
            href="/platform"
            appearance="outline"
            color="neutral"
            size="md"
          >
            <Button.Title>Ir para a visão geral</Button.Title>
          </Button.Link>
        </EmptyState.Actions>
      </EmptyState.Root>
    </PageContent>
  );
}
