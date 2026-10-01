"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Title } from "@/components/Title";
import { formatDateDMY } from "@/utils/format/masks";
import { MapPinned, X } from "lucide-react";

import { SellerTrip } from "../../interface";

interface Props {
  trips: SellerTrip[];
  onCancel: (id: string) => Promise<void>;
  /** Depois de cancelar: a rotina em tela perde as visitas da viagem. */
  onCancelled: () => void;
}

/**
 * As viagens que ainda vão acontecer (ou estão acontecendo).
 *
 * Fica acima da semana porque a viagem atravessa semanas: quem abre a rotina
 * precisa saber que "de 05 a 07 eu estou em Feira" antes de ler dia a dia.
 */
export function UpcomingTrips({ trips, onCancel, onCancelled }: Props) {
  if (trips.length === 0) return null;

  return (
    <div className="flex flex-col gap-8" data-tour="routines-trips">
      {trips.map((trip) => (
        <Card.Root key={trip.id} inset tone="muted">
          <Card.Body padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-12">
              <div className="flex min-w-0 items-center gap-8">
                <MapPinned size={16} className="shrink-0 text-(--purple)" />
                <div className="flex min-w-0 flex-col">
                  <Title variant="body-md" weight="semibold">
                    Viagem: {trip.title}
                  </Title>
                  <Title variant="body-sm" color="secondary">
                    {formatDateDMY(trip.startDate)} a{" "}
                    {formatDateDMY(trip.endDate)}
                    {trip.note ? ` · ${trip.note}` : ""}
                  </Title>
                </div>
                <Badge.Root
                  color="purple"
                  appearance="tinted"
                  title="Visitas desta viagem que já foram feitas, do total planejado."
                >
                  <Badge.Text>
                    {trip.doneVisits} de {trip.plannedVisits} visitas
                  </Badge.Text>
                </Badge.Root>
              </div>

              <ConfirmModal
                title="Cancelar viagem"
                description="As visitas desta viagem que ainda não aconteceram saem da rotina, e os dias voltam a sair de casa. As que já foram feitas continuam registradas."
                confirmLabel="Cancelar viagem"
                cancelLabel="Voltar"
                confirmColor="red"
                successMessage="Viagem cancelada."
                onConfirm={() => onCancel(trip.id)}
                onSuccess={onCancelled}
                trigger={
                  <Button.Root
                    appearance="outline"
                    color="red"
                    size="sm"
                    noUppercase
                  >
                    <Button.Icon icon={X} />
                    <Button.Title>Cancelar viagem</Button.Title>
                  </Button.Root>
                }
              />
            </div>
          </Card.Body>
        </Card.Root>
      ))}
    </div>
  );
}
