"use client";
import { ToggleGroup } from "@/components/ToggleGroup";
import { Card } from "@/components/Card";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { House, MapPin } from "lucide-react";

import { DepartureModalProps } from "./interface";
import { useDeparture } from "./useDeparture";
import { DEPARTURE_STEPS } from "./utils";

export function DepartureModal({
  open,
  onOpenChange,
  dayId,
  departureType,
  departureAddress,
  onChanged,
}: DepartureModalProps) {
  const { mode, setMode, isLoading, applyHome, applyCustom } = useDeparture({
    open,
    onOpenChange,
    dayId,
    departureType,
    onChanged,
  });

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Ponto de partida"
          description="De onde você sai para começar o dia. A rota é recalculada a partir daqui."
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <ToggleGroup
              aria-label="Ponto de partida"
              size="md"
              fullWidth
              disabled={isLoading}
              options={[
                { value: "home", label: "Minha casa", icon: House },
                { value: "custom", label: "Outro endereço", icon: MapPin },
              ]}
              value={mode}
              onChange={setMode}
            />

            {mode === "home" ? (
              <Card.Root inset tone="muted">
                <Card.Body padding="sm">
                  <Title variant="body-sm" color="muted">
                    A rota começa no endereço de casa cadastrado no seu perfil
                    de vendedor. Se ele estiver em branco, o dia parte da
                    primeira visita mais urgente.
                  </Title>
                </Card.Body>
              </Card.Root>
            ) : (
              <div className="flex flex-col gap-12">
                {departureType === "CUSTOM" && departureAddress && (
                  <Title variant="micro" color="muted2">
                    Atual: {departureAddress}
                  </Title>
                )}
                <FormBuilder
                  steps={DEPARTURE_STEPS}
                  onSubmit={applyCustom}
                  submitLabel="Salvar ponto de partida"
                  loading={isLoading}
                />
              </div>
            )}
          </div>
        </Modal.Body>

        {/* O modo "outro endereço" usa o botão do próprio FormBuilder; o modo
            "casa" não tem formulário, então o salvar fica no rodapé. */}
        {mode === "home" && (
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
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
              loading={isLoading}
              onClick={applyHome}
            >
              <Button.Title>Usar endereço da casa</Button.Title>
            </Button.Root>
          </Modal.Footer>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
