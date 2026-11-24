"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Input, SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

import { SELLER_SELECT_HELP } from "../../help";
import { type CommissionsScope } from "../../useCommissionsScope";
import { AudienceSwitch } from "../AudienceSwitch";
import { CommissionsGuide } from "../CommissionsGuide";

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
          <PanelHeader.Heading {...PAGE_HEADING.commissions}>
            Comissões
          </PanelHeader.Heading>
          <PanelHeader.Description>
            {canManage
              ? "O que as fábricas devem ao escritório, mês a mês."
              : "Quanto você tem para ganhar de comissão, por fábrica e por mês."}
          </PanelHeader.Description>
        </PanelHeader.Left>
        {/* A explicação da tela inteira, num painel: substitui os "?"
            espalhados sem ocupar uma faixa da tela em toda visita. */}
        <CommissionsGuide canManage={canManage} />
      </PanelHeader.Top>
      {canSelectSeller && (
        // Caixa crua e não PanelHeader.Actions: o Actions mede o conteúdo
        // e o mantém no tamanho natural (w-auto), e aqui o seletor e
        // "Valores de" precisam da linha inteira abaixo do desktop.
        <div className="mt-6 w-full" data-tour="commissions-lens">
          {/* Celular/tablet: seletor (com o seu "?") numa linha e "Valores
              de" na de baixo, cada um com a linha toda. Lado a lado, o
              "?" do seletor sobrava sozinho numa linha. */}
          <div className="desktop:flex-row desktop:items-center desktop:gap-4 flex w-full flex-col gap-8">
            <div className="desktop:w-auto flex w-full items-center gap-4">
              {/* Travado na ótica do escritório, e mostrando o que a
                tela está de fato somando ("Todos os vendedores"): o
                recorte por vendedor não existe nessa conta, e um campo
                que continuasse clicável prometeria um filtro que a tela
                ia ignorar. */}
              <div className="desktop:w-[220px] desktop:flex-none min-w-0 flex-1">
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
            </div>
            {/* Duas perguntas que andam juntas: de QUEM são as comissões
                e DE QUEM é o dinheiro que a tela conta. */}
            <AudienceSwitch
              value={scope.audience}
              onChange={scope.setAudience}
            />
          </div>
        </div>
      )}
    </PanelHeader.Root>
  );
}
