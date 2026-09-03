"use client";

import { FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { ORDER_SHEET_SELLERS_QUERY } from "./gql";
import type { OrderSheetSellersData } from "./interface";
import { useOrderSheet } from "./useOrderSheet";

const EMPTY_INPUT = {};
const getSellers = (data: OrderSheetSellersData) => data.order_sheet_sellers;

interface Props {
  /** Gestor escolhe de quem é a ficha; o vendedor baixa a dele e pronto. */
  canSelectSeller: boolean;
  /** Cliente já preenchido no cabeçalho, quando a ficha sai da tela dele. */
  cnpjDigits?: string;
  clientName?: string;
  size?: "sm" | "md";
}

/**
 * Baixa a ficha de pedido para trabalhar sem internet.
 *
 * O vendedor clica e recebe o arquivo. O gestor escolhe antes de quem é a ficha
 * — ele é quem distribui a planilha atualizada quando os preços mudam, e a
 * carteira e os níveis acordados dentro dela são de um vendedor só.
 */
export function OrderSheetButton({
  canSelectSeller,
  cnpjDigits,
  clientName,
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const { generate, generating } = useOrderSheet({ cnpjDigits, clientName });

  const { data, error } = useCompleteList<OrderSheetSellersData>(
    ORDER_SHEET_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller || !open }
  );
  useQueryErrorToast(error, "Não foi possível carregar os vendedores.");

  const options: SelectOption[] = useMemo(
    () =>
      (data?.order_sheet_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [data]
  );
  const selected = options.find((option) => option.value === sellerId) ?? null;

  if (!canSelectSeller) {
    return (
      <Button.Root
        appearance="outline"
        color="neutral"
        size={size}
        loading={generating}
        onClick={() => generate()}
      >
        <Button.Icon icon={FileSpreadsheet} />
        <Button.Title>Ficha de pedido</Button.Title>
      </Button.Root>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size={size}>
          <Button.Icon icon={FileSpreadsheet} />
          <Button.Title>Ficha de pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Ficha de pedido offline"
          description="A planilha leva a carteira, os níveis acordados e o catálogo com preço do dia. Ela é de um vendedor só."
        />
        <Modal.Body>
          <Input.Select
            label="Vendedor"
            required
            options={options}
            value={selected}
            variant="single"
            placeholder="Escolha o vendedor"
            onChange={(value: SelectOption | SelectOption[] | null) => {
              const option = Array.isArray(value) ? value[0] : value;
              setSellerId(option?.value ?? null);
            }}
          />
          <Title variant="body-xs" color="muted" className="mt-8 block">
            Os preços ficam congelados na data em que a ficha é gerada. Quando a
            tabela mudar ou entrar uma promoção, baixe de novo e reenvie.
          </Title>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            loading={generating}
            disabled={!sellerId}
            onClick={async () => {
              if (await generate(sellerId)) setOpen(false);
            }}
          >
            <Button.Title>Baixar ficha</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
