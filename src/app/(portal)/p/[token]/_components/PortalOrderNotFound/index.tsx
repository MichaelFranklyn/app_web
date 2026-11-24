import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { FileQuestion } from "lucide-react";

interface PortalOrderNotFoundProps {
  token: string;
  /** Para onde o botão volta — por padrão, a lista de pedidos. */
  backHref?: string;
  backLabel?: string;
}

export function PortalOrderNotFound({
  token,
  backHref,
  backLabel = "Voltar para os pedidos",
}: PortalOrderNotFoundProps) {
  return (
    <EmptyState.Root>
      <EmptyState.Icon>
        <FileQuestion />
      </EmptyState.Icon>
      <EmptyState.Title>Pedido não encontrado</EmptyState.Title>
      <EmptyState.Description>
        Ele pode ter sido removido, ou o endereço está incompleto.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button.Link
          href={backHref ?? `/p/${token}/enviados`}
          appearance="outline"
          color="neutral"
        >
          <Button.Title>{backLabel}</Button.Title>
        </Button.Link>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}
