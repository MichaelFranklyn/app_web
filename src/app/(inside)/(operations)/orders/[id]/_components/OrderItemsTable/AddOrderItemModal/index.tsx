"use client";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { Plus } from "lucide-react";

import { AddOrderItemModalProps, useAddOrderItem } from "./useAddOrderItem";

export function AddOrderItemModal(props: AddOrderItemModalProps) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    handleSubmit,
    isLoading,
    noPriceList,
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
          description="O preço por embalagem é puxado automaticamente da tabela de preço ativa da fábrica."
        />

        <Modal.Body>
          {noPriceList ? (
            <Title variant="body-sm" color="muted">
              Esta fábrica não possui uma tabela de preço ativa. Cadastre uma
              tabela ativa para adicionar itens ao pedido.
            </Title>
          ) : (
            <FormBuilder
              ref={formRef}
              steps={steps}
              onSubmit={handleSubmit}
              loading={isLoading}
              unstyled
            />
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
            disabled={noPriceList}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
