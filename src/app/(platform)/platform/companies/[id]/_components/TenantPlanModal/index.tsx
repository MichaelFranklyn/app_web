"use client";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { parseLocalDate, toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { ChangeEvent, useMemo, useState } from "react";
import { PlanSummary } from "../../../../_components/PlanSummary";
import { usePlanCatalog } from "../../../../usePlanCatalog";
import { describePlanChange } from "../../../../utils";
import { PLAN_OPTIONS } from "../../../utils";
import { UPDATE_TENANT_PLAN_MUTATION } from "../../gql";
import { TenantDetail, UpdateTenantPlanData } from "../../interface";
import { PlanChangeNotice } from "./PlanChangeNotice";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantDetail;
  onDone: () => void;
}

/** Campo vazio na tela significa "sem teto" — que no protocolo da mutation é
 * `null` EXPLÍCITO, não omissão. Ver `UpdateTenantPlanInput` no SDL. */
const emptyToNull = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

export function TenantPlanModal({ open, onOpenChange, tenant, onDone }: Props) {
  const [plan, setPlan] = useState(tenant.plan);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(
    parseLocalDate(tenant.trialEndsAt)
  );
  const [maxUsers, setMaxUsers] = useState(tenant.maxUsers?.toString() ?? "");
  const [maxSellers, setMaxSellers] = useState(
    tenant.maxSellers?.toString() ?? ""
  );

  const { findPlan } = usePlanCatalog();
  // O catálogo é a MESMA matriz que o backend aplica — o console não mantém
  // cópia, senão prometeria o que o sistema recusa.
  const currentPlan = findPlan(tenant.plan);
  const selectedPlan = findPlan(plan);
  const change = useMemo(
    () => describePlanChange(currentPlan, selectedPlan),
    [currentPlan, selectedPlan]
  );

  /** O teto que o PLANO dá, para o campo dizer o que está sendo sobrescrito. */
  const planLimit = (key: "USERS" | "SELLERS"): string => {
    const limit = selectedPlan?.limits.find((l) => l.key === key);
    if (!limit) return "";
    return limit.limit === null ? "Plano: sem limite" : `Plano: ${limit.limit}`;
  };

  const [mutate] = useMutation<UpdateTenantPlanData>(
    UPDATE_TENANT_PLAN_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSave = async () => {
    await execute(
      async () => {
        const { data } = await mutate({
          variables: {
            companyId: tenant.id,
            // Os quatro campos vão sempre: o formulário mostra o estado
            // inteiro, então tudo que está na tela é intenção — inclusive os
            // campos que a pessoa esvaziou para remover o limite.
            input: {
              plan,
              trialEndsAt: trialEndsAt ? toIsoDate(trialEndsAt) : null,
              maxUsers: emptyToNull(maxUsers),
              maxSellers: emptyToNull(maxSellers),
            },
          },
        });
        const response = data?.updateTenantPlan;
        if (!response?.status)
          throw new Error(response?.message ?? "Falha ao salvar.");
        return response.data;
      },
      {
        successMessage: "Plano atualizado.",
        onSuccess() {
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Plano e limites"
          description="Governança da relação comercial. O cadastro da empresa é editado por ela mesma."
        />

        <Modal.Body className="flex flex-col gap-12">
          <Input.Select
            label="Plano"
            variant="single"
            options={PLAN_OPTIONS}
            value={PLAN_OPTIONS.find((o) => o.value === plan) ?? null}
            disabled={isLoading}
            disabledClear
            onChange={(option) => {
              const selected = option as SelectOption | null;
              if (selected) setPlan(String(selected.value));
            }}
          />

          {/* O que o plano escolhido entrega — a resposta que faltava para
              "basic" e "pro" significarem alguma coisa nesta tela. */}
          {selectedPlan && <PlanSummary plan={selectedPlan} showMissing />}

          <PlanChangeNotice change={change} />

          <Input.Date
            label="Fim do teste"
            hint="Em branco = sem prazo. Passada a data, o login é recusado."
            value={trialEndsAt}
            disabled={isLoading}
            onChange={(d: unknown) =>
              setTrialEndsAt(d instanceof Date ? d : null)
            }
          />

          <div className="grid grid-cols-2 gap-8">
            <Input.Number
              label="Máximo de pessoas"
              // Vazio = vale o teto do plano; preenchido = override do contrato.
              // Sem o número do plano ao lado, o SU não sabe o que está trocando.
              hint={`Hoje: ${tenant.usersCount} · ${planLimit("USERS")}`}
              value={maxUsers}
              placeholder="Sem limite"
              min={1}
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMaxUsers(e.target.value)
              }
            />
            <Input.Number
              label="Máximo de vendedores"
              hint={`Hoje: ${tenant.sellersCount} · ${planLimit("SELLERS")}`}
              value={maxSellers}
              placeholder="Sem limite"
              min={1}
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMaxSellers(e.target.value)
              }
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="ghost" disabled={isLoading}>
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            appearance="solid"
            color="amber"
            onClick={handleSave}
            loading={isLoading}
          >
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
