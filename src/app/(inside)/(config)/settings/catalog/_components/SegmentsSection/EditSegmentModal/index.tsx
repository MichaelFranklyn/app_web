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

import { UPDATE_CLIENT_SEGMENT_MUTATION } from "../../../gql";
import { SegmentNode, UpdateClientSegmentResponse } from "../interface";

interface Props {
  segment: SegmentNode;
  onUpdateOptimistic: (id: string, updates: Partial<SegmentNode>) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}

export function EditSegmentModal({
  segment,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  onDone,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateSegment] = useMutation<UpdateClientSegmentResponse>(
    UPDATE_CLIENT_SEGMENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "segment",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Segmento",
                required: true,
                placeholder: "Ex: Farmácia, Mercearia, Atacado",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(() => ({ name: segment.name }), [segment]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    if (!name || name === segment.name) {
      setOpen(false);
      return;
    }
    setOpen(false);
    onUpdateOptimistic(segment.id, { name });

    await execute(
      async () => {
        const res = await updateSegment({
          variables: { id: segment.id, input: { name } },
        });
        if (!res.data?.updateClientSegment?.status) {
          throw new Error(
            res.data?.updateClientSegment?.message ??
              "Erro ao atualizar segmento"
          );
        }
        return res.data.updateClientSegment;
      },
      {
        successMessage: "Segmento atualizado",
        onSuccess: () => {
          onCommit();
          onDone();
        },
        onError: onRollback,
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          isIconOnly
          label="Editar segmento"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar segmento"
          description={`Altere o segmento "${segment.name}".`}
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
