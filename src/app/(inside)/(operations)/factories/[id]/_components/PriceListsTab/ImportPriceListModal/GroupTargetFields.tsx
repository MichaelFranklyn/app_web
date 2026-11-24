import { Alert } from "@/components/Alert";
import { Emphasis } from "@/components/Emphasis";
import { Input, SelectOption } from "@/components/Input";
import { Users } from "lucide-react";
import { ChangeEvent } from "react";

import { ActivePriceList, TierColumn } from "./interface";

interface Props {
  activeLists: ActivePriceList[];
  targetListId: string | null;
  setTargetListId: (id: string | null) => void;
  tierColumns: TierColumn[];
  setTierColumns: (columns: TierColumn[]) => void;
  disabled: boolean;
}

const listLabel = (list: ActivePriceList) =>
  list.region ? `${list.name} (${list.region})` : list.name;

/**
 * Preços de outro grupo de clientes: em qual tabela vigente eles entram e com
 * que nome. O grupo É o nível comercial — "Interior" vira o nível Interior da
 * tabela, e o cliente marcado com ele compra por esse preço.
 */
export function GroupTargetFields({
  activeLists,
  targetListId,
  setTargetListId,
  tierColumns,
  setTierColumns,
  disabled,
}: Props) {
  const options: SelectOption[] = activeLists.map((list) => ({
    value: list.id,
    label: listLabel(list),
  }));
  const target = activeLists.find((l) => l.id === targetListId) ?? null;
  const tiers = tierColumns.filter((t) => t.columnIndex !== null);
  // Uma coluna de preço (o caso comum): o nome do grupo se escreve aqui mesmo.
  const single = tiers.length === 1 ? tiers[0] : null;
  const groupNames = tiers
    .map((t) => t.tierName.trim())
    .filter(Boolean)
    .join(", ");

  const renameGroup = (name: string) =>
    setTierColumns(
      tierColumns.map((t) =>
        t.id === single?.id ? { ...t, tierName: name } : t
      )
    );

  return (
    <>
      {activeLists.length > 1 && (
        <Input.Select
          label="Tabela que recebe os preços"
          required
          placeholder="Escolha a tabela vigente"
          options={options}
          value={options.find((o) => o.value === targetListId) ?? null}
          variant="single"
          disabledClear
          disabled={disabled}
          onChange={(val: SelectOption | SelectOption[] | null) => {
            const opt = Array.isArray(val) ? val[0] : val;
            setTargetListId(opt ? String(opt.value) : null);
          }}
        />
      )}
      {single && (
        <Input.Text
          label="Nome do grupo de clientes"
          required
          value={single.tierName}
          placeholder="Ex: Interior"
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            renameGroup(e.target.value)
          }
        />
      )}
      <Alert.Root variant="info">
        <Alert.Icon icon={Users} />
        <Alert.Content>
          <Alert.Description>
            {target ? (
              <>
                Os preços entram na tabela <Emphasis>{target.name}</Emphasis>
              </>
            ) : (
              "Os preços entram na tabela escolhida"
            )}
            {groupNames ? (
              <>
                {" "}
                como o nível <Emphasis>{groupNames}</Emphasis>
              </>
            ) : null}
            . Os preços dos outros grupos não mudam e a tabela continua valendo.
            Depois, na aba <Emphasis>Clientes</Emphasis>, marque esse nível nos
            clientes do grupo — é por ele que o pedido puxa o preço.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </>
  );
}
