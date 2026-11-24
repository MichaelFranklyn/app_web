"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ChoiceCardGroup, ChoiceCardOption } from "@/components/ChoiceCard";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";
import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { Info, Layers } from "lucide-react";

import { ClientGroupBy } from "./gql";
import { BulkMode, CRITERIA } from "./scope";
import { SetTierInBulkModalProps, useSetTierInBulk } from "./useSetTierInBulk";

const BY_OPTIONS: ToggleOption<ClientGroupBy>[] = (
  ["CITY", "SEGMENT", "NETWORK"] as const
).map((value) => ({ value, label: CRITERIA[value].label }));

/**
 * Nível de preço em massa por um critério do cliente — cidade (capital ×
 * interior), segmento (Distribuidor/Atacado/Varejo) ou rede. A aba pagina de
 * 10 em 10; marcar linha a linha seria um castigo, então a escolha é por grupo,
 * com o escopo dito antes de salvar.
 */
export function SetTierInBulkModal(props: SetTierInBulkModalProps) {
  const m = useSetTierInBulk(props);
  const tierName = m.tier?.label ?? "escolhido";
  const criterion = CRITERIA[m.by];
  const modeOptions: ChoiceCardOption<BulkMode>[] = [
    { value: "only", label: criterion.only, hint: criterion.onlyHint },
    { value: "except", label: criterion.except, hint: criterion.exceptHint },
  ];

  return (
    <Modal.Root open={m.open} onOpenChange={m.setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          data-tour="factory-clients-bulk-tier"
        >
          <Button.Icon icon={Layers} />
          <Button.Title>Nível em massa</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Definir nível de preço em massa"
          description="Diga qual nível vale para um grupo de clientes: por cidade, por segmento (canal) ou por rede."
        />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            <ToggleGroup
              aria-label="Agrupar clientes por"
              options={BY_OPTIONS}
              value={m.by}
              onChange={m.setBy}
              fullWidth
            />

            {m.groupsError ? (
              <QueryError
                flat
                onRetry={() => m.refetchGroups()}
                retrying={m.groupsLoading}
              />
            ) : (
              <>
                <ChoiceCardGroup
                  aria-label="Quais clientes mudam"
                  options={modeOptions}
                  value={m.mode}
                  onChange={m.setMode}
                />

                <Input.Select
                  variant="multi"
                  label={criterion.field}
                  required
                  placeholder={
                    m.groupsLoading ? criterion.loading : criterion.placeholder
                  }
                  loading={m.groupsLoading}
                  options={m.groupOptions}
                  value={m.selected}
                  onChange={(v) =>
                    m.setSelected(Array.isArray(v) ? v : v ? [v] : [])
                  }
                />

                <Input.Select
                  label="Nível de preço"
                  required
                  placeholder="Escolha o nível"
                  searchable={false}
                  options={m.tierOptions}
                  value={m.tier}
                  onChange={(v) =>
                    m.setTier(
                      Array.isArray(v)
                        ? (v[0] ?? null)
                        : (v as SelectOption | null)
                    )
                  }
                  hint={
                    m.tierOptions.length === 0
                      ? "Esta fábrica ainda não tem níveis. Importe a tabela de preços primeiro."
                      : undefined
                  }
                />

                {m.selected.length > 0 && (
                  <Alert.Root variant="info">
                    <Alert.Icon icon={Info} />
                    <Alert.Content>
                      <Alert.Title>
                        {m.scope.affected === 0
                          ? "Nenhum cliente muda com esta escolha"
                          : `${plural(m.scope.affected, "cliente vai", "clientes vão")} para o nível ${tierName}`}
                      </Alert.Title>
                      <Alert.Description>
                        {m.scope.untouched === 0
                          ? "Nenhum outro cliente da fábrica fica de fora."
                          : m.scope.untouched === 1
                            ? "1 cliente fica como está."
                            : `${plural(m.scope.untouched, "cliente", "clientes")} ficam como estão.`}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                <Title variant="body-sm" color="muted">
                  {criterion.source} Depois você ainda pode trocar o nível de um
                  cliente só, em Ações → Editar vínculo.
                </Title>
              </>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              disabled={m.isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            loading={m.isLoading}
            disabled={!m.canSubmit}
            onClick={m.handleSubmit}
          >
            <Button.Title>Definir nível</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
