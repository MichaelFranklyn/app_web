import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Info } from "lucide-react";
import { ChangeEvent } from "react";

interface StepDetailsProps {
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
      <Stepper.Intro
        step={6}
        total={6}
        title="Para terminar, dê um nome à tabela"
      >
        Escreva um nome para essa tabela de preços — pode usar o mesmo nome que
        está na planilha (ex.: LISTA 39). Confira a data de início e, se estiver
        tudo certo, clique no botão <b>Importar tabela</b> aqui embaixo.
      </Stepper.Intro>
      <Input.Text
        label="Nome da tabela"
        value={listName}
        placeholder="Ex: LISTA 39 - NORDESTE"
        disabled={isLoading}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setListName(e.target.value)
        }
      />
      <Input.Text
        label="Região (opcional)"
        value={region}
        placeholder="Ex: NORDESTE, ICMS 7% — vazio = geral"
        disabled={isLoading}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setRegion(e.target.value)
        }
      />
      <div className="grid grid-cols-2 gap-8">
        <Input.Date
          label="Vigência início"
          value={validFrom}
          disabled={isLoading}
          onChange={(d: unknown) => setValidFrom(d instanceof Date ? d : null)}
        />
        <Input.Date
          label="Vigência fim (opcional)"
          value={validUntil}
          disabled={isLoading}
          onChange={(d: unknown) => setValidUntil(d instanceof Date ? d : null)}
        />
      </div>
      <Alert.Root variant="info">
        <Alert.Icon icon={Info} />
        <Alert.Content>
          <Alert.Description>
            A nova tabela fica ativa e a anterior da mesma região é desativada —
            tabelas de outras regiões continuam ativas. Produtos e níveis que
            não existirem são criados automaticamente.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      {skippedRows > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {skippedRows} linha(s) da planilha serão ignoradas por não terem
              código ou descrição (títulos, totais e observações no meio dos
              dados). Serão importadas {importableRows} linha(s).
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {defaultedCount > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {defaultedCount} produto(s) não têm múltiplo/embalagem na planilha
              e serão importados com múltiplo 1. Você pode ajustar depois em
              cada produto.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
