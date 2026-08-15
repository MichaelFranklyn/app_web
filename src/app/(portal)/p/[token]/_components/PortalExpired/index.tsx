import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { Link2Off } from "lucide-react";

/**
 * O que quem abre um link morto vê.
 *
 * Uma mensagem só, para os quatro motivos possíveis (vencido, cancelado,
 * endereço errado, cliente desvinculado): quem está do outro lado não tem como
 * agir sobre a diferença entre eles, e a saída é sempre a mesma — falar com o
 * vendedor. Detalhar o motivo também entregaria, a quem estivesse tentando
 * adivinhar um endereço, a informação de que chegou perto.
 */
export function PortalExpired() {
  return (
    <div className="flex min-h-screen items-center justify-center px-[16px]">
      <EmptyState.Root className="max-w-[420px]">
        <EmptyState.Icon>
          <Link2Off size={36} />
        </EmptyState.Icon>
        <EmptyState.Title>
          <Title variant="heading-md">Este link não está mais válido</Title>
        </EmptyState.Title>
        <EmptyState.Description className="max-w-[320px]">
          Peça um link novo ao seu representante — ele consegue gerar outro na
          hora.
        </EmptyState.Description>
      </EmptyState.Root>
    </div>
  );
}
