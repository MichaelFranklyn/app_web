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
  const isRemote = visit.contactType === "REMOTE";
  const date = visit.day?.date ?? null;

  return (
    <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) p-12">
      <div className="min-w-0">
        <Title variant="body-sm" weight="medium" className="truncate">
          {clientDisplayName(client, "Cliente")}
        </Title>
        <Title variant="micro" color="muted" className="mt-[2px] truncate">
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

      <div className="flex flex-wrap items-center gap-6">
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
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
