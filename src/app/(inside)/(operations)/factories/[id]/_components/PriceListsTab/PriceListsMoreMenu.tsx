"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { useFeature } from "@/services/plan";
import { Copy, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ComponentProps, useState } from "react";

import { ClonePriceListModal } from "./ClonePriceListModal";
import { ImportPriceListModal } from "./ImportPriceListModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  importProps: Omit<ComponentProps<typeof ImportPriceListModal>, Controlled>;
  cloneProps: Omit<ComponentProps<typeof ClonePriceListModal>, Controlled>;
  /** Só com 2+ tabelas: com uma só, "Clonar outra tabela" não tem "outra" a
   *  escolher e o menu oferecia uma ida sem sentido (crítica de 23/11/2026,
   *  revista a pedido do usuário). O reajuste de quem tem uma tabela só sai
   *  por "Nova tabela" ou pela importação. */
  canClone: boolean;
}

/**
 * Importar e Clonar num menu só.
 *
 * Eram dois botões ao lado de "Nova tabela": no celular os três empilhavam na
 * largura toda e a primeira tabela só aparecia depois deles (crítica de
 * 23/11/2026). São idas ocasionais; criar a tabela continua à vista.
 */
export function PriceListsMoreMenu({
  importProps,
  cloneProps,
  canClone,
}: Props) {
  const searchParams = useSearchParams();
  // Aberto direto pelo CTA do modal de importar produtos e pela aba Modelos
  // (?import=price-list).
  const [importOpen, setImportOpen] = useState(
    searchParams.get("import") === "price-list"
  );
  const [cloneOpen, setCloneOpen] = useState(false);
  // Importação em massa é recurso de plano: sem ele, o item some (FeatureGate).
  const canImport = useFeature("BULK_IMPORT");

  const options: MoreOption[] = [
    ...(canImport
      ? [
          {
            label: "Importar tabela",
            icon: Upload,
            onClick: () => setImportOpen(true),
          },
        ]
      : []),
    ...(canClone
      ? [
          {
            label: "Clonar outra tabela",
            icon: Copy,
            onClick: () => setCloneOpen(true),
          },
        ]
      : []),
  ];

  return (
    <>
      {options.length > 0 && (
        <MoreOptions
          options={options}
          label="Mais ações das tabelas"
          showLabel
        />
      )}
      {canImport && (
        <ImportPriceListModal
          {...importProps}
          open={importOpen}
          onOpenChange={setImportOpen}
        />
      )}
      {canClone && (
        <ClonePriceListModal
          {...cloneProps}
          open={cloneOpen}
          onOpenChange={setCloneOpen}
        />
      )}
    </>
  );
}
