"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { Seller } from "../interface";
import { UPDATE_SELLER_MUTATION } from "./gql";
import { FORM_STEPS, UpdateSellerInput, normalizeInput } from "./utils";

interface UpdateSellerResult {
  id: string;
  name: string;
  phone: string;
  region: string;
  isActive: boolean;
}

interface UpdateSellerResponse {
  updateSeller: {
    status: boolean;
    message: string;
    data: UpdateSellerResult | null;
  };
}

interface UpdateSellerModalProps {
  seller: Seller;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate: (data: Partial<Seller>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function UpdateSellerModal({
  seller,
  open,
  onOpenChange,
  onUpdate,
  onCommit,
  onRollback,
}: UpdateSellerModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const [updateSeller] = useMutation<UpdateSellerResponse>(UPDATE_SELLER_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input: UpdateSellerInput = normalizeInput(data);

    onUpdate(input);

    await execute(
      async () => {
        const res = await updateSeller({ variables: { id: seller.id, input } });

        if (!res.data?.updateSeller?.status || !res.data.updateSeller.data) {
          throw new Error(res.data?.updateSeller?.message ?? "Erro ao atualizar vendedor");
        }

        return res.data.updateSeller.data;
      },
      {
        successMessage: "Vendedor atualizado com sucesso",
        onSuccess: async () => {
          onCommit();
          onOpenChange(false);
          await invalidateClient(["sellers_list"]);
        },
        onError: () => {
          onRollback();
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
            onSubmit={handleSubmit}
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
