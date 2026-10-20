"use client";
import { Alert } from "@/components/Alert";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { AlertTriangle, Car } from "lucide-react";
import { DisplacedStrategy, VisitPromotionPreview } from "./interface";

interface Props {
  preview: VisitPromotionPreview;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  strategy: DisplacedStrategy;
  onStrategyChange: (value: DisplacedStrategy) => void;
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
};

/**
 * O custo da viagem em linguagem de vendedor — distância, tempo de estrada e o
 * que acontece com o dia. O aviso só aparece quando a viagem realmente atrapalha
 * o dia: avisar sempre treinaria a pessoa a clicar sem ler.
 */
export function TripImpact({
  preview,
  confirmed,
  onConfirmedChange,
  strategy,
  onStrategyChange,
}: Props) {
  const needsConfirm = !preview.fitsWithExisting;

  return (
    <div className="flex flex-col gap-12">
      <Alert.Root variant="neutral" className="items-center">
        <Alert.Icon icon={Car} className="text-(--muted)" />
        <Alert.Content>
          <Alert.Description>
            {preview.distanceKm.toFixed(0)} km de distância ·{" "}
            {formatDuration(preview.travelMinOneWay)} de viagem em cada sentido
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      {needsConfirm && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={AlertTriangle} className="mt-[2px]" />
          <Alert.Content className="gap-10">
            <Title variant="body-sm">
              {preview.isReachable
                ? "Esta visita é para uma região distante da sua base: ao marcá-la para este dia, ela toma o dia inteiro."
                : "Esta visita é para uma região tão distante que não dá para ir, atender e voltar dentro do expediente."}
              {preview.displacedCount > 0 && (
                <>
                  {" "}
                  Você tem {preview.displacedCount}{" "}
                  {preview.displacedCount === 1 ? "visita" : "visitas"} marcada
                  {preview.displacedCount === 1 ? "" : "s"} para este dia.
                </>
              )}
            </Title>

            {preview.displacedCount > 0 && (
              <div className="flex flex-col gap-6">
                <Title variant="micro" color="muted">
                  O que fazer com{" "}
                  {preview.displacedCount === 1 ? "ela" : "elas"}?
                </Title>
                <Input.Radio
                  name="displaced-strategy"
                  label="Transformar em ligação neste mesmo dia"
                  checked={strategy === "TO_REMOTE"}
                  onChange={() => onStrategyChange("TO_REMOTE")}
                />
                <Input.Radio
                  name="displaced-strategy"
                  label="Empurrar para os próximos dias com vaga"
                  checked={strategy === "NEXT_DAYS"}
                  onChange={() => onStrategyChange("NEXT_DAYS")}
                />
              </div>
            )}

            <Input.Checkbox
              label="Entendi e quero marcar esta visita mesmo assim"
              checked={confirmed}
              onChange={(e) => onConfirmedChange(e.target.checked)}
            />
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
