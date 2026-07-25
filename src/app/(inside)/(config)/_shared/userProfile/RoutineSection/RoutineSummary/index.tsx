"use client";

import { Card } from "@/components/Card";
import { ProfileScheduleConfig } from "../../interface";
import { formatTime, formatWorkDays } from "../../utils";

interface Props {
  config: ProfileScheduleConfig;
}

export function RoutineSummary({ config }: Props) {
  return (
    <Card.Body padding="compact">
      <Card.Item variant="stat">
        <Card.Item.Label>Dias de trabalho</Card.Item.Label>
        <Card.Item.Value>{formatWorkDays(config.workDays)}</Card.Item.Value>
      </Card.Item>
      <Card.Item variant="stat">
        <Card.Item.Label>Expediente</Card.Item.Label>
        <Card.Item.Value>
          {formatTime(config.workStartTime)} às {formatTime(config.workEndTime)}
        </Card.Item.Value>
      </Card.Item>
      <Card.Item variant="stat">
        <Card.Item.Label>Visitas por dia</Card.Item.Label>
        <Card.Item.Value>até {config.maxVisitsPerDay}</Card.Item.Value>
      </Card.Item>
      <Card.Item variant="stat">
        <Card.Item.Label>Tempo médio de visita</Card.Item.Label>
        <Card.Item.Value>{config.avgVisitDurationMin} min</Card.Item.Value>
      </Card.Item>
      <Card.Item variant="stat">
        <Card.Item.Label>Ausência é remarcada</Card.Item.Label>
        <Card.Item.Value>
          {config.isRescheduleSameWeek
            ? "na mesma semana"
            : "na semana seguinte"}
        </Card.Item.Value>
      </Card.Item>
      <Card.Item variant="stat" bordered={false}>
        <Card.Item.Label>Tentativas de remarcação</Card.Item.Label>
        <Card.Item.Value>{config.maxRescheduleAttempts}</Card.Item.Value>
      </Card.Item>
    </Card.Body>
  );
}
