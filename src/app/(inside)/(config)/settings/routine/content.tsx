"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
import { Info, Save, Settings, Users } from "lucide-react";

import { RoutineSkeleton } from "./_components/RoutineSkeleton";
import { SchedulingPreferencesCard } from "../_components/SchedulingPreferencesCard";
import { WorkingParametersCard } from "../_components/WorkingParametersCard";
import { RoutineConfigSeller } from "../interface";
import { useRoutineSettings } from "./useRoutineSettings";

function RoutineActionBar({
  sellerName,
  sellers,
  selectedSellerId,
  onSelectSeller,
  isNewConfig,
  canSave,
  isSaving,
  onSave,
}: {
  sellerName: string | null;
  sellers: RoutineConfigSeller[] | undefined;
  selectedSellerId: string | null;
  onSelectSeller: (id: string) => void;
  isNewConfig: boolean;
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  const sellerOptions: SelectOption[] = (sellers ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const sellerValue =
    sellerOptions.find((o) => o.value === selectedSellerId) ?? null;

  return (
    <div className="desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-16 flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <Title variant="heading-sm">
          Configuração de rotina{sellerName ? ` · ${sellerName}` : ""}
        </Title>
        <Title variant="body" color="muted">
          Parâmetros de geração automática de rotina de visitas.
        </Title>
        {sellers && (
          <div className="desktop:w-[240px] w-full">
            <Input.Select
              size="sm"
              options={sellerOptions}
              value={sellerValue}
              variant="single"
              disabledClear
              placeholder="Selecionar vendedor"
              onChange={(val: SelectOption | SelectOption[] | null) => {
                const opt = Array.isArray(val) ? val[0] : val;
                if (opt) onSelectSeller(opt.value);
              }}
            />
          </div>
        )}
      </div>
      <Button.Root
        appearance="solid"
        color="amber"
        size="sm"
        className="desktop:w-auto w-full"
        disabled={!canSave || isSaving}
        loading={isSaving}
        onClick={onSave}
      >
        <Button.Icon icon={Save} />
        <Button.Title>
          {isNewConfig ? "Criar configuração" : "Salvar configurações"}
        </Button.Title>
      </Button.Root>
    </div>
  );
}

export default function RoutineSettingsContent() {
  const {
    canSelectSeller,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    selectedSellerName,
    form,
    isNewConfig,
    loading,
    hasNoSellers,
    isDirty,
    isLoading,
    handlePatch,
    handleSave,
  } = useRoutineSettings();

  if (loading && !form) {
    return <RoutineSkeleton />;
  }

  if (hasNoSellers) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Users />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhum vendedor cadastrado</EmptyState.Title>
        <EmptyState.Description>
          Cadastre um vendedor primeiro para configurar a geração automática de
          rotina.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  if (!form) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Settings />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhuma configuração de rotina</EmptyState.Title>
        <EmptyState.Description>
          Ainda não há uma configuração de geração automática. Cadastre um
          vendedor primeiro para iniciar a configuração da rotina.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <div className="flex flex-col gap-20">
      <RoutineActionBar
        sellerName={selectedSellerName}
        sellers={canSelectSeller ? sellers : undefined}
        selectedSellerId={selectedSellerId}
        onSelectSeller={setSelectedSellerId}
        isNewConfig={isNewConfig}
        canSave={isDirty}
        isSaving={isLoading}
        onSave={handleSave}
      />

      <Alert.Root variant="info">
        <Alert.Icon icon={Info} />
        <Alert.Content>
          <Alert.Title>
            {isNewConfig
              ? "Este vendedor ainda não tem configuração"
              : "Alterações aplicadas na próxima geração"}
          </Alert.Title>
          <Alert.Description>
            {isNewConfig
              ? "Revise os parâmetros padrão abaixo e clique em Criar configuração para ativar a geração automática de rotina deste vendedor."
              : "Modificações aqui afetam apenas rotinas geradas a partir de agora. Rotinas já confirmadas não são alteradas."}
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Grid.Root
        cols={{ base: 1, desktop: 2 }}
        gap={16}
        data-tour="routine-params"
      >
        <WorkingParametersCard form={form} onChange={handlePatch} />
        <SchedulingPreferencesCard form={form} onChange={handlePatch} />
      </Grid.Root>
    </div>
  );
}
