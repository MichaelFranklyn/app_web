import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { Link2Off } from "lucide-react";

interface LinkExpiredProps {
  /** A saída para quem abriu: a quem pedir um link novo. */
  children: React.ReactNode;
}

/**
 * O que quem abre um link morto vê (portal do cliente, folha de resposta).
 *
 * Uma mensagem só para todos os motivos (vencido, substituído, endereço errado,
 * vínculo desfeito): quem está do outro lado não tem como agir sobre a
 * diferença, e a saída é sempre pedir outro. Detalhar o motivo também
 * entregaria, a quem estivesse tentando adivinhar um endereço, a informação de
 * que chegou perto.
 */
export function LinkExpired({ children }: LinkExpiredProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-[16px]">
      <EmptyState.Root className="max-w-[420px]">
        <EmptyState.Icon>
          <Link2Off size={36} />
        </EmptyState.Icon>
        {/* `as="span"`: `EmptyState.Title` JÁ é o <h3>. */}
        <EmptyState.Title>
          <Title variant="heading-md" as="span">
            Este link não está mais válido
          </Title>
        </EmptyState.Title>
        <EmptyState.Description className="max-w-[320px]">
          {children}
        </EmptyState.Description>
      </EmptyState.Root>
    </div>
  );
}
