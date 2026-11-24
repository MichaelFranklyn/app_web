"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { DataField } from "../../../dataCards";
import { ProfileScheduleConfig } from "../../interface";
import { formatTime, formatWorkDays } from "../../utils";

interface Props {
  config: ProfileScheduleConfig;
}

/**
 * O resumo espelha o editor LINHA A LINHA — um controle, um campo, na mesma
 * ordem e com o mesmo rótulo.
 *
 * Antes o resumo condensava: "Começa às"/"Termina às" viravam um "Expediente", e
 * as três opções de ligação viravam uma frase só. Nenhum valor ficava oculto,
 * mas quem comparava as duas telas contava 10 campos na edição e 7 na
 * visualização e ia procurar os três que "sumiram".
 *
 * Grade de `DataField` (rótulo em cima, valor embaixo), como os outros cards
 * do perfil: as linhas rótulo-à-esquerda/valor-à-direita deixavam um vão largo
 * no desktop e destoavam de "Dados pessoais" logo acima (crítica de
 * configurações, 23/11/2026).
 */
export function RoutineSummary({ config }: Props) {
  return (
    <Card.Body>
      <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={16}>
        <DataField
          label="Dias de trabalho"
          value={formatWorkDays(config.workDays)}
        />
        <DataField label="Começa às" value={formatTime(config.workStartTime)} />
        <DataField label="Termina às" value={formatTime(config.workEndTime)} />
        <DataField
          label="Ligar entre visitas"
          value={config.isRemoteContactEnabled ? "Sim" : "Não"}
        />
        {/* Desligado, o parâmetro não vale para nada — o editor também o
            esconde, e mostrar número que não é usado faria a pessoa ajustá-lo. */}
        {config.isRemoteContactEnabled && (
          <DataField
            label="Ligar a partir de"
            value={`${config.remoteContactIntervalPct}% do intervalo`}
          />
        )}
        <DataField
          label="Tempo médio de visita"
          value={`${config.avgVisitDurationMin} min`}
        />
        <DataField
          label="Ausência é remarcada"
          value={
            config.isRescheduleSameWeek
              ? "Na mesma semana"
              : "Na semana seguinte"
          }
        />
        <DataField
          label="Tentativas de remarcação"
          value={String(config.maxRescheduleAttempts)}
        />
      </Grid.Root>
    </Card.Body>
  );
}
