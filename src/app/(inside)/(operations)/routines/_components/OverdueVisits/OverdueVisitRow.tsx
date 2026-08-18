"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { CalendarClock, Check, Clock, UserX } from "lucide-react";
import { formatDayLabel, formatWeekdayLabel } from "../../utils";
import { OverdueOutcome, OverdueVisit } from "./interface";

interface Props {
  visit: OverdueVisit;
  isAnswering: boolean;
  onAnswer: (outcome: OverdueOutcome) => void;
  onReschedule: () => void;
}

export function OverdueVisitRow({
  visit,
  isAnswering,
  onAnswer,
  onReschedule,
}: Props) {
  const client = visit.clientFactoryLink?.client ?? null;
  const factory = visit.clientFactoryLink?.factory ?? null;
  const clientName = clientDisplayName(client, "Cliente");
  const isRemote = visit.contactType === "REMOTE";
  const date = visit.day?.date ?? null;

  return (
    // `min-w-0` no card e em cada bloco de texto: sem isso, razão social longa
    // (sem espaço para quebrar) estica o card e estoura o painel para os lados.
    <div className="flex min-w-0 flex-col gap-10 rounded-(--r-md) border border-(--border) p-12">
      <div className="min-w-0">
        {/* Nome completo em até duas linhas, não reticências: o vendedor
            reconhece o cliente pela razão social inteira, e ela é o que
            diferencia duas lojas da mesma rede. */}
        <Title
          variant="body-md"
          weight="bold"
          className="line-clamp-2 leading-[1.35] break-words"
          title={clientName}
        >
          {clientName}
        </Title>
        <Title
          variant="micro"
          color="muted"
          className="mt-[2px] line-clamp-1 break-words"
        >
          {factory ? factoryName(factory) : "—"}
        </Title>
        {date && (
          <Title variant="micro" color="muted2" className="mt-[2px]">
            {/* "sexta · 31 Jul" — o vendedor reconhece o dia pelo nome, não
                pela data solta. */}
            {formatWeekdayLabel(date)} · {formatDayLabel(date)}
            {isRemote ? " · ligação" : ""}
          </Title>
        )}
      </div>

      {/* Duas colunas iguais: os desfechos ficam do mesmo tamanho, sem uma
          linha órfã de botão quando o texto de um deles é mais longo. */}
      <div className="grid grid-cols-2 gap-6">
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          fullWidth
          loading={isAnswering}
          onClick={() => onAnswer("COMPLETED")}
        >
          <Button.Icon icon={Check} />
          <Button.Title>{isRemote ? "Falei" : "Fui"}</Button.Title>
        </Button.Root>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          fullWidth
          disabled={isAnswering}
          onClick={() => onAnswer("CLIENT_ABSENT")}
        >
          <Button.Icon icon={UserX} />
          <Button.Title>{isRemote ? "Não atendeu" : "Não estava"}</Button.Title>
        </Button.Root>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          fullWidth
          disabled={isAnswering}
          onClick={() => onAnswer("NO_TIME")}
        >
          <Button.Icon icon={Clock} />
          <Button.Title>Não deu tempo</Button.Title>
        </Button.Root>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          fullWidth
          disabled={isAnswering}
          onClick={onReschedule}
        >
          <Button.Icon icon={CalendarClock} />
          <Button.Title>Remarcar</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
