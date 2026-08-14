import type { Metadata } from "next";
import PricingContent from "./content";

/**
 * `/precos` — o comparativo linha a linha, para quem já entendeu o produto na
 * home e quer saber onde a operação dele se encaixa.
 *
 * Título e descrição próprios: esta é a segunda página mais buscada de um site
 * de software, e quem procura "girus preço" precisa cair aqui, não na home.
 */
export const metadata: Metadata = {
  title: "Preços",
  description:
    "Compare os planos do Girus linha a linha: pedidos, comissões, rotina de visita, relatórios e o tamanho de operação que cada um atende.",
  alternates: { canonical: "/precos" },
};

const Page = () => {
  return <PricingContent />;
};

export default Page;
