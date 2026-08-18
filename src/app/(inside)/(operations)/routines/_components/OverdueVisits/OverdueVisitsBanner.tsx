"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { CalendarClock, ChevronRight } from "lucide-react";

interface Props {
  count: number;
  /** O gestor acompanha; quem responde pelo que houve é o vendedor. */
  canAnswer: boolean;
  onOpen: () => void;
}

/**
 * O aviso de dívida no fluxo da página do dia — uma linha, e só.
 *
 * A lista inteira aqui empurrava a rota para fora da primeira tela: com muitas
 * visitas em aberto, quem abria o dia via um paredão de cobrança em vez do
 * caminho de hoje. A faixa avisa que existe pendência; responder é um clique,
 * e acontece no painel lateral.
 */
export function OverdueVisitsBanner({ count, canAnswer, onOpen }: Props) {
  const label = count === 1 ? "1 visita" : `${count} visitas`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-12 rounded-(--r-md) border border-(--amber) bg-(--amber-bg) px-16 py-12">
      <div className="flex min-w-0 items-center gap-10">
        <CalendarClock size={18} className="shrink-0 text-(--amber)" />
        <div className="min-w-0">
          <Title variant="body-sm" weight="bold" className="text-(--amber)">
            {label} de dias que já passaram {count === 1 ? "está" : "estão"} sem
            resposta
          </Title>
          <Title variant="micro" color="muted">
            {canAnswer
              ? "Diga o que houve em cada uma — é assim que o sistema sabe quando voltar a esse cliente."
              : "Só o vendedor pode registrar o que aconteceu."}
          </Title>
        </div>
      </div>

      <Button.Root
        appearance="solid"
        color="amber"
        size="sm"
        noUppercase
        onClick={onOpen}
      >
        <Button.Title>{canAnswer ? "Responder" : "Ver visitas"}</Button.Title>
        <Button.Icon icon={ChevronRight} />
      </Button.Root>
    </div>
  );
}
