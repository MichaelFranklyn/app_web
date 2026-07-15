"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { TriangleAlert } from "lucide-react";

/**
 * Error boundary das páginas internas. Sem ele, qualquer erro de SSR (ex.:
 * query GraphQL negada/indisponível) vira a tela "Application error" crua do
 * Next — aqui o usuário mantém a sidebar e ganha saídas claras.
 */
export default function InsideError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          Houve um problema inesperado ao abrir esta tela. Tente novamente ou
          volte para o início.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button.Root
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            onClick={reset}
          >
            <Button.Title>Tentar novamente</Button.Title>
          </Button.Root>
          <Button.Root
            appearance="outline"
            color="neutral"
            size="md"
            noUppercase
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            <Button.Title>Ir para o início</Button.Title>
          </Button.Root>
        </EmptyState.Actions>
      </EmptyState.Root>
    </PageContent>
  );
}
