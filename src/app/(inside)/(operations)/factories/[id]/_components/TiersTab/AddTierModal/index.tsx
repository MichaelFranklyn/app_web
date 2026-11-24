"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import {
  PRICE_ITEM_CACHE_FIELDS,
  PRICE_TIER_CACHE_FIELDS,
} from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CREATE_PRICE_TIER_MUTATION } from "../gql";
import { TierForm } from "../TierForm";
import {
  EMPTY_TIER_FORM,
  PriceTier,
  TierFormValues,
  baseTierOptions,
  pricingCreateInput,
  validateTierForm,
} from "../utils";

interface CreateTierResponse {
  createPriceTier: {
    __typename?: "PriceTierTypeDataResponse";
    status: boolean;
    message: string;
    data: ({ __typename?: "PriceTierType" } & PriceTier) | null;
  };
}

interface Props {
  companyFactoryId: string;
  onAdded: () => void;
  onAddOptimistic: (tier: PriceTier) => void;
  /** Os níveis da fábrica: de onde sai o nível de referência do percentual. */
  tiers: PriceTier[];
}

export function AddTierModal({
  companyFactoryId,
  onAdded,
  onAddOptimistic,
  tiers,
}: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<TierFormValues>(EMPTY_TIER_FORM);
  const [submitted, setSubmitted] = useState(false);
  const errors = validateTierForm(values);
  const [createTier] = useMutation<CreateTierResponse>(
    CREATE_PRICE_TIER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setValues(EMPTY_TIER_FORM);
      setSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    await execute(
      async () => {
        const res = await createTier({
          variables: {
            input: {
              companyFactoryId,
              name: values.name.trim(),
              ...pricingCreateInput(values),
            },
          },
        });
        if (
          !res.data?.createPriceTier?.status ||
          !res.data.createPriceTier.data
        ) {
          throw new Error(
            res.data?.createPriceTier?.message ??
              "Erro ao criar nível comercial"
          );
        }
        return res.data.createPriceTier.data;
      },
      {
        successMessage: "Nível comercial criado com sucesso",
        onSuccess: async (created) => {
          handleClose(false);
          onAddOptimistic(created);
          onAdded();
          // O nível é escolhido nos preços, no item de pedido e no vínculo.
          await invalidateClient([
            ...PRICE_TIER_CACHE_FIELDS,
            // O calculado ganha (ou refaz) preços nas tabelas.
            ...PRICE_ITEM_CACHE_FIELDS,
          ]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo nível</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo nível comercial"
          description="Uma classe de cliente com preço diferente — ex.: varejo, atacado, Gold, Diamante."
        />
        <Modal.Body>
          <TierForm
            values={values}
            onChange={setValues}
            errors={submitted ? errors : {}}
            baseOptions={baseTierOptions(tiers)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
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
            loading={isLoading}
            onClick={handleSubmit}
          >
            <Button.Title>Criar nível</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
