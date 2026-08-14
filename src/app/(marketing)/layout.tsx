import { MarketingFooter } from "./_components/MarketingFooter";
import { MarketingHeader } from "./_components/MarketingHeader";

/**
 * Casca das páginas públicas (landing e, adiante, preços/termos/privacidade).
 *
 * Sem `AppProviders`: nenhuma tela deste grupo fala com o backend, então não há
 * Apollo nem toasts no bundle — é o que mantém a primeira pintura barata para
 * quem chega de busca ou de anúncio.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg)">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
