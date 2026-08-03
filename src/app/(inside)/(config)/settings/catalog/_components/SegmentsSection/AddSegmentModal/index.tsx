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

import { CREATE_CLIENT_SEGMENT_MUTATION } from "../../../gql";
import { CreateClientSegmentResponse, SegmentNode } from "../interface";

interface Props {
  onAddOptimistic: (segment: SegmentNode) => void;
  onDone: () => void;
}

export function AddSegmentModal({ onAddOptimistic, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createSegment] = useMutation<CreateClientSegmentResponse>(
    CREATE_CLIENT_SEGMENT_MUTATION
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
                hint: "O ramo de atividade do cliente. Serve para filtrar a carteira e comparar os números por tipo de negócio.",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    await execute(
      async () => {
        const res = await createSegment({ variables: { input: { name } } });
        if (!res.data?.createClientSegment?.status) {
          throw new Error(
            res.data?.createClientSegment?.message ?? "Erro ao criar segmento"
          );
        }
        return res.data.createClientSegment;
      },
      {
        successMessage: "Segmento criado",
        onSuccess: () => {
          handleClose(false);
          // Id provisório: a lista real chega no refetch de `onDone`.
          onAddOptimistic({ id: `temp-${name}`, name });
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo segmento</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo segmento"
          description="Cadastre o ramo de atividade dos seus clientes."
        />
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
            <Button.Title>Criar segmento</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
