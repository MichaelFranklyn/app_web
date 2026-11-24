"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ChoiceCardGroup, ChoiceCardOption } from "@/components/ChoiceCard";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";
import { Info, MapPin } from "lucide-react";

import { CityMode } from "./scope";
import { SetTierByCityModalProps, useSetTierByCity } from "./useSetTierByCity";

const MODE_OPTIONS: ChoiceCardOption<CityMode>[] = [
  {
    value: "only",
    label: "Clientes destas cidades",
    hint: "Ex.: a capital. Só quem está nas cidades escolhidas muda.",
  },
  {
    value: "except",
    label: "Todos, menos destas cidades",
    hint: "Ex.: o interior. Escolha a capital e todo o resto muda.",
  },
];

/**
 * Nível de preço em massa pela cidade do cliente — o caso da fábrica com
 * tabela de capital e de interior. A aba pagina de 10 em 10; marcar linha a
 * linha seria um castigo, então a escolha é por cidade, com o escopo dito
 * antes de salvar.
 */
export function SetTierByCityModal(props: SetTierByCityModalProps) {
  const m = useSetTierByCity(props);
  const tierName = m.tier?.label ?? "escolhido";

  return (
    <Modal.Root open={m.open} onOpenChange={m.setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={MapPin} />
          <Button.Title>Nível por cidade</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Definir nível de preço por cidade"
          description="Para fábricas com preço diferente por região: diga qual nível vale para os clientes de cada cidade."
        />

        <Modal.Body>
          {m.citiesError ? (
            <QueryError
              flat
              onRetry={() => m.refetchCities()}
              retrying={m.citiesLoading}
            />
          ) : (
            <div className="flex flex-col gap-16">
              <ChoiceCardGroup
                aria-label="Quais clientes mudam"
                options={MODE_OPTIONS}
                value={m.mode}
                onChange={m.setMode}
              />

              <Input.Select
                variant="multi"
                label="Cidades"
                required
                placeholder={
                  m.citiesLoading ? "Carregando cidades…" : "Escolha as cidades"
                }
                loading={m.citiesLoading}
                options={m.cityOptions}
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
                A cidade vem do endereço do cliente. Depois você ainda pode
                trocar o nível de um cliente só, em Ações → Editar vínculo.
              </Title>
            </div>
          )}
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
