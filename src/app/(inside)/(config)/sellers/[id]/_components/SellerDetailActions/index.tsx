"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Pencil, Power } from "lucide-react";
import { useRef, useState } from "react";
import { UPDATE_SELLER_MUTATION } from "../../../_components/SellersTab/SellerListContent/UpdateSellerModal/gql";
import {
  FORM_STEPS,
  normalizeInput,
} from "../../../_components/SellersTab/SellerListContent/UpdateSellerModal/utils";
import { SellerDetail } from "../../interface";

const TOGGLE_SELLER_MUTATION = gql`
  mutation ToggleSellerDetail($id: UUID!, $input: UpdateSellerInput!) {
    updateSeller(id: $id, input: $input) {
      status
      message
    }
  }
`;

interface SellerMutationResponse {
  updateSeller: {
    status: boolean;
    message: string;
  } | null;
}

interface Props {
  seller: SellerDetail;
  onRefetch: () => void;
}

export function SellerDetailActions({ seller, onRefetch }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [updateSeller] = useMutation<SellerMutationResponse>(
    UPDATE_SELLER_MUTATION
  );
  const [toggleSeller] = useMutation<SellerMutationResponse>(
    TOGGLE_SELLER_MUTATION
  );

  const editAction = useAsyncAction();
  const toggleAction = useAsyncAction();

  const handleEdit = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data);
    await editAction.execute(
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
          setEditOpen(false);
          formRef.current?.resetForm();
          onRefetch();
        },
      }
    );
  };

  const handleToggle = async () => {
    await toggleAction.execute(
      async () => {
        const res = await toggleSeller({
          variables: { id: seller.id, input: { isActive: !seller.isActive } },
        });
        if (!res.data?.updateSeller?.status) {
          throw new Error(
            res.data?.updateSeller?.message ?? "Erro ao atualizar"
          );
        }
        return res.data.updateSeller;
      },
      {
        successMessage: seller.isActive
          ? "Vendedor desativado com sucesso"
          : "Vendedor ativado com sucesso",
        onSuccess: () => {
          setToggleOpen(false);
          onRefetch();
        },
      }
    );
  };

  return (
    <>
      <Button.Root
        appearance="outline"
        color={seller.isActive ? "red" : "green"}
        size="sm"
        onClick={() => setToggleOpen(true)}
      >
        <Button.Icon icon={Power} />
        <Button.Title>{seller.isActive ? "Desativar" : "Ativar"}</Button.Title>
      </Button.Root>

      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        onClick={() => setEditOpen(true)}
      >
        <Button.Icon icon={Pencil} />
        <Button.Title>Editar</Button.Title>
      </Button.Root>

      {/* Edit modal */}
      <Modal.Root open={editOpen} onOpenChange={setEditOpen}>
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
              loading={editAction.isLoading}
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
                disabled={editAction.isLoading}
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
              loading={editAction.isLoading}
              onClick={() => formRef.current?.submitForm()}
            >
              <Button.Title>Salvar alterações</Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Toggle modal */}
      <Modal.Root open={toggleOpen} onOpenChange={setToggleOpen}>
        <Modal.Content size="sm">
          <Modal.Header
            title={seller.isActive ? "Desativar vendedor" : "Ativar vendedor"}
            description={`Tem certeza que deseja ${seller.isActive ? "desativar" : "ativar"} o vendedor "${seller.name}"?`}
          />
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={toggleAction.isLoading}
              >
                <Button.Title>Cancelar</Button.Title>
              </Button.Root>
            </Modal.Close>
            <Button.Root
              type="button"
              appearance="solid"
              color={seller.isActive ? "red" : "green"}
              size="md"
              noUppercase
              loading={toggleAction.isLoading}
              onClick={handleToggle}
            >
              <Button.Title>
                {seller.isActive ? "Desativar" : "Ativar"}
              </Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
