"use client";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

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
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
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

// Catálogos pequenos carregados por inteiro (ver useCompleteList).
const EMPTY_INPUT = {};
const getFactories = (d: CompanyFactoriesOptionsData) =>
  d.company_factories_options;
const getAccesses = (d: SellerAccessesData) => d.seller_accesses;

export function AddFactoryAccessModal({ sellerId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const { data: factoriesData, error: factoriesError } =
    useCompleteList<CompanyFactoriesOptionsData>(
      COMPANY_FACTORIES_OPTIONS_QUERY,
      EMPTY_INPUT,
      getFactories,
      { skip: !open }
    );

  const bySeller = useMemo(
    () => ({
      filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
    }),
    [sellerId]
  );

  const { data: accessesData, error: accessesError } =
    useCompleteList<SellerAccessesData>(
      SELLER_ACCESSES_QUERY,
      bySeller,
      getAccesses,
      { skip: !open }
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

  useQueryErrorToast(
    factoriesError ?? accessesError,
    "Não foi possível carregar as opções. Tente novamente."
  );

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
