"use client";
import { Alert } from "@/components/Alert";

import { Button } from "@/components/Button";
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
    <Alert.Root variant="warning" className="flex-wrap">
      <Alert.Icon icon={CalendarClock} />
      <Alert.Content className="min-w-[200px]">
        <Alert.Title>
          {label} de dias que já passaram {count === 1 ? "está" : "estão"} sem
          resposta
        </Alert.Title>
        <Alert.Description>
          {canAnswer
            ? "Diga o que houve em cada uma — é assim que o sistema sabe quando voltar a esse cliente."
            : "Só o vendedor pode registrar o que aconteceu."}
        </Alert.Description>
      </Alert.Content>

      <Alert.Actions>
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
      </Alert.Actions>
    </Alert.Root>
  );
}
