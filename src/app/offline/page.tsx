import { OfflineContent } from "./content";

/**
 * A tela que o service worker serve quando a navegação falha por falta de rede.
 *
 * Fora de `(inside)` de propósito: o layout autenticado busca dados no servidor
 * (empresa, permissões, notificações), e é exatamente isso que não existe sem
 * rede — herdá-lo faria a página offline precisar da rede para dizer que não há
 * rede.
 *
 * Precisa ser estática. O SW a guarda no `install` (ver `SHELL_ASSETS` em
 * `public/sw.js`), e o que ele guarda é o HTML pronto: qualquer dado de servidor
 * aqui viraria um retrato congelado no dia da instalação.
 */
export const dynamic = "force-static";

export const metadata = {
  title: "Sem conexão",
  // Não faz sentido num índice de busca, e a página existe só para o SW.
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineContent />;
}
