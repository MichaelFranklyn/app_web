import type { Metadata } from "next";

/**
 * Casca do portal do cliente.
 *
 * Sem `AppProviders`, como o grupo de marketing: nenhuma tela daqui fala com o
 * backend pelo navegador — o token vive no servidor e as páginas chegam
 * prontas. Não há Apollo, não há toasts, não há sessão.
 *
 * `robots: noindex` não é detalhe de SEO: o endereço É a credencial. Uma página
 * destas indexada colocaria o histórico de compras de um cliente real no
 * resultado de busca de qualquer um.
 */
export const metadata: Metadata = {
  title: "Suas compras",
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-(--bg)">{children}</div>;
}
