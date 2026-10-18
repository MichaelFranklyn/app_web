"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { MapPin } from "lucide-react";
import { VisitClient } from "../../interface";
import { NearbyList } from "./NearbyList";
import { TripDayPicker } from "./TripDayPicker";
import { TripImpact } from "./TripImpact";
import { usePromoteContact } from "./usePromoteContact";

interface Props {
  itemId: string;
  client: VisitClient | null;
  /** Dia em que o contato está hoje — padrão da viagem, e trocável no modal. */
  currentDate: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

/**
 * Transformar uma ligação em visita — o vendedor decidiu ir lá.
 *
 * O motor manda para o telefone quem não cabe num dia de estrada; o vendedor
 * sabe o que o score não sabe (o cliente pediu, a região vai render). Aqui ele
 * reverte a decisão COM A CONTA NA FRENTE: quanto é de viagem, o que acontece
 * com o dia e quem mais está naquela região merecendo a visita.
 */
export function PromoteContactModal({
  itemId,
  client,
  currentDate,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const {
    preview,
    targetDate,
    setTargetDate,
    loading,
    isRefreshing,
    error,
    strategy,
    setStrategy,
    confirmed,
    setConfirmed,
    selected,
    toggleCandidate,
    canSubmit,
    isSubmitting,
    submit,
  } = usePromoteContact({
    itemId,
    currentDate,
    open,
    onDone: () => {
      onOpenChange(false);
      onDone();
    },
  });

  const clientName = clientDisplayName(client, "este cliente");

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header
          title={`Ir visitar ${clientName}`}
          description="Esta parada está marcada como ligação. Veja o que muda no seu dia antes de transformá-la em visita."
        />
        <Modal.Body>
          {loading && (
            <Title variant="body-sm" color="muted">
              Calculando a viagem e procurando clientes na mesma região...
            </Title>
          )}

          {error && !loading && <QueryError />}

          {preview && (
            <div className="flex flex-col gap-16">
              <TripDayPicker
                currentDate={currentDate}
                value={targetDate}
                onChange={setTargetDate}
                disabled={isSubmitting}
              />
              {isRefreshing && (
                <Title variant="micro" color="muted">
                  Refazendo a conta para o dia escolhido...
                </Title>
              )}
              <TripImpact
                preview={preview}
                confirmed={confirmed}
                onConfirmedChange={setConfirmed}
                strategy={strategy}
                onStrategyChange={setStrategy}
              />
              <NearbyList
                candidates={preview.nearby}
                selected={selected}
                onToggle={toggleCandidate}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isSubmitting}
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
            loading={isSubmitting}
            disabled={!canSubmit}
            onClick={submit}
          >
            <Button.Icon icon={MapPin} />
            <Button.Title>
              {selected.length > 0
                ? `Marcar visita + ${selected.length}`
                : "Marcar visita"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
