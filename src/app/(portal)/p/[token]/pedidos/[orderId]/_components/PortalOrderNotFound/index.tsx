import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { FileQuestion } from "lucide-react";

interface PortalOrderNotFoundProps {
  token: string;
}

export function PortalOrderNotFound({ token }: PortalOrderNotFoundProps) {
  return (
    <EmptyState.Root>
      <EmptyState.Icon>
        <FileQuestion size={36} />
      </EmptyState.Icon>
      <EmptyState.Title>Pedido não encontrado</EmptyState.Title>
      <EmptyState.Description>
        Ele pode ter sido removido, ou o endereço está incompleto.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button.Link
          href={`/p/${token}`}
          appearance="outline"
          color="neutral"
          noUppercase
        >
          <Button.Title>Voltar para as minhas compras</Button.Title>
        </Button.Link>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}
