"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { InputDate, InputSearch, InputText } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatMoney, maskCurrency } from "@/utils/format/masks";
import { parseLocalDate, toIsoDate } from "@/utils/format/date";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { Tags, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PriceListDetail } from "../../../interface";
import {
  CLEAR_PRICE_LIST_PROMOTION_MUTATION,
  PROMOTION_ITEMS_QUERY,
  SET_PRICE_LIST_PROMOTION_MUTATION,
} from "./gql";
import {
  ClearPromotionResponse,
  PromotionItemNode,
  PromotionItemsData,
  SetPromotionResponse,
} from "./interface";
import {
  buildPromotionItems,
  countPromotedItems,
  groupItemsByProduct,
  parsePromoInputs,
  seedPromoByItem,
} from "./utils";

interface Props {
  priceList: PriceListDetail;
  onChanged: () => void;
}

const MAX_PAGES = 50;

export function PromotionModal({ priceList, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const client = useApolloClient();

  const [loadingItems, setLoadingItems] = useState(false);
  const [nodes, setNodes] = useState<PromotionItemNode[]>([]);
  const [startsOn, setStartsOn] = useState<Date | null>(null);
  const [endsOn, setEndsOn] = useState<Date | null>(null);
  // Preço promocional por item (produto × nível), MASCARADO como moeda ("9,90").
  const [promoByItem, setPromoByItem] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const [setPromotion] = useMutation<SetPromotionResponse>(
    SET_PRICE_LIST_PROMOTION_MUTATION
  );
  const [clearPromotion] = useMutation<ClearPromotionResponse>(
    CLEAR_PRICE_LIST_PROMOTION_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const { toast } = useToast();

  const products = useMemo(() => groupItemsByProduct(nodes), [nodes]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
    );
  }, [products, search]);

  const priceByItem = useMemo(
    () => parsePromoInputs(promoByItem),
    [promoByItem]
  );
  const promotedCount = countPromotedItems(priceByItem);

  // Carrega TODOS os itens ao abrir e semeia a janela + preços já gravados.
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    const all: PromotionItemNode[] = [];
    let after: string | null = null;
    try {
      for (let page = 0; page < MAX_PAGES; page++) {
        const result: { data?: PromotionItemsData } = await client.query({
          query: PROMOTION_ITEMS_QUERY,
          variables: {
            input: {
              first: 200,
              after,
              filters: [
                { field: "price_list_id", operator: "eq", value: priceList.id },
              ],
            },
          },
          fetchPolicy: "network-only",
        });
        const conn = result.data?.priceListItems;
        if (!conn) break;
        all.push(...conn.edges.map((e) => e.node));
        if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) break;
        after = conn.pageInfo.endCursor;
      }
      setNodes(all);
      setPromoByItem(seedPromoByItem(all));
    } catch {
      // Falha ao carregar não pode deixar o modal num limbo silencioso.
      toast({
        variant: "error",
        title: "Erro",
        description: "Não foi possível carregar os itens da tabela.",
      });
      setNodes([]);
    } finally {
      setLoadingItems(false);
    }
  }, [client, priceList.id, toast]);

  useEffect(() => {
    if (!open) return;
    setStartsOn(parseLocalDate(priceList.promoStartsOn));
    setEndsOn(parseLocalDate(priceList.promoEndsOn));
    setSearch("");
    setConfirmClear(false);
    loadItems();
  }, [open, priceList.promoStartsOn, priceList.promoEndsOn, loadItems]);

  const setPromoValue = (itemId: string, raw: string) =>
    setPromoByItem((prev) => ({ ...prev, [itemId]: maskCurrency(raw) }));

  const handleSave = async () => {
    if (promotedCount > 0 && (!startsOn || !endsOn)) {
      toast({
        variant: "error",
        title: "Erro",
        description: "Informe o início e o fim da promoção.",
      });
      return;
    }
    if (startsOn && endsOn && endsOn < startsOn) {
      toast({
        variant: "error",
        title: "Erro",
        description: "O fim da promoção não pode ser antes do início.",
      });
      return;
    }

    const items = buildPromotionItems(nodes, priceByItem);
    await execute(
      async () => {
        const res = await setPromotion({
          variables: {
            input: {
              priceListId: priceList.id,
              promoStartsOn: items.length ? toIsoDate(startsOn) : null,
              promoEndsOn: items.length ? toIsoDate(endsOn) : null,
              items,
            },
          },
        });
        if (!res.data?.setPriceListPromotion?.status) {
          throw new Error(
            res.data?.setPriceListPromotion?.message ??
              "Erro ao salvar a promoção"
          );
        }
        return res.data.setPriceListPromotion.data;
      },
      {
        successMessage: items.length
          ? `Promoção salva em ${items.length} preço(s).`
          : "Promoção encerrada.",
        onSuccess: () => {
          setOpen(false);
          onChanged();
        },
      }
    );
  };

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await execute(
      async () => {
        const res = await clearPromotion({
          variables: { priceListId: priceList.id },
        });
        if (!res.data?.clearPriceListPromotion?.status) {
          throw new Error(
            res.data?.clearPriceListPromotion?.message ??
              "Erro ao encerrar a promoção"
          );
        }
        return res.data.clearPriceListPromotion.data;
      },
      {
        successMessage: "Promoção encerrada.",
        onSuccess: () => {
          setOpen(false);
          onChanged();
        },
      }
    );
  };

  const hasPromo = !!(priceList.promoStartsOn && priceList.promoEndsOn);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Zap} />
          <Button.Title>Promoção relâmpago</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="3xl">
        <Modal.Header
          title="Promoção relâmpago"
          description="Defina um período e o preço promocional de cada nível. Vale enquanto a promoção estiver no ar."
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <div className="tablet:grid-cols-2 grid grid-cols-1 gap-12">
              <InputDate
                label="Início da promoção"
                placeholder="Escolha a data"
                value={startsOn}
                onChange={(d) => setStartsOn(d instanceof Date ? d : null)}
              />
              <InputDate
                label="Fim da promoção"
                placeholder="Escolha a data"
                value={endsOn}
                onChange={(d) => setEndsOn(d instanceof Date ? d : null)}
              />
            </div>

            <InputSearch
              size="sm"
              placeholder="Buscar produto por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loadingItems ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loading.Spinner size="md" />
              </div>
            ) : products.length === 0 ? (
              <EmptyState.Root>
                <EmptyState.Icon>
                  <Tags size={32} />
                </EmptyState.Icon>
                <EmptyState.Title>Nenhum item na tabela</EmptyState.Title>
                <EmptyState.Description>
                  Cadastre preços nesta tabela antes de criar uma promoção.
                </EmptyState.Description>
              </EmptyState.Root>
            ) : (
              <div className="flex max-h-[46vh] flex-col gap-16 overflow-y-auto pr-8">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="flex flex-col gap-8">
                    <div className="flex flex-col">
                      <Title
                        variant="body-sm"
                        className="font-(--weight-medium)"
                      >
                        {p.name}
                      </Title>
                      {p.sku && (
                        <Title variant="body-xs" className="text-(--text-dim)">
                          {p.sku}
                        </Title>
                      )}
                    </div>
                    {p.items.map((item) => (
                      <div
                        key={item.id}
                        className="desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-16 flex flex-col gap-8 pl-12"
                      >
                        <div className="flex min-w-0 flex-col">
                          <Title variant="body-sm">
                            {item.tier?.name ?? "—"}
                          </Title>
                          <Title
                            variant="body-xs"
                            className="text-(--text-dim)"
                          >
                            Preço atual: {formatMoney(Number(item.unitPrice))}
                          </Title>
                        </div>
                        <InputText
                          containerClassName="w-full shrink-0 desktop:w-[240px]"
                          inputMode="numeric"
                          addon="R$"
                          placeholder="0,00"
                          value={promoByItem[item.id] ?? ""}
                          onChange={(e) =>
                            setPromoValue(item.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <Title
                    variant="body-sm"
                    className="py-12 text-center text-(--text-dim)"
                  >
                    Nenhum produto encontrado para “{search}”.
                  </Title>
                )}
              </div>
            )}

            <Title variant="body-sm" className="text-(--text-dim)">
              {promotedCount > 0
                ? `${promotedCount} preço(s) em promoção.`
                : "Nenhum preço em promoção — salvar assim encerra a promoção."}
            </Title>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {hasPromo && (
            <Button.Root
              type="button"
              appearance="ghost"
              color="red"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={handleClear}
            >
              <Button.Title>
                {confirmClear ? "Confirmar encerramento" : "Encerrar promoção"}
              </Button.Title>
            </Button.Root>
          )}
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={loadingItems}
            onClick={handleSave}
          >
            <Button.Title>Salvar promoção</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
