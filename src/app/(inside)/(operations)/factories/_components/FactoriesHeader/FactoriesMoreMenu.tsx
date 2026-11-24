"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { useFeature } from "@/services/plan";
import { Upload } from "lucide-react";
import { useState } from "react";

import { ImportFactoriesModal } from "./ImportFactoriesModal";

/**
 * Ações ocasionais da lista de fábricas num menu só.
 *
 * "Importar dados" era um botão solto ao lado de "Vincular fábrica": no
 * celular os dois empilhavam na largura toda e competiam com a ação de todo
 * dia (crítica de 23/11/2026). Importar é ida rara; vincular continua à vista.
 */
export function FactoriesMoreMenu() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  // Importação em massa é recurso de plano: sem ele, o item some (FeatureGate).
  const canImport = useFeature("BULK_IMPORT");

  const options: MoreOption[] = canImport
    ? [
        {
          label: "Importar planilha",
          icon: Upload,
          onClick: () => setIsImportOpen(true),
        },
      ]
    : [];

  // Menu sem item é botão que não leva a nada.
  if (options.length === 0) return null;

  return (
    <>
      <MoreOptions
        options={options}
        label="Mais ações das fábricas"
        showLabel
      />
      <ImportFactoriesModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />
    </>
  );
}
