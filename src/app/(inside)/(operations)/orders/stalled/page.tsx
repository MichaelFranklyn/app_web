import { redirect } from "next/navigation";

/**
 * A antiga página "Pedidos parados" virou duas abas de Pedidos: era a mesma
 * lista da aba de faturamento, mais as entregas a confirmar. O endereço segue
 * vivo para favoritos e links antigos, e cai na aba correspondente.
 */
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) => {
  const { tab } = await searchParams;
  redirect(
    tab === "faturamento" ? "/orders?tab=pending" : "/orders?tab=delivery"
  );
};

export default Page;
