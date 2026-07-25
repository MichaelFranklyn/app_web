"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { InputNumber, InputToggle } from "@/components/Input";
import {
  fromTimeInputValue,
  RoutineOperationalForm,
  toggleWorkDay,
  toTimeInputValue,
  WEEKDAYS,
} from "../routineConfig";

interface Props {
  form: RoutineOperationalForm;
  disabled: boolean;
  onChange: (patch: Partial<RoutineOperationalForm>) => void;
}

/**
 * As MESMAS linhas do resumo, com o controle no lugar do valor. Editar sem sair
 * do card é o que mantém a pessoa no contexto: ela vê o que está mudando.
 */
export function RoutineEditor({ form, disabled, onChange }: Props) {
  return (
    <Card.Body padding="compact">
      <Card.Item variant="stat">
        <Card.Item.Label>Dias de trabalho</Card.Item.Label>
        <Card.Item.Actions>
          <div className="flex flex-wrap gap-6">
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
                  disabled={disabled}
                  onClick={() =>
                    onChange({ workDays: toggleWorkDay(form.workDays, value) })
                  }
                >
                  <Button.Title>{label}</Button.Title>
                </Button.Root>
              );
            })}
          </div>
        </Card.Item.Actions>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Começa às</Card.Item.Label>
        <Card.Item.Actions>
          <InputNumber
            type="time"
            value={toTimeInputValue(form.workStartTime)}
            disabled={disabled}
            onChange={(e) =>
              onChange({ workStartTime: fromTimeInputValue(e.target.value) })
            }
            containerClassName="w-[120px]"
          />
        </Card.Item.Actions>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Termina às</Card.Item.Label>
        <Card.Item.Actions>
          <InputNumber
            type="time"
            value={toTimeInputValue(form.workEndTime)}
            disabled={disabled}
            onChange={(e) =>
              onChange({ workEndTime: fromTimeInputValue(e.target.value) })
            }
            containerClassName="w-[120px]"
          />
        </Card.Item.Actions>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Visitas por dia, no máximo</Card.Item.Label>
        <Card.Item.Actions>
          <InputNumber
            value={form.maxVisitsPerDay}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                maxVisitsPerDay: e.target.value ? Number(e.target.value) : 1,
              })
            }
            min={1}
            max={20}
            containerClassName="w-[80px]"
          />
        </Card.Item.Actions>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Tempo médio de visita (minutos)</Card.Item.Label>
        <Card.Item.Actions>
          <InputNumber
            value={form.avgVisitDurationMin}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                avgVisitDurationMin: e.target.value
                  ? Number(e.target.value)
                  : 15,
              })
            }
            min={15}
            max={180}
            containerClassName="w-[80px]"
          />
        </Card.Item.Actions>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Remarcar ausência na mesma semana</Card.Item.Label>
        <Card.Item.Actions>
          <InputToggle
            checked={form.isRescheduleSameWeek}
            disabled={disabled}
            onChange={(e) =>
              onChange({ isRescheduleSameWeek: e.target.checked })
            }
          />
        </Card.Item.Actions>
      </Card.Item>

      <Card.Item variant="stat" bordered={false}>
        <Card.Item.Label>Tentativas de remarcação</Card.Item.Label>
        <Card.Item.Actions>
          <InputNumber
            value={form.maxRescheduleAttempts}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                maxRescheduleAttempts: e.target.value
                  ? Number(e.target.value)
                  : 0,
              })
            }
            min={0}
            max={10}
            containerClassName="w-[80px]"
          />
        </Card.Item.Actions>
      </Card.Item>
    </Card.Body>
  );
}
