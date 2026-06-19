"use client";

import { Card } from "@/components/Card";
import { InputNumber, InputToggle } from "@/components/Input";
import { SettingsFormState } from "../../interface";

interface Props {
  form: SettingsFormState;
  onChange: (patch: Partial<SettingsFormState>) => void;
}

export function SchedulingPreferencesCard({ form, onChange }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Preferências de reagendamento
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        <Card.Item variant="stat">
          <Card.Item.Label>Reagendar ausências na mesma semana</Card.Item.Label>
          <Card.Item.Actions>
            <InputToggle
              checked={form.rescheduleSameWeek}
              onChange={(e) =>
                onChange({ rescheduleSameWeek: e.target.checked })
              }
            />
          </Card.Item.Actions>
        </Card.Item>
        <Card.Item variant="stat">
          <Card.Item.Label>Tentativas máximas de reagendamento</Card.Item.Label>
          <Card.Item.Actions>
            <InputNumber
              value={form.maxRescheduleAttempts}
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
        <Card.Item variant="stat" bordered={false}>
          <Card.Item.Label>Penalidade por ausência (pontos)</Card.Item.Label>
          <Card.Item.Actions>
            <InputNumber
              value={form.penaltyScorePerMiss}
              onChange={(e) =>
                onChange({ penaltyScorePerMiss: e.target.value || "0" })
              }
              min={0}
              step={0.1}
              containerClassName="w-[80px]"
            />
          </Card.Item.Actions>
        </Card.Item>
      </Card.Body>
    </Card.Root>
  );
}
