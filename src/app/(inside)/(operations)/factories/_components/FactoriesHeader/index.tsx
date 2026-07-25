"use client";

import { InputSearch } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { useUserData } from "@/hooks/useUserData";
import { CompanyFactory } from "../../interface";
import { ImportFactoriesModal } from "./ImportFactoriesModal";
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
          <PanelHeader.Title>Fábricas Representadas</PanelHeader.Title>
          <PanelHeader.Description>
            Fábricas cujos produtos são vendidos pela empresa. Entidade global
            da plataforma.
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
                <ImportFactoriesModal />
                <LinkFactoryModal onAddOptimistic={onAddOptimistic} />
              </>
            )}
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
