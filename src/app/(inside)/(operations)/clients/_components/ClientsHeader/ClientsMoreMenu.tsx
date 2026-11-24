"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { useFeature } from "@/services/plan";
import { Eraser, Network, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ImportClientsModal } from "./ImportClientsModal";

interface ClientsMoreMenuProps {
  /** Higienizar mexe no que a empresa atende: é decisão de gestor. */
  canClean: boolean;
}

/**
 * Redes, Higienizar e Importar num menu só.
 *
 * Eram três botões soltos ao lado de Exportar e Novo Cliente: no celular os
 * cinco empilhavam na largura toda e a primeira linha da carteira só aparecia
 * na segunda tela (crítica de 23/11/2026). Os três são idas ocasionais; o uso
 * de todo dia (cadastrar, exportar) continua à vista.
 */
export function ClientsMoreMenu({ canClean }: ClientsMoreMenuProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);
  // Importação em massa é recurso de plano: sem ele, o item some (FeatureGate).
  const canImport = useFeature("BULK_IMPORT");

  const options: MoreOption[] = [
    // Redes não têm item próprio na sidebar: são um recorte da carteira, e é
    // daqui que se chega nelas.
    {
      label: "Redes",
      icon: Network,
      onClick: () => router.push("/clients/networks"),
    },
    ...(canClean
      ? [
          {
            label: "Higienizar carteira",
            icon: Eraser,
            onClick: () => router.push("/clients/hygiene"),
          },
        ]
      : []),
    ...(canImport
      ? [
          {
            label: "Importar planilha",
            icon: Upload,
            onClick: () => setIsImportOpen(true),
          },
        ]
      : []),
  ];

  return (
    <>
      <MoreOptions options={options} label="Mais ações da carteira" showLabel />
      {canImport && (
        <ImportClientsModal
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />
      )}
    </>
  );
}
