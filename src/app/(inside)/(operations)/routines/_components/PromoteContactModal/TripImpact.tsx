"use client";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
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
      <div className="flex items-center gap-8 rounded-(--r-md) border border-(--border) p-12">
        <Car size={18} className="shrink-0 text-(--muted)" />
        <Title variant="body-sm">
          {preview.distanceKm.toFixed(0)} km de distância ·{" "}
          {formatDuration(preview.travelMinOneWay)} de viagem em cada sentido
        </Title>
      </div>

      {needsConfirm && (
        <div
          className={cn(
            "flex flex-col gap-10 rounded-(--r-md) p-12",
            "border border-(--amber) bg-(--amber)/8"
          )}
        >
          <div className="flex items-start gap-8">
            <AlertTriangle
              size={18}
              className="mt-[2px] shrink-0 text-(--amber)"
            />
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
          </div>

          {preview.displacedCount > 0 && (
            <div className="flex flex-col gap-6 pl-[26px]">
              <Title variant="micro" color="muted">
                O que fazer com {preview.displacedCount === 1 ? "ela" : "elas"}?
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

          <div className="pl-[26px]">
            <Input.Checkbox
              label="Entendi e quero marcar esta visita mesmo assim"
              checked={confirmed}
              onChange={(e) => onConfirmedChange(e.target.checked)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
