"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (`public/sw.js`).
 *
 * Componente e não script inline: a CSP de produção permite `'unsafe-inline'`
 * hoje, mas depender disso amarra o registro do SW a uma permissão que o
 * projeto quer poder tirar.
 *
 * **Só em produção.** Em desenvolvimento o service worker interfere com o HMR
 * do Turbopack — ele serve o asset gravado enquanto o dev server já mandou
 * outro, e o sintoma é "salvei o arquivo e a tela não mudou". No E2E também
 * fica de fora: o Playwright sobe um build de produção (`.next-e2e`), e um SW
 * cacheando entre specs deixaria um teste vendo a página do anterior.
 *
 * O `load` importa: registrar durante a hidratação faz o download do SW
 * competir com o JS que a tela ainda precisa para ficar interativa. Depois do
 * load, a rede está livre.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (process.env.NEXT_PUBLIC_DISABLE_SW === "1") return;
    if (!("serviceWorker" in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch((erro) => {
        // Não propaga: SW é melhoria, não requisito. Navegador em modo privado
        // e alguns bloqueadores recusam o registro, e a tela precisa continuar
        // funcionando igual.
        console.warn("[sw] registro falhou", erro);
      });
    };

    if (document.readyState === "complete") {
      registrar();
      return;
    }
    window.addEventListener("load", registrar);
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
