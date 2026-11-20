"use client";

import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { Building2 } from "lucide-react";

const REASON =
  "A Agenda e a Rota do dia juntam os clientes de todos os seus escritórios, por isso não dá para trocar de escritório aqui. Para trocar, vá para outra tela do sistema.";

/**
 * O topo nas telas que juntam os escritórios: no lugar do nome do escritório
 * da sessão, "Todos os escritórios", sem troca — trocar não mudaria nada na
 * agenda e o nome de um escritório só enganaria. O motivo fica no tooltip
 * (e no aviso fixo da própria agenda, que vale também no toque).
 */
export function AllOfficesBadge() {
  return (
    <Tooltip
      content={REASON}
      position="right"
      className="max-w-72 whitespace-normal"
    >
      {/* Botão desabilitado não recebe o mouse: o span leva o tooltip e o
          foco do teclado. */}
      <span tabIndex={0} className="inline-flex">
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          disabled
          aria-label={`Todos os escritórios. ${REASON}`}
        >
          <Button.Icon icon={Building2} />
          <Button.Title>Todos os escritórios</Button.Title>
        </Button.Root>
      </span>
    </Tooltip>
  );
}
