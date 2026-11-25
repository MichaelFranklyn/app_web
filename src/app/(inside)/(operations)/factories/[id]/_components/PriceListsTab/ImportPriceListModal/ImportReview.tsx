import { Card } from "@/components/Card";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";

import { ActivePriceList, ImportMode, TierColumn } from "./interface";
import { PricePreview } from "./PricePreview";
import { ImportPreviewRow } from "./preview";

interface Props {
  mode: ImportMode;
  importableRows: number;
  tierColumns: TierColumn[];
  replacedList: ActivePriceList | null;
  previewRows: ImportPreviewRow[];
  pricesPerUnit: boolean;
}

/**
 * O resumo antes do botão "Importar tabela": quantos produtos entram, com
 * quais níveis, o que acontece com a tabela que vale hoje e três produtos de
 * exemplo. É a última chance de perceber uma coluna trocada.
 */
export function ImportReview({
  mode,
  importableRows,
  tierColumns,
  replacedList,
  previewRows,
  pricesPerUnit,
}: Props) {
  const tierNames = tierColumns
    .filter((t) => t.columnIndex !== null && t.tierName.trim() !== "")
    .map((t) => t.tierName.trim());

  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium">
        Resumo do que vai ser importado
      </Title>
      <Card.Root inset>
        <Card.Body padding="sm">
          <Title variant="caption">
            <Emphasis>{plural(importableRows, "produto", "produtos")}</Emphasis>{" "}
            {importableRows === 1 ? "será importado" : "serão importados"}
            {mode === "replace" && tierNames.length > 0 && (
              <>
                , com {tierNames.length === 1 ? "o nível" : "os níveis"}{" "}
                <Emphasis>{tierNames.join(", ")}</Emphasis>
              </>
            )}
            .
          </Title>
          {mode === "replace" && (
            <Title variant="caption" color="muted">
              {replacedList ? (
                <>
                  Ela passa a ser a tabela que vale. A tabela{" "}
                  <Emphasis>{replacedList.name}</Emphasis> deixa de valer (fica
                  guardada no histórico).
                </>
              ) : (
                "Ela passa a ser a tabela que vale."
              )}{" "}
              Produtos e níveis que ainda não existem são criados sozinhos.
            </Title>
          )}
        </Card.Body>
      </Card.Root>
      <PricePreview
        rows={previewRows}
        pricesPerUnit={pricesPerUnit}
        title="Produtos de exemplo"
      />
    </div>
  );
}
