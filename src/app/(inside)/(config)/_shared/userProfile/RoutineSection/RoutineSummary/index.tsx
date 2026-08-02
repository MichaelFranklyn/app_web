"use client";

import { Card } from "@/components/Card";
import { ProfileScheduleConfig } from "../../interface";
import { formatTime, formatWorkDays } from "../../utils";

interface Props {
  config: ProfileScheduleConfig;
}

/**
 * O resumo espelha o editor LINHA A LINHA — um controle, uma linha, na mesma
 * ordem e com o mesmo rótulo.
 *
 * Antes o resumo condensava: "Começa às"/"Termina às" viravam um "Expediente", e
 * as três opções de ligação viravam uma frase só. Nenhum valor ficava oculto,
 * mas quem comparava as duas telas contava 10 campos na edição e 7 na
 * visualização e ia procurar os três que "sumiram".
 */
export function RoutineSummary({ config }: Props) {
  return (
    <Card.Body padding="compact">
      <Card.Item variant="stat">
        <Card.Item.Label>Dias de trabalho</Card.Item.Label>
        <Card.Item.Value>{formatWorkDays(config.workDays)}</Card.Item.Value>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Começa às</Card.Item.Label>
        <Card.Item.Value>{formatTime(config.workStartTime)}</Card.Item.Value>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Termina às</Card.Item.Label>
        <Card.Item.Value>{formatTime(config.workEndTime)}</Card.Item.Value>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Visitas por dia</Card.Item.Label>
        <Card.Item.Value>até {config.maxVisitsPerDay}</Card.Item.Value>
      </Card.Item>

      <Card.Item variant="stat">
        <Card.Item.Label>Ligar entre visitas</Card.Item.Label>
        <Card.Item.Value>
          {config.isRemoteContactEnabled ? "sim" : "não"}
        </Card.Item.Value>
      </Card.Item>

      {/* Desligado, os dois parâmetros não valem para nada — o editor também os
          esconde, e mostrar número que não é usado faria a pessoa ajustá-lo. */}
      {config.isRemoteContactEnabled && (
        <>
          <Card.Item variant="stat">
            <Card.Item.Label>Ligações por dia</Card.Item.Label>
            <Card.Item.Value>
              até {config.maxRemoteContactsPerDay}
            </Card.Item.Value>
          </Card.Item>

          <Card.Item variant="stat">
            <Card.Item.Label>Ligar a partir de</Card.Item.Label>
            <Card.Item.Value>
              {config.remoteContactIntervalPct}% do intervalo
            </Card.Item.Value>
          </Card.Item>
        </>
      )}

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
