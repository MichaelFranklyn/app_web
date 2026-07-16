import { Badge } from "@/components/Badges";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney, maskCurrency } from "@/utils/format/masks";
import { ChangeEvent } from "react";

import { ReviewRow } from "./interface";
import { confidenceHelp, confidenceTone, tierPriceDiffers } from "./utils";

interface StepReviewProps {
  reviewRows: ReviewRow[];
  updateRow: (index: number, patch: Partial<ReviewRow>) => void;
  confirmableCount: number;
  /** Fábrica cobra IPI no pedido: mostra a coluna editável de alíquota. */
  ipiInOrder?: boolean;
}

export function StepReview({
  reviewRows,
  updateRow,
  confirmableCount,
  ipiInOrder = false,
}: StepReviewProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={3}
        total={4}
        title="Confira os itens antes de gravar"
      >
        Casamos cada código do produto com o catálogo da fábrica. Confira o
        produto, o nível e o preço. Desmarque o que não quer importar. Linhas
        sem produto ou sem nível não podem ser gravadas — ajuste o catálogo e
        importe de novo.
      </Stepper.Intro>
      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Incluir</Table.Head>
              <Table.Head>Produto</Table.Head>
              <Table.Head>Nível</Table.Head>
              <Table.Head>Qtd</Table.Head>
              <Table.Head>Preço</Table.Head>
              {ipiInOrder && <Table.Head>Alíq. IPI (%)</Table.Head>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviewRows.map((row, index) => {
              const c = row.candidate;
              const blocked = !c.productId || !row.tierId;
              // Sem preço no rótulo: o nível é escolhido pelo nome e o preço da
              // tabela aparece como referência ("Tabela: X") abaixo do preço.
              const tierOpts = c.tierOptions.map((o) => ({
                value: o.tierId,
                label: o.tierName ?? "Nível",
              }));
              const tierValue =
                tierOpts.find((o) => o.value === row.tierId) ?? null;
              // Preço do nível selecionado, como referência quando o valor do
              // arquivo diverge (desconto explícito, não erro).
              const tierPrice = c.tierOptions.find(
                (o) => o.tierId === row.tierId
              )?.unitPrice;
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
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <Table.CellText variant="dim2">
                          Código {c.rawSku}
                        </Table.CellText>
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
                              <span>
                                {confidenceHelp(Number(c.confidence))}
                              </span>
                              {c.message && (
                                <span className="opacity-80">{c.message}</span>
                              )}
                            </div>
                          }
                        />
                      </div>
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
                      <div className="min-w-[160px]">
                        <Input.Select
                          options={tierOpts}
                          value={tierValue}
                          variant="single"
                          disabledClear
                          onChange={(
                            val: SelectOption | SelectOption[] | null
                          ) => {
                            const opt = Array.isArray(val) ? val[0] : val;
                            // Trocar o nível NÃO sobrescreve o preço: o pedido
                            // pode estar com desconto e mantemos o valor real.
                            if (opt) updateRow(index, { tierId: opt.value });
                          }}
                        />
                      </div>
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
                    <div className="flex flex-col gap-2">
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
                      {tierPriceDiffers(row.unitPrice, tierPrice) && (
                        <Table.CellText variant="dim2">
                          Tabela: {formatMoney(tierPrice!)}
                        </Table.CellText>
                      )}
                    </div>
                  </Table.Cell>
                  {ipiInOrder && (
                    <Table.Cell>
                      <Input.Text
                        inputMode="decimal"
                        value={row.ipiRate}
                        disabled={blocked}
                        placeholder="0"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateRow(index, { ipiRate: e.target.value })
                        }
                      />
                    </Table.Cell>
                  )}
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
