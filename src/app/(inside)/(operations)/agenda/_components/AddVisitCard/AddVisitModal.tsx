"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";

import { Car, Phone } from "lucide-react";
import { CONTACT_TYPE_LABEL, contactNoun } from "@/utils/visit";
import { VisitContactType } from "../../interface";
import { AddVisitModalProps } from "./interface";
import { useAddVisit } from "./useAddVisit";

const CONTACT_TYPE_CHOICES: {
  value: VisitContactType;
  label: string;
  icon: typeof Car;
}[] = [
  { value: "IN_PERSON", label: CONTACT_TYPE_LABEL.IN_PERSON, icon: Car },
  { value: "REMOTE", label: CONTACT_TYPE_LABEL.REMOTE, icon: Phone },
];

export function AddVisitModal({
  open,
  onOpenChange,
  day,
  date,
  scheduleId,
  sellerId,
  capacity,
  onDone,
}: AddVisitModalProps) {
  const {
    options,
    optionsLoading,
    selectedLinkId,
    setSelectedLinkId,
    contactType,
    setContactType,
    isContactTypeEnabled,
    isDayWithoutRoute,
    isLoading,
    handlePrimary,
  } = useAddVisit({
    open,
    onOpenChange,
    day,
    date,
    scheduleId,
    sellerId,
    capacity,
    onDone,
  });

  const selectValue = options.find((o) => o.value === selectedLinkId) ?? null;

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={`Adicionar ${contactNoun(contactType)}`}
          description={
            isDayWithoutRoute
              ? "Este dia ainda não tem rota. Escolha o cliente para começar a trabalhar nele."
              : "Escolha o cliente para agendar neste dia."
          }
        />
        <Modal.Body>
          <div className="flex flex-col gap-12">
            {/* Só oferece a escolha quando o vendedor tem contato remoto ligado
                na configuração — senão a pergunta não tem resposta possível. */}
            {isContactTypeEnabled && (
              <div className="flex flex-col gap-6">
                <Title variant="label" color="muted">
                  O que você vai fazer?
                </Title>
                <div className="flex gap-8">
                  {CONTACT_TYPE_CHOICES.map((choice) => (
                    <Button.Root
                      key={choice.value}
                      type="button"
                      appearance={
                        contactType === choice.value ? "solid" : "outline"
                      }
                      color={contactType === choice.value ? "amber" : "neutral"}
                      size="md"
                      noUppercase
                      fullWidth
                      onClick={() => setContactType(choice.value)}
                    >
                      <Button.Icon icon={choice.icon} />
                      <Button.Title>{choice.label}</Button.Title>
                    </Button.Root>
                  ))}
                </div>
              </div>
            )}

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
              {`Adicionar ${contactNoun(contactType)}`}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
