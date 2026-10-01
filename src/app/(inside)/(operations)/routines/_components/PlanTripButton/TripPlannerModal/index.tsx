"use client";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { DateRange } from "react-day-picker";

import { TripPreview } from "../TripPreview";
import { useTripPlanner } from "../useTripPlanner";
import { regionOptionLabel } from "../utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string | null;
  onPlanned: () => void;
}

const asList = (val: SelectOption | SelectOption[] | null): SelectOption[] =>
  Array.isArray(val) ? val : val ? [val] : [];

/**
 * Planejar viagem: escolher as cidades e os dias, conferir, confirmar.
 *
 * Dois passos no mesmo modal (escolha → prévia), e não modal sobre modal: a
 * prévia substitui o formulário e "Voltar" devolve as escolhas intactas.
 */
export function TripPlannerModal({
  open,
  onOpenChange,
  sellerId,
  onPlanned,
}: Props) {
  const form = useTripPlanner({
    open,
    sellerId,
    onClose: () => onOpenChange(false),
    onPlanned,
  });

  const options: SelectOption[] = form.options.map((option) => ({
    value: option.key,
    label: regionOptionLabel(option),
  }));
  const selected = options.filter((o) => form.selectedKeys.includes(o.value));
  const range: DateRange | null = form.period.from
    ? { from: form.period.from, to: form.period.to ?? undefined }
    : null;

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={form.plan ? "Confira a viagem" : "Planejar viagem"}
          description={
            form.plan
              ? "É assim que a viagem entra na rotina. Confirme ou volte para mudar."
              : "Escolha as cidades que você vai atender e os dias em que vai estar lá. A rotina monta as visitas com todos os clientes dessas cidades, dos mais urgentes para os menos."
          }
        />
        <Modal.Body>
          {form.plan ? (
            <TripPreview plan={form.plan} />
          ) : (
            <div className="flex flex-col gap-12">
              <Input.Select
                label="Cidades"
                required
                variant="multi"
                options={options}
                value={selected}
                loading={form.optionsLoading}
                placeholder={
                  form.optionsLoading
                    ? "Carregando cidades…"
                    : "Escolha as cidades"
                }
                hint="Só aparecem cidades onde você tem clientes, com quantos em cada uma."
                onChange={(val) =>
                  form.setSelectedKeys(asList(val).map((o) => o.value))
                }
              />
              <Input.Date
                label="Dias da viagem"
                required
                variant="range"
                value={range}
                placeholder="Escolha a ida e a volta"
                hint="Entram os seus dias de trabalho dentro do período. Feriados e dias marcados como não trabalhados ficam de fora."
                onChange={(value) => {
                  const next = value as DateRange | null | undefined;
                  form.setPeriod({
                    from: next?.from ?? null,
                    to: next?.to ?? null,
                  });
                }}
              />
              <Input.Text
                label="Observação"
                placeholder="Ex: feira de construção em Feira de Santana"
                value={form.note}
                maxLength={255}
                onChange={(e) => form.setNote(e.target.value)}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {form.plan ? (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={form.isSaving}
              onClick={form.backToForm}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          ) : (
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
              >
                <Button.Title>Cancelar</Button.Title>
              </Button.Root>
            </Modal.Close>
          )}
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={form.plan ? form.isSaving : form.isPreviewing}
            disabled={!form.isValid}
            onClick={form.plan ? form.confirm : form.requestPreview}
          >
            <Button.Title>
              {form.plan ? "Confirmar viagem" : "Ver como fica"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
