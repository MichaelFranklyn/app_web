"use client";

import { Check, Pencil, Plus, Trash, X, Zap } from "lucide-react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { maskCurrency, formatMoney } from "@/utils/format/masks";

import { DISCOUNT_TYPE_OPTIONS, discountLabel, itemSubtotal } from "./utils";
import { OrderDraftItems } from "./useOrderDraftItems";
import { DraftTotal } from "./DraftTotal";
import { PaymentTermMinimum } from "./interface";

interface Props {
  draft: OrderDraftItems;
  /**
   * Piso da condição de pagamento escolhida no passo 1, quando ela tem um.
   * Só avisa — quem barra é o servidor, e só na confirmação do pedido.
   */
  minimum?: PaymentTermMinimum | null;
}

export function StepItems({ draft, minimum }: Props) {
  if (!draft.hasCatalog) {
    return (
      <Title variant="body-md" color="muted">
        Esta fábrica ainda não tem produtos cadastrados. Você pode criar o
        pedido sem itens e adicioná-los depois.
      </Title>
    );
  }

  const isEditing = draft.editingIndex !== null;

  return (
    <div className="flex flex-col gap-16">
      {/* Formulário de adição (ou edição) de um item */}
      <div className="flex flex-col gap-8 rounded-(--r-md) border border-(--border) bg-(--bg2) p-16">
        <Title variant="label" weight="bold" className="tracking-normal">
          {isEditing ? "Editar item" : "Adicionar item"}
        </Title>

        <div className="grid grid-cols-12 gap-x-8 gap-y-12">
          <div className="col-span-12">
            <Input.Select
              label="Produto (nome ou código)"
              placeholder="Digite o nome ou o código do produto"
              options={draft.productOptions}
              value={draft.selectedProduct}
              onChange={draft.selectProduct}
            />
          </div>

          <div className="col-span-12">
            <Input.Select
              label="Nível comercial (opcional)"
              placeholder="Selecione o nível para sugerir o preço"
              options={draft.tierOptions}
              value={draft.selectedTier}
              onChange={draft.selectTier}
            />
          </div>

          <div className="col-span-12">
            <Input.Text
              label={
                draft.unitName
                  ? `Preço por ${draft.unitName.toLowerCase()}`
                  : "Preço por unidade"
              }
              addon="R$"
              inputMode="numeric"
              placeholder="0,00"
              value={draft.unitPrice}
              onChange={(e) => draft.setUnitPrice(maskCurrency(e.target.value))}
              hint={
                draft.priceMissing
                  ? "Este produto não tem preço neste nível na tabela ativa. Digite o preço."
                  : "Preço de uma unidade, sugerido pela tabela ativa. Você pode ajustar."
              }
            />
          </div>

          <div className="tablet:col-span-6 col-span-12">
            <Input.Number
              label="Quantidade"
              placeholder="0"
              value={draft.quantity}
              onChange={(e) => draft.setQuantity(e.target.value)}
              hint={
                draft.saleMultiple
                  ? `Em unidades. Vendido em múltiplos de ${draft.saleMultiple}.`
                  : "Em unidades (peças), não em embalagens."
              }
            />
          </div>

          <div className="tablet:col-span-3 col-span-6">
            <Input.Select
              label="Tipo de desconto"
              options={DISCOUNT_TYPE_OPTIONS}
              value={
                DISCOUNT_TYPE_OPTIONS.find(
                  (o) => o.value === draft.discountType
                ) ?? null
              }
              onChange={draft.selectDiscountType}
            />
          </div>

          <div className="tablet:col-span-3 col-span-6">
            <Input.Number
              label={
                draft.discountType === "PERCENT"
                  ? "Desconto (%)"
                  : "Desconto (R$)"
              }
              placeholder="0"
              value={draft.discount}
              onChange={(e) => draft.setDiscount(e.target.value)}
            />
          </div>

          {draft.ipiInOrder && (
            <div className="tablet:col-span-6 col-span-12">
              <Input.Number
                label="Alíq. IPI (%)"
                placeholder="0"
                value={draft.ipiRate}
                onChange={(e) => draft.setIpiRate(e.target.value)}
                hint="Vem do IPI cadastrado no produto e é somado por cima do subtotal. Você pode ajustar."
              />
            </div>
          )}
        </div>

        {draft.error && (
          <Title variant="caption" color="red">
            {draft.error}
          </Title>
        )}

        <div className="flex gap-8">
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="sm"
            noUppercase
            onClick={draft.submitItem}
          >
            <Button.Icon icon={isEditing ? Check : Plus} />
            <Button.Title>
              {isEditing ? "Salvar item" : "Adicionar item"}
            </Button.Title>
          </Button.Root>

          {isEditing && (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="sm"
              noUppercase
              onClick={draft.cancelEdit}
            >
              <Button.Icon icon={X} />
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          )}
        </div>
      </div>

      {/* Itens já adicionados ao rascunho */}
      {draft.items.length > 0 && (
        <Table.Root>
          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Produto</Table.Head>
                <Table.Head>Nível</Table.Head>
                <Table.Head>Qtd (unidades)</Table.Head>
                <Table.Head>Preço/unidade</Table.Head>
                <Table.Head>Desconto</Table.Head>
                {draft.ipiInOrder && <Table.Head>Alíq. IPI</Table.Head>}
                <Table.Head>
                  Subtotal{draft.ipiInOrder ? " (sem IPI)" : ""}
                </Table.Head>
                <Table.Head className="text-right">Ações</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {draft.items.map((item, index) => (
                <Table.Row key={`${item.productId}-${index}`}>
                  <Table.Cell variant="strong">
                    <span className="inline-flex items-center gap-6">
                      {item.productLabel}
                      {item.isPromo && (
                        <span
                          className="inline-flex items-center gap-2 text-(--orange)"
                          title="Promoção relâmpago"
                        >
                          <Zap size={13} />
                        </span>
                      )}
                    </span>
                  </Table.Cell>
                  <Table.Cell variant="dim">{item.tierLabel || "—"}</Table.Cell>
                  <Table.Cell variant="strong">{item.quantity}</Table.Cell>
                  <Table.Cell variant="dim">
                    {formatMoney(item.unitPrice)}
                  </Table.Cell>
                  <Table.Cell variant="dim">
                    {discountLabel(
                      item.discount,
                      item.discountInput,
                      item.discountType,
                      formatMoney
                    )}
                  </Table.Cell>
                  {draft.ipiInOrder && (
                    <Table.Cell variant="dim">
                      {item.ipiRate > 0 ? `${item.ipiRate}%` : "—"}
                    </Table.Cell>
                  )}
                  <Table.Cell variant="strong">
                    {formatMoney(
                      itemSubtotal(item.unitPrice, item.quantity, item.discount)
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-4">
                      <Button.Root
                        type="button"
                        appearance="ghost"
                        color="neutral"
                        size="sm"
                        isIconOnly
                        noUppercase
                        label="Editar item"
                        onClick={() => draft.startEdit(index)}
                      >
                        <Button.Icon icon={Pencil} />
                      </Button.Root>
                      <Button.Root
                        type="button"
                        appearance="ghost"
                        color="red"
                        size="sm"
                        isIconOnly
                        noUppercase
                        label="Remover item"
                        onClick={() => draft.removeItem(index)}
                      >
                        <Button.Icon icon={Trash} />
                      </Button.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Table>
        </Table.Root>
      )}

      {draft.items.length > 0 && (
        <DraftTotal total={draft.total} minimum={minimum} />
      )}
    </div>
  );
}
