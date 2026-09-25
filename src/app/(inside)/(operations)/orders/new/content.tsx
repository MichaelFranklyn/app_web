"use client";

import { NewOrderForm } from "./_components/NewOrderForm";
import { NewOrderOrigin } from "./interface";
import { SellerChoice, useCascadeDetails } from "./useCascadeDetails";
import { useClientDetails } from "./useClientDetails";
import { useFactoryDetails } from "./useFactoryDetails";
import { useVisitDetails } from "./useVisitDetails";
import { useNewOrderCore } from "./useNewOrderCore";
import { BackLink } from "./utils";

interface Props extends SellerChoice {
  origin: NewOrderOrigin;
  back: BackLink;
}

/**
 * Uma página, três portas: a lista (cascata vendedor → fábrica → cliente), o
 * cliente (escolhe o vínculo vendedor → fábrica) e a fábrica (escolhe o vínculo
 * vendedor → cliente) e a visita (tudo decidido; o pedido fica amarrado a
 * ela). Cada porta é um componente porque cada uma usa hooks
 * diferentes — e hook não pode ser condicional.
 */
export default function NewOrderContent({ origin, back, ...seller }: Props) {
  if (origin.kind === "visit") {
    return <FromVisit origin={origin} back={back} />;
  }
  if (origin.kind === "client") {
    return <FromClient clientId={origin.clientId} back={back} />;
  }
  if (origin.kind === "factory") {
    return <FromFactory factoryId={origin.factoryId} back={back} />;
  }
  return <FromOrders seller={seller} back={back} />;
}

function FromOrders({
  seller,
  back,
}: {
  seller: SellerChoice;
  back: BackLink;
}) {
  const core = useNewOrderCore();
  const details = useCascadeDetails(core, seller);
  return (
    <NewOrderForm
      core={core}
      details={details}
      back={back}
      description="Preencha os dados do pedido e, se quiser, já adicione os itens. Os itens também podem ser incluídos depois, no próprio pedido."
      itemsPendingHint="Escolha a fábrica em “Dados do pedido” para ver os produtos dela."
    />
  );
}

function FromClient({ clientId, back }: { clientId: string; back: BackLink }) {
  const core = useNewOrderCore({ clientId });
  const details = useClientDetails(core, clientId);
  return (
    <NewOrderForm
      core={core}
      details={details}
      back={back}
      description="Escolha por qual vendedor e fábrica o pedido sai e, se quiser, já adicione os itens."
      itemsPendingHint="Escolha o vínculo vendedor → fábrica em “Dados do pedido” para ver os produtos da fábrica."
    />
  );
}

function FromFactory({
  factoryId,
  back,
}: {
  factoryId: string;
  back: BackLink;
}) {
  const core = useNewOrderCore({ factoryId });
  const details = useFactoryDetails(core, factoryId);
  return (
    <NewOrderForm
      core={core}
      details={details}
      back={back}
      description="Pedido desta fábrica: escolha o vendedor e o cliente e, se quiser, já adicione os itens."
      itemsPendingHint=""
    />
  );
}

function FromVisit({
  origin,
  back,
}: {
  origin: Extract<NewOrderOrigin, { kind: "visit" }>;
  back: BackLink;
}) {
  const core = useNewOrderCore({
    factoryId: origin.factoryId,
    clientId: origin.clientId,
  });
  const details = useVisitDetails(core, origin);
  return (
    <NewOrderForm
      core={core}
      details={details}
      back={back}
      description="Pedido registrado nesta visita. Se quiser, já adicione os itens."
      itemsPendingHint=""
    />
  );
}
