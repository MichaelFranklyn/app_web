"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { useFeature } from "@/services/plan";
import { ImagePlus, Upload } from "lucide-react";
import { useState } from "react";

import { ImportProductsModal } from "./ImportProductsModal";
import { UploadPhotosModal } from "./UploadPhotosModal";

interface Props {
  companyFactoryId: string;
  onChanged: () => void;
}

/**
 * Importar e Enviar fotos num menu só.
 *
 * Eram dois botões soltos ao lado de Filtros, "Precisa de atenção" e Novo
 * produto: no celular os cinco empilhavam na largura toda e o primeiro produto
 * só aparecia na segunda tela (crítica de 23/11/2026). As duas são cargas de
 * catálogo, ocasionais; o uso de todo dia continua à vista.
 */
export function ProductsMoreMenu({ companyFactoryId, onChanged }: Props) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  // Importação em massa é recurso de plano: sem ele, o item some.
  const canImport = useFeature("BULK_IMPORT");

  const options: MoreOption[] = [
    ...(canImport
      ? [
          {
            label: "Importar planilha",
            icon: Upload,
            onClick: () => setIsImportOpen(true),
          },
        ]
      : []),
    {
      label: "Enviar fotos",
      icon: ImagePlus,
      onClick: () => setIsPhotosOpen(true),
    },
  ];

  return (
    <>
      <MoreOptions
        options={options}
        label="Mais ações dos produtos"
        showLabel
      />
      {canImport && (
        <ImportProductsModal
          companyFactoryId={companyFactoryId}
          onChanged={onChanged}
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />
      )}
      <UploadPhotosModal
        companyFactoryId={companyFactoryId}
        onChanged={onChanged}
        open={isPhotosOpen}
        onOpenChange={setIsPhotosOpen}
      />
    </>
  );
}
