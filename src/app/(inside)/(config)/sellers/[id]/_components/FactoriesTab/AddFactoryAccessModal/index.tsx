"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { factoryName } from "@/utils/company";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  COMPANY_FACTORIES_OPTIONS_QUERY,
  CREATE_SELLER_FACTORY_ACCESS_MUTATION,
  CompanyFactoriesOptionsData,
  CreateAccessResponse,
  SELLER_ACCESSES_QUERY,
  SellerAccessesData,
} from "./gql";

interface Props {
  sellerId: string;
  /** Re-sincroniza a lista de acessos após o vínculo. */
  onAdded: () => void;
}

export function AddFactoryAccessModal({ sellerId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const { data: factoriesData } = useQuery<CompanyFactoriesOptionsData>(
    COMPANY_FACTORIES_OPTIONS_QUERY,
    { variables: { input: { first: 200 } }, skip: !open }
  );

  const { data: accessesData } = useQuery<SellerAccessesData>(
    SELLER_ACCESSES_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
        },
      },
      skip: !open,
    }
  );

  const linkedFactoryIds = useMemo(
    () =>
      new Set(
        (accessesData?.seller_accesses.edges ?? [])
          .filter(({ node }) => node.sellerId === sellerId)
          .map(({ node }) => node.factoryId)
      ),
    [accessesData, sellerId]
  );

  const factoryOptions = useMemo(
    () =>
      (factoriesData?.company_factories_options.edges ?? [])
        .filter(
          ({ node }) => node.factory && !linkedFactoryIds.has(node.factoryId)
        )
        .map(({ node }) => ({
          value: node.factoryId,
          label: factoryName(node.factory),
        })),
    [factoriesData, linkedFactoryIds]
  );

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                required: true,
                placeholder:
                  factoryOptions.length === 0
                    ? "Nenhuma fábrica disponível para vincular"
                    : "Selecione a fábrica",
                options: factoryOptions,
              },
            ],
          },
        ],
      },
    ],
    [factoryOptions]
  );

  const [createAccess] = useMutation<CreateAccessResponse>(
    CREATE_SELLER_FACTORY_ACCESS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const factoryId = extractSelectValue(data.factoryId);
    if (!factoryId) throw new Error("Selecione a fábrica.");

    await execute(
      async () => {
        const res = await createAccess({
          variables: { input: { sellerId, factoryId } },
        });
        if (!res.data?.createSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.createSellerFactoryAccess?.message ??
              "Erro ao conceder acesso"
          );
        }
        return res.data.createSellerFactoryAccess;
      },
      {
        successMessage: "Acesso concedido com sucesso",
        onSuccess: () => {
          onAdded();
          handleClose(false);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Adicionar fábrica</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Dar acesso a uma fábrica"
          description="O vendedor passa a poder trabalhar com os produtos desta fábrica."
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
            <Button.Title>Conceder acesso</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
