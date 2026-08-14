"use client";

import { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltip";
import {
  limitReachedMessage,
  PlanLimitKey,
  usePlanLimit,
} from "@/services/plan";

interface PlanLimitGateProps {
  /** Qual teto do plano governa este botão. */
  limit: PlanLimitKey;
  children: ReactNode;
}

/**
 * Neutraliza o botão de criar quando a empresa já ocupou o teto do plano.
 *
 * O botão continua na tela, e isso é proposital: some daqui e quem procura por
 * ele acha que o sistema quebrou. Ficando visível, o cursor explica o motivo e
 * o caminho ("fale com o suporte") — é a mesma frase que a mutation devolveria
 * ao clique, sem gastar o clique.
 *
 * O bloqueio é do wrapper, não do filho: `pointer-events` desligado no conteúdo
 * mata o clique sem precisar que cada modal aceite um `disabled` próprio, e o
 * `span` de fora continua recebendo hover — um elemento desabilitado de verdade
 * não dispara evento nenhum, e o tooltip nunca apareceria.
 */
export function PlanLimitGate({ limit, children }: PlanLimitGateProps) {
  const { usage, isAtLimit } = usePlanLimit(limit);

  if (!isAtLimit) return <>{children}</>;

  return (
    <Tooltip content={limitReachedMessage(usage)}>
      <span
        aria-disabled
        className="inline-flex cursor-not-allowed opacity-50 [&>*]:pointer-events-none"
      >
        {children}
      </span>
    </Tooltip>
  );
}
