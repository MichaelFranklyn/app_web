import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { Link2Off } from "lucide-react";

/**
 * O que quem abre um link morto vê.
 *
 * Uma mensagem só, para os motivos possíveis (vencido, substituído por uma
 * reimpressão da folha, endereço errado, rotina refeita): quem está do outro
 * lado não tem como agir sobre a diferença entre eles, e a saída é sempre a
 * mesma — pedir outro ao escritório. Detalhar o motivo também entregaria, a
 * quem estivesse tentando adivinhar um endereço, a informação de que chegou
 * perto.
 */
export function VisitResponseExpired() {
  return (
    <div className="flex min-h-screen items-center justify-center px-[16px]">
      <EmptyState.Root className="max-w-[420px]">
        <EmptyState.Icon>
          <Link2Off size={36} />
        </EmptyState.Icon>
        {/* `as="span"`: `EmptyState.Title` JÁ é o <h3>. Sem isto, a tipografia
            vinha de um segundo <h3> aninhado dentro do primeiro — marcação
            inválida, e o `getByRole("heading")` do E2E casa com dois elementos. */}
        <EmptyState.Title>
          <Title variant="heading-md" as="span">
            Este link não está mais válido
          </Title>
        </EmptyState.Title>
        <EmptyState.Description className="max-w-[320px]">
          Peça um link novo ao escritório — ele sai junto com a folha da rota do
          dia.
        </EmptyState.Description>
      </EmptyState.Root>
    </div>
  );
}
