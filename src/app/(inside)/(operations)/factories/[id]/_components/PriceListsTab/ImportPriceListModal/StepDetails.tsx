import { Emphasis } from "@/components/Emphasis";
import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { plural, pluralWord } from "@/utils/format/plural";
import { Info } from "lucide-react";
import { ChangeEvent } from "react";

import { GroupTargetFields } from "./GroupTargetFields";
import { ImportModeChoice } from "./ImportModeChoice";
import { ActivePriceList, ImportMode, TierColumn } from "./interface";

interface StepDetailsProps {
  activeLists: ActivePriceList[];
  mode: ImportMode;
  setMode: (mode: ImportMode) => void;
  targetListId: string | null;
  setTargetListId: (id: string | null) => void;
  tierColumns: TierColumn[];
  setTierColumns: (columns: TierColumn[]) => void;
  listName: string;
  setListName: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  validFrom: Date | null;
  setValidFrom: (value: Date | null) => void;
  validUntil: Date | null;
  setValidUntil: (value: Date | null) => void;
  isLoading: boolean;
  skippedRows: number;
  importableRows: number;
  defaultedCount: number;
}

export function StepDetails({
  activeLists,
  mode,
  setMode,
  targetListId,
  setTargetListId,
  tierColumns,
  setTierColumns,
  listName,
  setListName,
  region,
  setRegion,
  validFrom,
  setValidFrom,
  validUntil,
  setValidUntil,
  isLoading,
  skippedRows,
  importableRows,
  defaultedCount,
}: StepDetailsProps) {
  return (
    <div className="flex flex-col gap-12">
      {mode === "group" ? (
        <Stepper.Intro
          step={6}
          total={6}
          title="Para terminar, confira o grupo"
        >
          Confira em qual tabela os preços entram e o nome do grupo de clientes.
          Se estiver tudo certo, clique no botão{" "}
          <Emphasis>Importar tabela</Emphasis> aqui embaixo.
        </Stepper.Intro>
      ) : (
        <Stepper.Intro
          step={6}
          total={6}
          title="Para terminar, dê um nome à tabela"
        >
          Escreva um nome para essa tabela de preços — pode usar o mesmo nome
          que está na planilha (ex.: LISTA 39). Confira a data de início e, se
          estiver tudo certo, clique no botão{" "}
          <Emphasis>Importar tabela</Emphasis> aqui embaixo.
        </Stepper.Intro>
      )}
      {activeLists.length > 0 && (
        <ImportModeChoice mode={mode} onChange={setMode} disabled={isLoading} />
      )}
      {mode === "group" ? (
        <GroupTargetFields
          activeLists={activeLists}
          targetListId={targetListId}
          setTargetListId={setTargetListId}
          tierColumns={tierColumns}
          setTierColumns={setTierColumns}
          disabled={isLoading}
        />
      ) : (
        <>
          <Input.Text
            label="Nome da tabela"
            required
            value={listName}
            placeholder="Ex: LISTA 39 - NORDESTE"
            disabled={isLoading}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setListName(e.target.value)
            }
          />
          {/* Região é FISCAL (ICMS do estado): grupo de clientes é nível. */}
          <Input.Text
            label="Região fiscal"
            value={region}
            placeholder="Ex: ICMS 7% — vazio = vale para todos"
            disabled={isLoading}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRegion(e.target.value)
            }
          />
          <div className="grid grid-cols-2 gap-8">
            <Input.Date
              label="Vigência início"
              required
              value={validFrom}
              disabled={isLoading}
              onChange={(d: unknown) =>
                setValidFrom(d instanceof Date ? d : null)
              }
            />
            <Input.Date
              label="Vigência fim"
              value={validUntil}
              disabled={isLoading}
              onChange={(d: unknown) =>
                setValidUntil(d instanceof Date ? d : null)
              }
            />
          </div>
          <Alert.Root variant="info">
            <Alert.Icon icon={Info} />
            <Alert.Content>
              <Alert.Description>
                A nova tabela fica ativa e a anterior da mesma região fiscal é
                desativada. Produtos e níveis que não existirem são criados
                automaticamente.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </>
      )}
      {skippedRows > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {plural(
                skippedRows,
                "linha da planilha será ignorada por não ter",
                "linhas da planilha serão ignoradas por não terem"
              )}{" "}
              código ou descrição (títulos, totais e observações no meio dos
              dados).{" "}
              {pluralWord(importableRows, "Será importada", "Serão importadas")}{" "}
              {plural(importableRows, "linha", "linhas")}.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {defaultedCount > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {plural(
                defaultedCount,
                "produto não tem múltiplo/embalagem na planilha e será importado",
                "produtos não têm múltiplo/embalagem na planilha e serão importados"
              )}{" "}
              com múltiplo 1. Você pode ajustar depois em cada produto.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
