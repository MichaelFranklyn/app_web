"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";

import { formatDayLabel, formatWeekdayLabel } from "../../utils";
import { AddVisitModalProps } from "./interface";
import { useAddVisit } from "./useAddVisit";

export function AddVisitModal({
  open,
  onOpenChange,
  day,
  date,
  scheduleId,
  nextDay,
  sellerId,
  maxVisitsPerDay,
  onDone,
}: AddVisitModalProps) {
  const {
    options,
    optionsLoading,
    selectedLinkId,
    setSelectedLinkId,
    confirmingOverLimit,
    isFolga,
    isDayFull,
    nextDayHasRoom,
    isLoading,
    handlePrimary,
    handleAddToNextDay,
  } = useAddVisit({
    open,
    onOpenChange,
    day,
    date,
    scheduleId,
    nextDay,
    sellerId,
    maxVisitsPerDay,
    onDone,
  });

  const selectValue = options.find((o) => o.value === selectedLinkId) ?? null;
  const nextDayLabel = nextDay
    ? `${formatWeekdayLabel(nextDay.date)}, ${formatDayLabel(nextDay.date)}`
    : null;

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Adicionar visita"
          description={
            isFolga
              ? "Este dia está de folga. Escolha o cliente para começar a trabalhar neste dia."
              : "Escolha o cliente para agendar neste dia."
          }
        />
        <Modal.Body>
          <div className="flex flex-col gap-12">
            <Input.Select
              options={options}
              value={selectValue}
              variant="single"
              placeholder={
                optionsLoading
                  ? "Carregando clientes…"
                  : options.length === 0
                    ? "Nenhum cliente disponível"
                    : "Selecionar cliente"
              }
              onChange={(val: SelectOption | SelectOption[] | null) => {
                const opt = Array.isArray(val) ? val[0] : val;
                setSelectedLinkId(opt ? opt.value : null);
              }}
            />

            {/* Aviso de limite: aparece só quando o dia está cheio e o usuário
                confirmou a intenção de adicionar mesmo assim. */}
            {confirmingOverLimit && isDayFull && (
              <div className="flex flex-col gap-8 rounded-(--radius-md) border border-(--amber-bd) bg-(--amber-bg) p-12">
                <Title variant="body-xs" weight="semibold" color="amber">
                  Este dia já atingiu o limite de {maxVisitsPerDay} visitas.
                </Title>
                <Title variant="micro" color="muted">
                  {nextDayHasRoom && nextDayLabel
                    ? `Você pode adicionar mesmo assim ou agendar no dia seguinte (${nextDayLabel}).`
                    : "Você pode adicionar mesmo assim. O dia seguinte não tem espaço."}
                </Title>
              </div>
            )}
          </div>
        </Modal.Body>
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

          {confirmingOverLimit && isDayFull && nextDayHasRoom && (
            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading || !selectedLinkId}
              onClick={handleAddToNextDay}
            >
              <Button.Title>Agendar no dia seguinte</Button.Title>
            </Button.Root>
          )}

          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={!selectedLinkId}
            onClick={handlePrimary}
          >
            <Button.Title>
              {confirmingOverLimit && isDayFull
                ? "Adicionar mesmo assim"
                : "Adicionar visita"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
