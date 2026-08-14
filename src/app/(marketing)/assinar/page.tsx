import type { Metadata } from "next";
import SubscribeContent from "./content";

/**
 * `/assinar` — o fluxo de contratação, hoje simulado.
 *
 * `robots: noindex` e fora do sitemap: é uma tela de meio de funil, que só faz
 * sentido depois de escolher o plano. Indexada, ela apareceria na busca como se
 * fosse a página de preços — e, pior, uma tela de pagamento de mentira não deve
 * ser algo que se encontra por acaso.
 */
export const metadata: Metadata = {
  title: "Assinatura",
  description:
    "Fluxo de contratação do Girus. Simulação: nenhum pagamento é processado.",
  robots: { index: false, follow: true },
};

const Page = () => {
  return <SubscribeContent />;
};

export default Page;
