"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PublicPage } from "@/components/PublicPage";
import { Factory, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { RefObject, useActionState, useEffect, useRef, useState } from "react";
import {
  PortalCatalogFactory,
  PortalCatalogItem,
  PortalReplenishmentItem,
} from "../interface";
import { PortalPageHeader } from "../_components/PortalPageHeader";
import { CatalogSection } from "./_components/CatalogSection";
import { OrderCart } from "./_components/OrderCart";
import { OrderEstimateBadge } from "./_components/OrderEstimateBadge";
import { OrderToolbar } from "./_components/OrderToolbar";
import { RunningOutSection } from "./_components/RunningOutSection";
import { SendOrderModal } from "./_components/SendOrderModal";
import { requestOrderAction } from "./actions";
import { OrderFormState } from "./interface";
import { OrderCartApi, useOrderCart } from "./useOrderCart";
import {
  ORDER_PAGE_DESCRIPTION,
  cartEstimatedTotal,
  productCountLabel,
  quantityError,
  resolveOrderFactory,
  selectedFactoryName,
} from "./utils";

interface PortalOrderContentProps {
  token: string;
  /** O plano do escritório inclui o pedido pelo portal. */
  available: boolean;
  horizonDays: number;
  runningOut: PortalReplenishmentItem[];
  search: string | null;
  /** Fábrica pedida na URL (nula = nenhuma) e as que atendem o cliente. */
  factoryId: string | null;
  factories: PortalCatalogFactory[];
  page: number;
  pageSize: number;
  total: number;
  catalog: PortalCatalogItem[];
}

const INITIAL_STATE: OrderFormState = { status: "idle", message: "" };

/**
 * Fazer pedido — com a cara das telas da plataforma: breadcrumb e cabeçalho
 * do módulo, a fábrica logo abaixo, busca no cabeçalho do catálogo e tabelas de produto com a embalagem mínima numa
 * coluna própria.
 *
 * À esquerda, onde escolher (o que está acabando primeiro, depois o
 * catálogo); à direita, a lista do cliente, presa na tela enquanto ele rola.
 * No celular a lista vem no fim e uma faixa no pé leva até ela.
 */
export function PortalOrderContent({
  token,
  available,
  horizonDays,
  runningOut,
  search,
  factoryId,
  factories,
  page,
  pageSize,
  total,
  catalog,
}: PortalOrderContentProps) {
  const [state, formAction, isPending] = useActionState(
    requestOrderAction,
    INITIAL_STATE
  );
  // O orçamento é de UMA fábrica: a escolhida, ou a única que atende.
  const orderFactoryId = resolveOrderFactory(factoryId, factories);
  // A lista, o recado e o formulário moram aqui (e não no corpo): o
  // cabeçalho mostra o valor e envia pelo modal o MESMO formulário da caixa.
  const cart = useOrderCart(token, orderFactoryId);
  const [note, setNote] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { clear } = cart;
  const router = useRouter();
  const { submission, redirectTo } = state;

  // Enviou: a lista e o recado esvaziam e a tela vai para o pedido enviado.
  useEffect(() => {
    if (!submission) return;
    clear();
    setNote("");
    if (redirectTo) router.push(redirectTo);
  }, [submission, redirectTo, clear, router]);
  // O botão segue carregando até a rota trocar — sem isso ele "solta" e o
  // cliente toca de novo achando que não foi.
  const isSending = isPending || Boolean(redirectTo);
  const estimate = cartEstimatedTotal(cart.items);
  const hasErrors = cart.items.some((item) => quantityError(item) !== null);
  const canOrder = available && orderFactoryId !== null;

  const header = (
    <PortalPageHeader
      heading="newOrder"
      title="Fazer pedido"
      description={ORDER_PAGE_DESCRIPTION}
      badges={
        canOrder ? (
          <OrderEstimateBadge count={cart.items.length} estimate={estimate} />
        ) : undefined
      }
      actions={
        canOrder ? (
          <SendOrderModal
            count={cart.items.length}
            estimate={estimate}
            note={note}
            onNote={setNote}
            hasErrors={hasErrors}
            state={state}
            isSending={isSending}
            onConfirm={() => formRef.current?.requestSubmit()}
          />
        ) : undefined
      }
      // Como o "Novo pedido" do escritório: de onde veio › onde está.
      breadcrumb={
        <Breadcrumb.Root>
          <Breadcrumb.Item href={`/p/${token}/enviados`}>
            Pedidos
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>Fazer pedido</Breadcrumb.Item>
        </Breadcrumb.Root>
      }
    />
  );

  if (!available) {
    return (
      <div className="flex flex-col gap-[20px]">
        {header}
        <EmptyState.Root>
          <EmptyState.Icon>
            <ShoppingCart size={36} />
          </EmptyState.Icon>
          <EmptyState.Title>Pedidos pelo portal indisponíveis</EmptyState.Title>
          <EmptyState.Description>
            Para fazer um pedido, fale com o seu representante.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {header}
      <OrderToolbar
        token={token}
        search={search}
        factoryId={orderFactoryId}
        factories={factories}
      />

      {orderFactoryId ? (
        <OrderBody
          key={orderFactoryId}
          token={token}
          factoryId={orderFactoryId}
          factoryName={selectedFactoryName(orderFactoryId, factories)}
          horizonDays={horizonDays}
          runningOut={runningOut}
          search={search}
          page={page}
          pageSize={pageSize}
          total={total}
          catalog={catalog}
          cart={cart}
          note={note}
          onNote={setNote}
          formRef={formRef}
          state={state}
          formAction={formAction}
          isSending={isSending}
        />
      ) : (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Factory size={36} />
          </EmptyState.Icon>
          <EmptyState.Title>
            {factories.length === 0
              ? "Nenhuma fábrica disponível"
              : "Escolha a fábrica do orçamento"}
          </EmptyState.Title>
          <EmptyState.Description>
            {factories.length === 0
              ? "Nenhuma fábrica tem produtos para você agora. Fale com o seu representante."
              : "Cada orçamento é de uma fábrica. Escolha logo acima e os produtos dela aparecem aqui."}
          </EmptyState.Description>
        </EmptyState.Root>
      )}
    </div>
  );
}

interface OrderBodyProps {
  token: string;
  factoryId: string;
  factoryName: string | null;
  horizonDays: number;
  runningOut: PortalReplenishmentItem[];
  search: string | null;
  page: number;
  pageSize: number;
  total: number;
  catalog: PortalCatalogItem[];
  cart: OrderCartApi;
  note: string;
  onNote: (note: string) => void;
  formRef: RefObject<HTMLFormElement | null>;
  state: OrderFormState;
  formAction: (formData: FormData) => void;
  isSending: boolean;
}

/**
 * Os produtos e a lista de UMA fábrica. Remontado a cada troca de fábrica
 * (`key`): a lista é outra, e o estado de "campo tocado" não pode vazar.
 */
function OrderBody({
  token,
  factoryId,
  factoryName,
  horizonDays,
  runningOut,
  search,
  page,
  pageSize,
  total,
  catalog,
  cart,
  note,
  onNote,
  formRef,
  state,
  formAction,
  isSending,
}: OrderBodyProps) {
  const rowHandlers = {
    isInCart: cart.has,
    onAdd: cart.add,
    onRemove: cart.remove,
  };

  return (
    <>
      <div className="desktop:grid-cols-[minmax(0,1fr)_360px] grid grid-cols-1 items-start gap-[20px]">
        <div className="flex min-w-0 flex-col gap-[24px]">
          <RunningOutSection
            // O "acabando" também é só da fábrica do orçamento.
            items={runningOut.filter((item) => item.factoryId === factoryId)}
            horizonDays={horizonDays}
            token={token}
            {...rowHandlers}
          />
          <CatalogSection
            token={token}
            search={search}
            factoryId={factoryId}
            factoryName={factoryName}
            page={page}
            pageSize={pageSize}
            total={total}
            items={catalog}
            {...rowHandlers}
          />
        </div>

        <aside
          aria-label="Minha lista"
          className="desktop:sticky desktop:top-[16px]"
        >
          <OrderCart
            token={token}
            search={search}
            page={page}
            factoryId={factoryId}
            items={cart.items}
            state={state}
            isPending={isSending}
            formAction={formAction}
            note={note}
            onNote={onNote}
            formRef={formRef}
            onQuantity={cart.setQuantity}
            onRemove={cart.remove}
          />
        </aside>
      </div>

      {cart.items.length > 0 ? (
        <PublicPage.ActionBar className="desktop:hidden">
          <Button.Link
            href="#minha-lista"
            appearance="solid"
            color="amber"
            fullWidth
          >
            <Button.Icon icon={ShoppingCart} />
            <Button.Title>
              Ver minha lista ({productCountLabel(cart.items.length)})
            </Button.Title>
          </Button.Link>
        </PublicPage.ActionBar>
      ) : null}
    </>
  );
}
