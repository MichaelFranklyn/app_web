import { Badge } from "@/components/Badges";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Stepper } from "@/components/Stepper";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney, maskCurrency } from "@/utils/format/masks";
import { ChangeEvent } from "react";

import { ReviewRow } from "./interface";
import { confidenceHelp, confidenceTone } from "./utils";

interface StepReviewProps {
  reviewRows: ReviewRow[];
  updateRow: (index: number, patch: Partial<ReviewRow>) => void;
  confirmableCount: number;
}

export function StepReview({
  reviewRows,
  updateRow,
  confirmableCount,
}: StepReviewProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={3}
        total={4}
        title="Confira os itens antes de gravar"
      >
        Casamos cada SKU com o catálogo da fábrica. Confira o produto, o nível e
        o preço. Desmarque o que não quer importar. Linhas sem produto ou sem
        nível não podem ser gravadas — ajuste o catálogo e importe de novo.
      </Stepper.Intro>
      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Incluir</Table.Head>
              <Table.Head>SKU</Table.Head>
              <Table.Head>Produto</Table.Head>
              <Table.Head>Nível</Table.Head>
              <Table.Head>Qtd</Table.Head>
              <Table.Head>Preço</Table.Head>
              <Table.Head>Confiança</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviewRows.map((row, index) => {
              const c = row.candidate;
              const blocked = !c.productId || !row.tierId;
              const tierOpts = c.tierOptions.map((o) => ({
                value: o.tierId,
                label: `${o.tierName ?? "Nível"} — ${formatMoney(o.unitPrice)}`,
              }));
              const tierValue =
                tierOpts.find((o) => o.value === row.tierId) ?? null;
              return (
                <Table.Row key={`${c.rowIndex}-${c.rawSku}`}>
                  <Table.Cell>
                    <Input.Checkbox
                      checked={row.include}
                      disabled={blocked}
                      onChange={() =>
                        updateRow(index, { include: !row.include })
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Badge.Root color="subtle" appearance="tinted" size="xs">
                      <Badge.Text>{c.rawSku}</Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Table.CellText variant="strong">
                        {c.productName ?? "Produto não encontrado"}
                      </Table.CellText>
                      {c.message && (
                        <Table.CellText variant="dim2">
                          {c.message}
                        </Table.CellText>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {!c.productId ? (
                      <Table.CellText variant="dim">—</Table.CellText>
                    ) : tierOpts.length > 0 ? (
                      <Input.Select
                        options={tierOpts}
                        value={tierValue}
                        variant="single"
                        disabledClear
                        onChange={(
                          val: SelectOption | SelectOption[] | null
                        ) => {
                          const opt = Array.isArray(val) ? val[0] : val;
                          // Trocar o nível NÃO sobrescreve o preço: o pedido pode
                          // estar com desconto e queremos manter o valor real.
                          if (opt) updateRow(index, { tierId: opt.value });
                        }}
                      />
                    ) : (
                      <Table.CellText variant="dim">
                        {c.tierName ?? "—"}
                      </Table.CellText>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Input.Text
                      value={row.quantity}
                      disabled={blocked}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateRow(index, { quantity: e.target.value })
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input.Text
                      inputMode="decimal"
                      value={row.unitPrice}
                      disabled={blocked}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateRow(index, {
                          unitPrice: maskCurrency(e.target.value),
                        })
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-4">
                      <Badge.Root
                        color={confidenceTone(Number(c.confidence))}
                        appearance="tinted"
                        size="xs"
                      >
                        <Badge.Text>
                          {Math.round(Number(c.confidence))}%
                        </Badge.Text>
                      </Badge.Root>
                      <HelpTooltip
                        label="O que significa a confiança?"
                        content={
                          <div className="flex flex-col gap-4">
                            <span>{confidenceHelp(Number(c.confidence))}</span>
                            {c.message && (
                              <span className="opacity-80">{c.message}</span>
                            )}
                          </div>
                        }
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Table>
      </Table.Root>
      <Title variant="caption" color="muted">
        {confirmableCount} item(ns) serão gravados.
      </Title>
    </div>
  );
}
