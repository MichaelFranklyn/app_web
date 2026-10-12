"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Input, SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";

import { SELLER_SELECT_HELP } from "../../help";
import { type CommissionsScope } from "../../useCommissionsScope";
import { AudienceSwitch } from "../AudienceSwitch";

interface Props {
  scope: CommissionsScope;
}

/**
 * O topo da tela: o que ela é e, para o gestor, as duas perguntas que andam
 * juntas — de QUEM são as comissões e DE QUEM é o dinheiro que a tela conta.
 */
export function CommissionsHeader({ scope }: Props) {
  const { canManage, canSelectSeller, isOfficeScope } = scope;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Title>Comissões</PanelHeader.Title>
          <PanelHeader.Description>
            {canManage
              ? "O que as fábricas devem ao escritório, mês a mês. Em “Valores de: Escritório” a tela soma todos os vendedores — é o número que se confere contra a planilha da fábrica; troque para “Vendedor” para ver, e escolher, um de cada vez."
              : "Quanto você tem para ganhar de comissão, por fábrica e por mês."}
          </PanelHeader.Description>
          {canSelectSeller && (
            <PanelHeader.Actions className="mt-6" data-tour="commissions-lens">
              <div className="flex items-center gap-4">
                {/* Travado na ótica do escritório, e mostrando o que a
                    tela está de fato somando ("Todos os vendedores"): o
                    recorte por vendedor não existe nessa conta, e um campo
                    que continuasse clicável prometeria um filtro que a tela
                    ia ignorar. */}
                <div className="desktop:w-[220px] w-full">
                  <Input.Select
                    size="sm"
                    options={scope.sellerOptions}
                    value={isOfficeScope ? null : scope.sellerValue}
                    variant="single"
                    disabled={isOfficeScope}
                    disabledClear
                    placeholder={
                      isOfficeScope
                        ? "Todos os vendedores"
                        : "Selecionar vendedor"
                    }
                    onChange={(val: SelectOption | SelectOption[] | null) => {
                      const opt = Array.isArray(val) ? val[0] : val;
                      if (opt) scope.selectSeller(opt.value);
                    }}
                  />
                </div>
                <HelpTooltip
                  label="Sobre o seletor de vendedor"
                  content={SELLER_SELECT_HELP}
                />
                {/* Duas perguntas que andam juntas: de QUEM são as comissões
                    e DE QUEM é o dinheiro que a tela conta. */}
                <AudienceSwitch
                  value={scope.audience}
                  onChange={scope.setAudience}
                />
              </div>
            </PanelHeader.Actions>
          )}
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
