"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DELETE_COMPANY_FACTORY_MUTATION } from "./gql";

interface DeleteCompanyFactoryResponse {
  deleteCompanyFactory: { status: boolean; message: string };
}

interface Props {
  companyFactoryId: string;
  factoryName: string;
}

export function DeleteCompanyFactoryModal({
  companyFactoryId,
  factoryName,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteCompanyFactory] = useMutation<DeleteCompanyFactoryResponse>(
    DELETE_COMPANY_FACTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteCompanyFactory({
          variables: { id: companyFactoryId },
        });

        if (!res.data?.deleteCompanyFactory?.status) {
          throw new Error(
            res.data?.deleteCompanyFactory?.message ??
              "Erro ao excluir vínculo da fábrica"
          );
        }

        return res.data.deleteCompanyFactory;
      },
      {
        successMessage: "Vínculo com a fábrica removido",
        onSuccess: async () => {
          setOpen(false);
          await invalidateClient(["companyFactories"]);
          router.push("/factories");
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Trash2} />
          <Button.Title>Excluir</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Excluir vínculo com a fábrica"
          description={`Tem certeza que deseja excluir o vínculo com a fábrica "${factoryName}"? Esta ação não pode ser desfeita.`}
        />

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
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Excluir vínculo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
