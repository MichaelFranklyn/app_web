"use client";

import { InputSearch } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { PlanLimitGate } from "@/components/PlanLimitGate";
import { useUserData } from "@/hooks/useUserData";
import { CompanyFactory } from "../../interface";
import { FactoriesMoreMenu } from "./FactoriesMoreMenu";
import { LinkFactoryModal } from "./LinkFactoryModal";

interface Props {
  totalItems: number;
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  onAddOptimistic: (factory: CompanyFactory) => void;
}

export function FactoriesHeader({
  inputValues,
  setFilter,
  onAddOptimistic,
}: Props) {
  // Vincular/importar fábrica são ações de gestão (mutations @is_admin no
  // backend) — vendedor vê a lista das suas fábricas, sem essas ações.
  const { isSeller } = useUserData();

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Heading {...PAGE_HEADING.factories}>
            Fábricas Representadas
          </PanelHeader.Heading>
          {/* Por papel, em palavras de quem lê: "entidade global da
              plataforma" era detalhe de modelagem (crítica de 23/11/2026). */}
          <PanelHeader.Description>
            {isSeller
              ? "As fábricas que você pode vender."
              : "As fábricas que a sua empresa representa."}
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6" data-tour="factories-actions">
            <InputSearch
              size="sm"
              placeholder="Buscar por CNPJ ou nome..."
              data-tour="factories-search"
              containerClassName="w-[260px]"
              value={inputValues.search ?? ""}
              onChange={(e) => setFilter("search", e.target.value || undefined)}
            />
            {!isSeller && (
              <>
                <FactoriesMoreMenu />
                <PlanLimitGate limit="FACTORIES">
                  <LinkFactoryModal onAddOptimistic={onAddOptimistic} />
                </PlanLimitGate>
              </>
            )}
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
