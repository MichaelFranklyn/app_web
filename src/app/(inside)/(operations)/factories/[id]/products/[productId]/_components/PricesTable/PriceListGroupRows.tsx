import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { formatDateDMY, formatNumber } from "@/utils/format/masks";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { PackInfo, PriceListGroup } from "./interface";
import { PriceItemRowActions } from "./PriceItemRowActions";
import { money } from "./utils";

interface PriceListGroupRowsProps {
  group: PriceListGroup;
  pack: PackInfo;
  companyFactoryId: string;
  onChanged: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function PriceListGroupRows({
  group,
  pack,
  companyFactoryId,
  onChanged,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: PriceListGroupRowsProps) {
  const router = useRouter();
  const { priceList, items } = group;
  const validity = priceList
    ? `${formatDateDMY(priceList.validFrom)}${
        priceList.validUntil
          ? ` – ${formatDateDMY(priceList.validUntil)}`
          : " · sem fim"
      }`
    : null;

  return (
    <>
      <Table.Row>
        <Table.Cell colSpan={5} className="bg-(--bg3)">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Table.CellText variant="strong">
                {priceList?.name ?? "Sem tabela"}
              </Table.CellText>
              {priceList && (
                <Badge.Root
                  color={priceList.isActive ? "green" : "neutral"}
                  appearance="tinted"
                >
                  <Badge.Text>
                    {priceList.isActive ? "Ativa" : "Inativa"}
                  </Badge.Text>
                </Badge.Root>
              )}
              {validity && (
                <Table.CellText variant="dim2">{validity}</Table.CellText>
              )}
            </div>
            {priceList && (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="sm"
                noUppercase
                onClick={() =>
                  router.push(
                    `/factories/${companyFactoryId}/price-lists/${priceList.id}`
                  )
                }
              >
                <Button.Icon icon={Eye} />
                <Button.Title>Ver tabela</Button.Title>
              </Button.Root>
            )}
          </div>
        </Table.Cell>
      </Table.Row>

      {items.map((item) => {
        // O preço da tabela é sempre por embalagem; o valor por unidade base
        // é derivado.
        const perBaseUnit =
          Number(item.unitPriceWithImpost) / (pack.unitPerPack || 1);
        return (
          <Table.Row key={item.id}>
            <Table.Cell>
              <Badge.Root color="neutral" appearance="tinted">
                <Badge.Text>{item.tier?.name ?? "—"}</Badge.Text>
              </Badge.Root>
            </Table.Cell>
            <Table.Cell>
              <Table.CellText variant="dim">
                R$ {money(item.unitPrice)}
              </Table.CellText>
            </Table.Cell>
            <Table.Cell>
              <Table.CellText variant="strong">
                R$ {money(item.unitPriceWithImpost)}
              </Table.CellText>
            </Table.Cell>
            <Table.Cell>
              <div className="flex flex-col">
                <Table.CellText variant="strong">
                  R$ {money(String(perBaseUnit))} / {pack.baseUnitLabel}
                </Table.CellText>
                <Table.CellText variant="dim2">
                  {pack.packLabel} com {formatNumber(Number(pack.unitPerPack))}{" "}
                  {pack.baseUnitLabel}
                </Table.CellText>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center justify-end gap-4">
                <PriceItemRowActions
                  item={item}
                  label={`${priceList?.name ?? "preço"} · ${item.tier?.name ?? ""}`}
                  onChanged={onChanged}
                  onRemoveOptimistic={onRemoveOptimistic}
                  onCommit={onCommit}
                  onRollback={onRollback}
                />
              </div>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </>
  );
}
