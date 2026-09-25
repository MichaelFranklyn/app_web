import { resolveOrderSellerContext } from "../_shared/sellerContext";
import NewOrderContent from "./content";
import { resolveBackLink, resolveOrigin } from "./utils";

interface Props {
  searchParams: Promise<{
    clientId?: string;
    factoryId?: string;
    visitItemId?: string;
    sellerId?: string;
    from?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;
  // Gestor escolhe o vendedor do pedido; o vendedor logado, não — o dele
  // entra implícito (mesma regra da lista).
  const { isManager, ownSellerId } = await resolveOrderSellerContext();
  const origin = resolveOrigin(params);

  return (
    <NewOrderContent
      origin={origin}
      back={resolveBackLink(origin, params.from)}
      canSelectSeller={isManager}
      ownSellerId={ownSellerId}
    />
  );
};

export default Page;
