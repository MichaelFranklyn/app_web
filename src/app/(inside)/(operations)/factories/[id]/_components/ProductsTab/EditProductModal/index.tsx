"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { AlertCircle } from "lucide-react";
import { useRef } from "react";

import { EditProductModalProps, useEditProduct } from "./useEditProduct";

export function EditProductModal(props: EditProductModalProps) {
  const { product, open, onOpenChange } = props;
  const formRef = useRef<FormBuilderRef>(null);
  const { steps, initialData, handleSubmit, isLoading, attentionReasons } =
    useEditProduct(props);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Editar produto"
          description={`Altere os dados de "${product.name}".`}
        />
        <Modal.Body>
          {product.isNeedsAttention && (
            <Alert.Root variant="warning" className="mb-8">
              <Alert.Icon icon={AlertCircle} />
              <Alert.Content>
                <Alert.Description>
                  Importado com aviso:{" "}
                  {attentionReasons.length > 0
                    ? attentionReasons.join(", ")
                    : "revise os dados"}
                  . Salvar as alterações remove a marcação.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
