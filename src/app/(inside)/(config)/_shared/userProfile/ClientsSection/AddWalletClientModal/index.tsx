"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { buildTakeoverMessage } from "@/hooks/useClientFactoryAssignment";
import { Plus, TriangleAlert } from "lucide-react";

import { AddWalletClientProps, useAddWalletClient } from "./useAddWalletClient";

export function AddWalletClientModal(props: AddWalletClientProps) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    handleSubmit,
    isLoading,
    isTakeover,
    canTransfer,
    currentSellerName,
    confirmOpen,
    closeConfirm,
    confirmTransfer,
  } = useAddWalletClient(props);

  const blocked = isTakeover && !canTransfer;

  return (
    <>
      <Modal.Root open={open} onOpenChange={handleClose}>
        <Modal.Trigger asChild>
          <Button.Root appearance="solid" color="amber" size="sm">
            <Button.Icon icon={Plus} />
            <Button.Title>Adicionar cliente</Button.Title>
          </Button.Root>
        </Modal.Trigger>

        <Modal.Content size="md">
          <Modal.Header
            title="Adicionar cliente à carteira"
            description="Escolha a fábrica (com acesso do vendedor), o cliente e o nível comercial."
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
                        : "Ao salvar, você transfere o atendimento. Vamos pedir sua confirmação antes."}
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <FormBuilder
                ref={formRef}
                steps={steps}
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
                {isTakeover ? "Transferir vínculo" : "Adicionar"}
              </Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={(v) => !v && closeConfirm()}
        title="Transferir o atendimento deste cliente?"
        description={buildTakeoverMessage(currentSellerName, null)}
        confirmLabel="Transferir"
        confirmColor="amber"
        onConfirm={confirmTransfer}
        successMessage="Atendimento transferido para o novo vendedor"
      />
    </>
  );
}
