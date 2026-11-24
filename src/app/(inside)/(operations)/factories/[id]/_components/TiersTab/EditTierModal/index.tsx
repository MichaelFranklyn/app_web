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
import { useState } from "react";
import { UPDATE_PRICE_TIER_MUTATION } from "../gql";
import { TierForm } from "../TierForm";
import {
  PriceTier,
  TierFormValues,
  baseTierOptions,
  dependentsOf,
  pricingUpdateInput,
  signedAdjustment,
  tierToForm,
  validateTierForm,
} from "../utils";

interface UpdateTierResponse {
  updatePriceTier: {
    __typename?: "PriceTierTypeDataResponse";
    status: boolean;
    message: string;
    data: ({ __typename?: "PriceTierType" } & PriceTier) | null;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: PriceTier;
  /** Os níveis da fábrica: base possível e quem é calculado sobre este. */
  tiers: PriceTier[];
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<PriceTier>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

/** O que a linha mostra já, antes da resposta do servidor. */
const optimisticUpdates = (
  values: TierFormValues,
  tiers: PriceTier[]
): Partial<PriceTier> => {
  const name = values.name.trim();
  if (values.kind === "own") {
    return { name, baseTierId: null, adjustmentPercent: null, baseTier: null };
  }
  const base = tiers.find((t) => t.id === values.baseTierId);
  return {
    name,
    baseTierId: values.baseTierId,
    adjustmentPercent: String(signedAdjustment(values)),
    baseTier: base ? { id: base.id, name: base.name } : null,
  };
};

export function EditTierModal({
  tier,
  tiers,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  open,
  onOpenChange,
}: Props) {
  const [values, setValues] = useState<TierFormValues>(() => tierToForm(tier));
  const [submitted, setSubmitted] = useState(false);
  // Cada abertura parte do nível como ele está agora (ajuste no render, não
  // em efeito: sem um quadro com o valor velho).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(tierToForm(tier));
      setSubmitted(false);
    }
  }

  const errors = validateTierForm(values);
  const [updateTier] = useMutation<UpdateTierResponse>(
    UPDATE_PRICE_TIER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const handleSubmit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const name = values.name.trim();
    const input = {
      ...(name !== tier.name ? { name } : {}),
      ...pricingUpdateInput(values, tier),
    };
    onOpenChange(false);
    if (Object.keys(input).length === 0) return;

    onUpdateOptimistic(tier.id, optimisticUpdates(values, tiers));

    await execute(
      async () => {
        const res = await updateTier({ variables: { id: tier.id, input } });
        if (
          !res.data?.updatePriceTier?.status ||
          !res.data.updatePriceTier.data
        ) {
          throw new Error(
            res.data?.updatePriceTier?.message ?? "Erro ao atualizar nível"
          );
        }
        return res.data.updatePriceTier.data;
      },
      {
        successMessage: "Nível atualizado com sucesso",
        onSuccess: () => {
          onCommit();
          onChanged();
          // O nível é escolhido nos preços, no item de pedido e no vínculo; o
          // calculado tem os preços refeitos.
          void invalidateClient([
            ...PRICE_TIER_CACHE_FIELDS,
            // O calculado ganha (ou refaz) preços nas tabelas.
            ...PRICE_ITEM_CACHE_FIELDS,
          ]);
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
          title="Editar nível"
          description={`Nome e preço do nível comercial "${tier.name}".`}
        />
        <Modal.Body>
          <TierForm
            values={values}
            onChange={setValues}
            errors={submitted ? errors : {}}
            baseOptions={baseTierOptions(tiers, tier.id)}
            dependents={dependentsOf(tiers, tier.id)}
            leavingPercent={!!tier.baseTierId}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
