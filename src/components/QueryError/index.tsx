"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { TriangleAlert } from "lucide-react";

interface QueryErrorProps {
  /** Refaz a busca (normalmente o `refetch` do useQuery/useTableData). */
  onRetry?: () => void;
  /** Enquanto a nova tentativa está em andamento (mostra spinner no botão). */
  retrying?: boolean;
  title?: string;
  description?: string;
  retryLabel?: string;
  /**
   * Sem Card (borda/fundo), para usar DENTRO de um Card.Body já existente e
   * evitar card-dentro-de-card. Ex.: cards da visão geral do cliente.
   */
  flat?: boolean;
}

/**
 * Estado de erro padrão para falhas de query GraphQL. Substitui o antigo
 * comportamento de "skeleton eterno / lista vazia / não encontrado" quando a
 * query falha, deixando claro que houve erro e oferecendo tentar de novo.
 */
export function QueryError({
  onRetry,
  retrying = false,
  title = "Não foi possível carregar",
  description = "Houve um problema ao buscar estas informações. Verifique sua conexão e tente novamente.",
  retryLabel = "Tentar novamente",
  flat = false,
}: QueryErrorProps) {
  return (
    <EmptyState.Root flat={flat}>
      <EmptyState.Icon>
        <TriangleAlert size={32} />
      </EmptyState.Icon>
      <EmptyState.Title>{title}</EmptyState.Title>
      <EmptyState.Description>{description}</EmptyState.Description>
      {onRetry && (
        <EmptyState.Actions>
          <Button.Root
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={retrying}
            onClick={onRetry}
          >
            <Button.Title>{retryLabel}</Button.Title>
          </Button.Root>
        </EmptyState.Actions>
      )}
    </EmptyState.Root>
  );
}
