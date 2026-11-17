import { RouteError } from "@/components/RouteError";
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
    <RouteError
      icon={<Link2Off size={36} />}
      title="Este link não está mais válido"
      description={children}
    />
  );
}
