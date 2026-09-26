import StalledOrdersContent from "./content";

/**
 * Pedidos parados — a conferência dos pedidos que seguram o cliente fora da
 * rotina: faturados com a entrega vencida e confirmados sem faturar. Chega-se
 * pelos cartões de /insights e pelo botão da lista de pedidos.
 */
const Page = async () => <StalledOrdersContent />;

export default Page;
