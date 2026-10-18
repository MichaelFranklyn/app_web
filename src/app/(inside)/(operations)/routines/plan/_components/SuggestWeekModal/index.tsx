"use client";

import { Button } from "@/components/Button";
import { InputNumber } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { DaysPicker } from "../DaysPicker";
import { SuggestedStop } from "./interface";
import { useSuggestWeek } from "./useSuggestWeek";

interface Props {
  sellerId: string | null;
  weekStart: string;
  openDates: string[];
  workDates: string[];
  /** A sugestão chegou: a tela pré-marca os clientes. */
  onSuggested: (stops: SuggestedStop[]) => void;
}

const toCount = (raw: string): number =>
  Math.max(0, Math.min(20, Number(raw) || 0));

/**
 * "Sugerir pra mim": o vendedor diz quantas visitas e ligações quer por dia e
 * em que dias, e a tela volta com os clientes do topo da lista já marcados,
 * cada um no dia da sua região. É sugestão — ele tira, troca e acrescenta
 * antes de conferir a semana.
 */
export function SuggestWeekModal({
  sellerId,
  weekStart,
  openDates,
  workDates,
  onSuggested,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useSuggestWeek({
    open,
    sellerId,
    weekStart,
    workDates,
    onSuggested: (stops) => {
      setOpen(false);
      onSuggested(stops);
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="tinted" color="amber" size="sm" noUppercase>
          <Button.Icon icon={Sparkles} />
          <Button.Title>Sugerir pra mim</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header
          title="Sugerir a semana"
          description="O sistema marca os clientes mais urgentes e põe cada um no dia em que você vai estar perto. Depois você mexe à vontade."
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <div className="flex flex-wrap gap-16">
              <InputNumber
                label="Visitas por dia"
                placeholder="Ex: 4"
                min={0}
                max={20}
                value={form.visitsPerDay}
                onChange={(e) => form.setVisitsPerDay(toCount(e.target.value))}
                containerClassName="w-[140px]"
              />
              <InputNumber
                label="Ligações por dia"
                placeholder="Ex: 2"
                min={0}
                max={20}
                value={form.callsPerDay}
                onChange={(e) => form.setCallsPerDay(toCount(e.target.value))}
                containerClassName="w-[140px]"
              />
            </div>
            <DaysPicker
              openDates={openDates}
              days={form.days}
              onToggle={form.toggleDay}
            />
            <Title variant="body-xs" color="muted">
              Quem você já escolheu continua escolhido. Quem já está marcado na
              semana não é sugerido de novo.
            </Title>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={form.isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={form.isLoading}
            disabled={!form.isValid}
            onClick={() => void form.suggest()}
          >
            <Button.Title>Sugerir</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
