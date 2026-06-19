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
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CREATE_PRODUCT_UNIT_LABEL_MUTATION } from "../../gql";

interface Props {
  onDone: () => void;
}

export function AddLabelModal({ onDone }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createLabel] = useMutation<{
    createProductUnitLabel: { status: boolean; message: string };
  }>(CREATE_PRODUCT_UNIT_LABEL_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "label",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "label",
                type: "text",
                label: "Rótulo",
                required: true,
                placeholder: "Ex: Caixa, Pallet, Fardo",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await createLabel({
          variables: { input: { label: String(data.label ?? "").trim() } },
        });
        if (!res.data?.createProductUnitLabel?.status) {
          throw new Error(
            res.data?.createProductUnitLabel?.message ?? "Erro ao criar rótulo"
          );
        }
        return res.data.createProductUnitLabel;
      },
      {
        successMessage: "Rótulo criado",
        onSuccess: () => {
          setOpen(false);
          formRef.current?.resetForm();
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo rótulo</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header title="Novo rótulo" />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>
        <Modal.Footer>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Criar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
