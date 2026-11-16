"use client";

import { FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import {
  ORDER_SHEET_CLIENT_SELLERS_QUERY,
  ORDER_SHEET_SELLERS_QUERY,
} from "./gql";
import type {
  OrderSheetClientSellersData,
  OrderSheetSellersData,
} from "./interface";
import { useOrderSheet } from "./useOrderSheet";

const EMPTY_INPUT = {};
const getSellers = (data: OrderSheetSellersData) => data.order_sheet_sellers;
const getClientLinks = (data: OrderSheetClientSellersData) =>
  data.order_sheet_client_sellers;

interface Props {
  /** Gestor escolhe de quem é a ficha; o vendedor baixa a dele e pronto. */
  canSelectSeller: boolean;
  /**
   * Id do cliente (global) quando a ficha sai da tela dele: o gestor escolhe
   * só entre os vendedores que atendem esse cliente.
   */
  clientId?: string;
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
  clientId,
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
  const linksInput = useMemo(
    () => ({
      filters: [{ field: "client_id", operator: "eq", value: clientId }],
    }),
    [clientId]
  );
  const {
    data: linksData,
    loading: linksLoading,
    error: linksError,
  } = useCompleteList<OrderSheetClientSellersData>(
    ORDER_SHEET_CLIENT_SELLERS_QUERY,
    linksInput,
    getClientLinks,
    { skip: !canSelectSeller || !open || !clientId }
  );
  useQueryErrorToast(
    error ?? linksError,
    "Não foi possível carregar os vendedores."
  );

  // Vendedores que atendem o cliente; null = sem recorte (fora da tela dele).
  const clientSellerIds = useMemo(() => {
    if (!clientId || !linksData) return null;
    return new Set(
      linksData.order_sheet_client_sellers.edges.flatMap(({ node }) =>
        node.seller ? [node.seller.id] : []
      )
    );
  }, [clientId, linksData]);

  // Cliente sem vendedor nenhum: a lista volta a ser a equipe inteira (e a
  // tela diz isso), para a ficha não ficar sem saída.
  const hasClientSellers = (clientSellerIds?.size ?? 0) > 0;
  const options: SelectOption[] = useMemo(
    () =>
      (data?.order_sheet_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .filter(
          ({ node }) =>
            !hasClientSellers || clientSellerIds?.has(node.id) === true
        )
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [data, clientSellerIds, hasClientSellers]
  );
  // Um vendedor só atende o cliente: já vem escolhido.
  const effectiveSellerId =
    sellerId ??
    (hasClientSellers && options.length === 1 ? options[0].value : null);
  const selected =
    options.find((option) => option.value === effectiveSellerId) ?? null;
  const isWaitingLinks =
    Boolean(clientId) && open && linksLoading && !linksData;

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
            label={hasClientSellers ? "Vendedor deste cliente" : "Vendedor"}
            required
            options={options}
            value={selected}
            variant="single"
            placeholder={
              isWaitingLinks ? "Carregando vendedores…" : "Escolha o vendedor"
            }
            onChange={(value: SelectOption | SelectOption[] | null) => {
              const option = Array.isArray(value) ? value[0] : value;
              setSellerId(option?.value ?? null);
            }}
          />
          {clientSellerIds && !hasClientSellers && (
            <Title variant="body-xs" color="muted" className="mt-8 block">
              Nenhum vendedor atende este cliente ainda, então a lista mostra a
              equipe inteira.
            </Title>
          )}
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
            disabled={!effectiveSellerId}
            onClick={async () => {
              if (await generate(effectiveSellerId)) setOpen(false);
            }}
          >
            <Button.Title>Baixar ficha</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
