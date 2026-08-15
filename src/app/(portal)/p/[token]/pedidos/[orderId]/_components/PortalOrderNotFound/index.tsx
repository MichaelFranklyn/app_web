import { EmptyState } from "@/components/EmptyState";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

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
        <Link
          href={`/p/${token}`}
          className="rounded-[8px] border border-(--border) px-[16px] py-[10px] text-[14px] text-(--text2) hover:bg-(--bg3)"
        >
          Voltar para as minhas compras
        </Link>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}
