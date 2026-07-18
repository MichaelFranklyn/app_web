"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Plus, Zap } from "lucide-react";

import { AddOrderItemModalProps, useAddOrderItem } from "./useAddOrderItem";

export function AddOrderItemModal(props: AddOrderItemModalProps) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    handleSubmit,
    isLoading,
    isPromoSelected,
  } = useAddOrderItem(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Adicionar item</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Adicionar item ao pedido"
          description={
            props.ipiInOrder
              ? "Escolha o produto da fábrica. O preço da tabela ativa é sugerido ao selecionar um nível; informe a alíquota de IPI deste item quando houver."
              : "Escolha qualquer produto da fábrica. Ao selecionar um nível, o preço da tabela ativa é sugerido — e você pode ajustá-lo."
          }
        />

        <Modal.Body>
          {isPromoSelected && (
            <div className="mb-12 flex items-center gap-8 rounded-(--r-md) bg-(--orange-bg) px-12 py-8">
              <Badge.Root color="orange" appearance="tinted" size="xs">
                <Badge.Icon>
                  <Zap />
                </Badge.Icon>
                <Badge.Text>Promoção relâmpago</Badge.Text>
              </Badge.Root>
              <span className="text-[13px] text-(--orange)">
                Preço promocional aplicado a este produto.
              </span>
            </div>
          )}
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
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
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
