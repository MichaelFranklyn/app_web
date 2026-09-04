"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { AlertTriangle, Car, Phone } from "lucide-react";

import { ScheduleVisitModalProps, VisitContactType } from "./interface";
import { AUTO_FACTORY, useScheduleVisit } from "./useScheduleVisit";

const CONTACT_CHOICES: {
  value: VisitContactType;
  label: string;
  icon: typeof Car;
}[] = [
  { value: "IN_PERSON", label: "Ir até o cliente", icon: Car },
  { value: "REMOTE", label: "Ligar para o cliente", icon: Phone },
];

const pick = (
  options: SelectOption[],
  value: string | null
): SelectOption | null => options.find((o) => o.value === value) ?? null;

const single = (
  val: SelectOption | SelectOption[] | null
): SelectOption | null => (Array.isArray(val) ? (val[0] ?? null) : val);

/**
 * Marcar uma visita à mão: escolher o cliente, escolher o dia, marcar.
 *
 * Compartilhado entre a rotina do vendedor (`/routines`, onde o cliente é
 * escolhido aqui) e a ficha do cliente (`/clients/[id]/visits`, onde ele já
 * vem definido) — as duas telas de onde alguém sai para agendar. Mora em
 * `components/` por isso: é a MESMA pergunta feita de dois lugares distantes.
 *
 * O que o modal não decide: a fábrica que motiva a visita (o backend usa a de
 * maior score, salvo escolha explícita) e o dia cheio, que volta do servidor
 * como aviso e só é furado com a confirmação de quem está marcando.
 */
export function ScheduleVisitModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  sellerId,
  defaultDate,
  onScheduled,
}: ScheduleVisitModalProps) {
  const form = useScheduleVisit({
    open,
    onOpenChange,
    clientId,
    sellerId,
    defaultDate,
    onScheduled,
  });

  const isRemote = form.contactType === "REMOTE";

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={isRemote ? "Marcar contato" : "Marcar visita"}
          description={
            clientName
              ? `Escolha o dia em que você vai atender ${clientName}.`
              : "Escolha o cliente e o dia. A rotina da semana é criada se ainda não existir."
          }
        />
        <Modal.Body>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <Title variant="label" color="muted">
                O que você vai fazer?
              </Title>
              <div className="flex gap-8">
                {CONTACT_CHOICES.map((choice) => (
                  <Button.Root
                    key={choice.value}
                    type="button"
                    appearance={
                      form.contactType === choice.value ? "solid" : "outline"
                    }
                    color={
                      form.contactType === choice.value ? "amber" : "neutral"
                    }
                    size="md"
                    noUppercase
                    fullWidth
                    onClick={() => form.setContactType(choice.value)}
                  >
                    <Button.Icon icon={choice.icon} />
                    <Button.Title>{choice.label}</Button.Title>
                  </Button.Root>
                ))}
              </div>
            </div>

            {!form.isClientFixed && (
              <Input.Select
                label="Cliente"
                required
                options={form.clientOptions}
                value={pick(form.clientOptions, form.selectedClientId)}
                variant="single"
                loading={form.clientsLoading}
                placeholder={
                  form.clientsLoading
                    ? "Carregando clientes…"
                    : "Selecionar cliente"
                }
                onChange={(val) =>
                  form.setSelectedClientId(single(val)?.value ?? null)
                }
              />
            )}

            <Input.Date
              label="Dia da visita"
              required
              variant="single"
              value={form.date}
              placeholder="Escolher o dia"
              hint="Pode ser hoje ou qualquer dia à frente."
              onChange={(value) =>
                form.setDate(value instanceof Date ? value : null)
              }
            />

            {form.needsSellerChoice && (
              <Input.Select
                label="Vendedor"
                required
                hint="Este cliente é atendido por mais de um vendedor."
                options={form.sellerOptions}
                value={pick(form.sellerOptions, form.selectedSellerId)}
                variant="single"
                placeholder="Selecionar vendedor"
                onChange={(val) =>
                  form.setSelectedSellerId(single(val)?.value ?? null)
                }
              />
            )}

            {form.factoryOptions.length > 2 && (
              <Input.Select
                label="Fábrica principal"
                hint="Serve para registrar o motivo da visita. As outras fábricas do cliente podem ser tratadas na mesma ida."
                options={form.factoryOptions}
                value={pick(form.factoryOptions, form.factoryId)}
                variant="single"
                disabledClear
                onChange={(val) =>
                  form.setFactoryId(single(val)?.value ?? AUTO_FACTORY)
                }
              />
            )}

            <Input.Textarea
              label="Observação"
              placeholder="O que o cliente pediu, o que levar…"
              value={form.notes}
              rows={3}
              onChange={(e) => form.setNotes(e.target.value)}
            />

            {form.dayFullMessage && (
              <Alert.Root variant="warning">
                <AlertTriangle size={14} className="mt-[1px] shrink-0" />
                <Alert.Content>
                  <Alert.Description>
                    {form.dayFullMessage} Você pode marcar mesmo assim ou
                    escolher outro dia.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
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
              disabled={form.isLoading}
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
            loading={form.isLoading}
            disabled={!form.isValid}
            onClick={() => form.submit(Boolean(form.dayFullMessage))}
          >
            <Button.Title>
              {form.dayFullMessage
                ? "Marcar mesmo assim"
                : isRemote
                  ? "Marcar contato"
                  : "Marcar visita"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
