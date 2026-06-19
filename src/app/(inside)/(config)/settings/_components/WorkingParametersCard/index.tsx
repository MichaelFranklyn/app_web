"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { InputNumber } from "@/components/Input";
import { Title } from "@/components/Title";
import { SettingsFormState } from "../../interface";
import { WEEKDAYS } from "../../utils";

interface Props {
  form: SettingsFormState;
  onChange: (patch: Partial<SettingsFormState>) => void;
}

const toTimeString = (value: string): string => value.slice(0, 5);

export function WorkingParametersCard({ form, onChange }: Props) {
  const toggleDay = (day: number) => {
    const next = form.workDays.includes(day)
      ? form.workDays.filter((d) => d !== day)
      : [...form.workDays, day];
    onChange({ workDays: next.sort((a, b) => a - b) });
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Parâmetros de trabalho
        </Card.Header.Title>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-14">
          <InputNumber
            label="Máximo de visitas por dia"
            value={form.maxVisitsPerDay}
            onChange={(e) =>
              onChange({
                maxVisitsPerDay: e.target.value
                  ? Number(e.target.value)
                  : 1,
              })
            }
            min={1}
            max={20}
          />
          <InputNumber
            label="Tempo médio de visita (minutos)"
            value={form.avgVisitDurationMin}
            onChange={(e) =>
              onChange({
                avgVisitDurationMin: e.target.value
                  ? Number(e.target.value)
                  : 15,
              })
            }
            min={15}
            max={180}
          />
          <div className="grid grid-cols-2 gap-10">
            <InputNumber
              label="Início do expediente"
              type="time"
              value={toTimeString(form.workStartTime)}
              onChange={(e) =>
                onChange({ workStartTime: `${e.target.value}:00` })
              }
            />
            <InputNumber
              label="Fim do expediente"
              type="time"
              value={toTimeString(form.workEndTime)}
              onChange={(e) =>
                onChange({ workEndTime: `${e.target.value}:00` })
              }
            />
          </div>
          <div className="flex flex-col gap-5">
            <Title
              variant="micro"
              color="muted"
              className="uppercase tracking-[0.08em]"
            >
              Dias de trabalho
            </Title>
            <div className="flex gap-6">
              {WEEKDAYS.map(({ value, label }) => {
                const active = form.workDays.includes(value);
                return (
                  <Button.Root
                    key={value}
                    type="button"
                    size="sm"
                    appearance={active ? "solid" : "outline"}
                    color={active ? "amber" : "neutral"}
                    noUppercase
                    onClick={() => toggleDay(value)}
                  >
                    <Button.Title>{label}</Button.Title>
                  </Button.Root>
                );
              })}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
