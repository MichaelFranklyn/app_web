"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { UPDATE_PRODUCT_UNIT_MUTATION } from "../../../gql";
import { EditUnitModalProps, UpdateProductUnitResponse } from "./interface";

export function EditUnitModal({
  unit,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  onDone,
}: EditUnitModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateUnit] = useMutation<UpdateProductUnitResponse>(
    UPDATE_PRODUCT_UNIT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "unit",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "label",
                type: "text",
                label: "Nome",
                required: true,
                placeholder: "Ex: Saco, Metro, Quilograma",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(() => ({ label: unit.label }), [unit]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const label = String(data.label ?? "").trim();
    if (!label || label === unit.label) {
      setOpen(false);
      return;
    }
    setOpen(false);
    onUpdateOptimistic(unit.id, { label });

    await execute(
      async () => {
        const res = await updateUnit({
          variables: { id: unit.id, input: { label } },
        });
        if (!res.data?.updateProductUnit?.status) {
          throw new Error(
            res.data?.updateProductUnit?.message ?? "Erro ao atualizar unidade"
          );
        }
        return res.data.updateProductUnit;
      },
      {
        successMessage: "Unidade atualizada",
        onSuccess: () => {
          onCommit();
          onDone();
        },
        onError: () => onRollback(),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="sm" isIconOnly>
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header
          title="Editar unidade"
          description={`Altere o nome de "${unit.label}".`}
        />
        <Modal.Body>
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
