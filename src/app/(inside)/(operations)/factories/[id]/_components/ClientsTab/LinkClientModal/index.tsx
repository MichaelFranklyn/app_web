"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { buildTakeoverMessage } from "@/hooks/useClientFactoryAssignment";
import { Plus, TriangleAlert } from "lucide-react";

import { LinkClientModalProps, useLinkClient } from "./useLinkClient";

export function LinkClientModal(props: LinkClientModalProps) {
  const {
    open,
    setOpen,
    formRef,
    formSteps,
    handleSubmit,
    isLoading,
    isTakeover,
    canTransfer,
    currentSellerName,
    newSellerName,
    confirmOpen,
    closeConfirm,
    confirmTransfer,
    initialData,
  } = useLinkClient(props);

  const blocked = isTakeover && !canTransfer;

  return (
    <>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Trigger asChild>
          <Button.Root appearance="solid" color="amber" size="sm" noUppercase>
            <Button.Icon icon={Plus} />
            <Button.Title>Vincular cliente</Button.Title>
          </Button.Root>
        </Modal.Trigger>

        <Modal.Content size="md">
          <Modal.Header
            title="Vincular cliente à fábrica"
            description="Conecta um cliente da sua carteira a esta fábrica, por um vendedor com acesso e em um nível de preço."
          />

          <Modal.Body>
            <div className="flex flex-col gap-16">
              {/* Avisa ANTES de salvar: cada cliente tem um vendedor por fábrica,
                então continuar significa trocar quem atende. */}
              {isTakeover && (
                <Alert.Root variant={blocked ? "error" : "warning"}>
                  <Alert.Icon icon={TriangleAlert} />
                  <Alert.Content>
                    <Alert.Title>
                      Este cliente já é atendido por{" "}
                      {currentSellerName ?? "outro vendedor"} nesta fábrica
                    </Alert.Title>
                    <Alert.Description>
                      {blocked
                        ? "Peça a um gestor para transferir o atendimento."
                        : "Ao salvar, este formulário sai e pedimos sua confirmação antes de transferir."}
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <FormBuilder
                ref={formRef}
                // Volta preenchido quando o usuário cancela a confirmação: o
                // Modal desmonta o corpo ao fechar, então sem isto o formulário
                // reabriria em branco.
                initialData={initialData}
                steps={formSteps}
                onSubmit={handleSubmit}
                loading={isLoading}
                unstyled
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
              disabled={blocked}
              onClick={() => formRef.current?.submitForm()}
            >
              <Button.Title>
                {isTakeover ? "Transferir vínculo" : "Vincular cliente"}
              </Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={(v) => !v && closeConfirm()}
        title="Transferir o atendimento deste cliente?"
        description={buildTakeoverMessage(currentSellerName, newSellerName)}
        confirmLabel="Transferir"
        confirmColor="amber"
        onConfirm={confirmTransfer}
        successMessage="Atendimento transferido para o novo vendedor"
      />
    </>
  );
}
