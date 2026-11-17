import type { Metadata } from "next";
import SubscribeContent from "./content";

/**
 * `/assinar` — o fluxo de contratação: escolhe o plano e segue para a página
 * de pagamento.
 *
 * `robots: noindex` e fora do sitemap: é uma tela de meio de funil, que só faz
 * sentido depois de escolher o plano. Indexada, ela apareceria na busca como se
 * fosse a página de preços.
 */
export const metadata: Metadata = {
  title: "Assinatura",
  description:
    "Assine o Itinus: escolha o plano e pague com cartão, Pix ou boleto.",
  robots: { index: false, follow: true },
};

const Page = () => {
  return <SubscribeContent />;
};

export default Page;
