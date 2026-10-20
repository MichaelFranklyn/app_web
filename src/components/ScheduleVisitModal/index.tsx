"use client";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";

import { AgreementFields } from "./AgreementFields";
import { ContactTypeChoice } from "./ContactTypeChoice";
import { ScheduleVisitModalProps } from "./interface";
import { AUTO_FACTORY, useScheduleVisit } from "./useScheduleVisit";

const pick = (options: SelectOption[], value: string | null) =>
  options.find((o) => o.value === value) ?? null;

const single = (val: SelectOption | SelectOption[] | null) =>
  Array.isArray(val) ? (val[0] ?? null) : val;

/**
 * Marcar uma parada na agenda — visita ou ligação — com o combinado.
 *
 * É o único "marcar" do sistema (19/10/2026: visita e ligação são a mesma
 * parada com tipos diferentes), aberto da agenda, da ficha do cliente, do
 * pedido, das pendências e das oportunidades. Mora em `components/` por isso.
 *
 * A ordem dos campos é a de quem decide: de quem é a agenda (o gestor
 * escolhe; ela recorta os clientes), o cliente, o dia, e o combinado.
 */
export function ScheduleVisitModal(props: ScheduleVisitModalProps) {
  const {
    open,
    onOpenChange,
    clientName,
    contactType,
    orderLabel,
    returnLabel,
  } = props;
  const form = useScheduleVisit(props);
  const isRemote = form.contactType === "REMOTE";
  const noun = isRemote ? "ligação" : "visita";
  const subject = [clientName, orderLabel ? `pedido de ${orderLabel}` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header
          title={isRemote ? "Marcar ligação" : "Marcar visita"}
          description={
            (subject
              ? `Quando falar com ${subject}, e por quê.`
              : "Escolha o cliente e o dia. A agenda da semana é criada se ainda não existir.") +
            // Veio de um "volte dia X": dizer que esta parada resolve aquele.
            (returnLabel
              ? ` Ela atende o retorno combinado para ${returnLabel}.`
              : "")
          }
        />
        <Modal.Body>
          <div className="grid grid-cols-12 gap-12">
            {!contactType && !form.agenda.callsOnly && (
              <div className="col-span-12">
                <ContactTypeChoice
                  value={form.contactType}
                  onChange={form.setContactType}
                />
              </div>
            )}

            {form.agenda.canChoose && (
              <div className="col-span-12">
                <Input.Select
                  label="Agenda de quem"
                  required
                  hint="Escolha primeiro: os clientes da lista são os da carteira de quem vende. Quem não vende só recebe ligação."
                  options={form.agenda.options}
                  value={pick(
                    form.agenda.options,
                    form.agenda.owner?.id ?? null
                  )}
                  variant="single"
                  loading={form.agenda.loading}
                  placeholder="Escolher a pessoa"
                  onChange={(val) => form.pickOwner(single(val)?.value ?? null)}
                />
              </div>
            )}

            {!form.isClientFixed && (
              <div className="col-span-12">
                <Input.Select
                  label="Cliente"
                  required
                  options={form.clientOptions}
                  value={pick(form.clientOptions, form.selectedClientId)}
                  variant="single"
                  loading={form.clientsLoading}
                  onSearch={form.onSearchClients}
                  disabled={!form.agenda.owner}
                  placeholder={
                    form.agenda.owner
                      ? "Ex: digite o nome do cliente"
                      : "Escolha de quem é a agenda primeiro"
                  }
                  onChange={(val) =>
                    form.setSelectedClientId(single(val)?.value ?? null)
                  }
                />
              </div>
            )}

            <div
              className={
                orderLabel ? "col-span-12" : "desktop:col-span-6 col-span-12"
              }
            >
              <Input.Date
                label={`Dia da ${noun}`}
                required
                variant="single"
                value={form.date}
                placeholder="Escolher o dia"
                hint="Pode ser hoje ou qualquer dia à frente."
                onChange={(value) =>
                  form.setDate(value instanceof Date ? value : null)
                }
              />
            </div>

            {!orderLabel && (
              <div className="desktop:col-span-6 col-span-12">
                <Input.Select
                  label="Pedido relacionado"
                  hint="Os 20 pedidos mais recentes deste cliente."
                  options={form.orderOptions}
                  value={pick(form.orderOptions, form.orderId)}
                  variant="single"
                  disabled={!form.selectedClientId}
                  placeholder={
                    !form.selectedClientId
                      ? "Escolha o cliente primeiro"
                      : form.orderOptions.length === 0
                        ? "Nenhum pedido recente"
                        : "Escolha o pedido, se houver"
                  }
                  onChange={(val) =>
                    form.setOrderId(single(val)?.value ?? null)
                  }
                />
              </div>
            )}

            {!isRemote && form.factoryOptions.length > 2 && (
              <div className="col-span-12">
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
              </div>
            )}

            <div className="col-span-12 flex flex-col gap-12">
              <AgreementFields
                reason={form.reason}
                onReason={form.setReason}
                notes={form.notes}
                onNotes={form.setNotes}
              />
            </div>
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
            onClick={() => form.submit()}
          >
            <Button.Title>
              {isRemote ? "Marcar ligação" : "Marcar visita"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
