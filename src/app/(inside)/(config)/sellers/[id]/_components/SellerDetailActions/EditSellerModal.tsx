"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";

import { UPDATE_SELLER_MUTATION } from "../../../gql";
import { FORM_STEPS, normalizeInput } from "../../../utils";
import { SellerDetail } from "../../interface";

interface SellerMutationResponse {
  updateSeller: {
    status: boolean;
    message: string;
  } | null;
}

interface Props {
  seller: SellerDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

export function EditSellerModal({ seller, open, onOpenChange, onDone }: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateSeller] = useMutation<SellerMutationResponse>(
    UPDATE_SELLER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleEdit = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data);
    await execute(
      async () => {
        const res = await updateSeller({ variables: { id: seller.id, input } });
        if (!res.data?.updateSeller?.status) {
          throw new Error(
            res.data?.updateSeller?.message ?? "Erro ao atualizar"
          );
        }
        return res.data.updateSeller;
      },
      {
        successMessage: "Vendedor atualizado com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          formRef.current?.resetForm();
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Editar vendedor"
          description="Atualize os dados do vendedor abaixo."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            onSubmit={handleEdit}
            initialData={{
              name: seller.name,
              phone: seller.phone,
              region: seller.region,
              homeCep: seller.homeCep,
              homeStreet: seller.homeStreet,
              homeNumber: seller.homeNumber,
              homeComplement: seller.homeComplement,
              homeNeighborhood: seller.homeNeighborhood,
              homeCity: seller.homeCity,
              homeState: seller.homeState,
            }}
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
            <Button.Title>Salvar alterações</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
