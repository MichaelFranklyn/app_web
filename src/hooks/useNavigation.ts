"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // FUNÇÃO PARA "IR" (Navega para frente e salva os filtros atuais)
  const navigateTo = useCallback(
    (url: string, saveCurrentState = true) => {
      if (saveCurrentState && typeof window !== "undefined") {
        const currentQuery = searchParams.toString();
        const currentFullUrl = currentQuery
          ? `${pathname}?${currentQuery}`
          : pathname;

        const baseKey = pathname.split("/")[1];
        sessionStorage.setItem(`back_url_${baseKey}`, currentFullUrl);
      }

      startTransition(() => {
        router.push(url);
      });
    },
    [router, pathname, searchParams]
  );

  const navigateBack = useCallback(
    (fallbackBaseUrl: string) => {
      startTransition(() => {
        if (typeof window !== "undefined") {
          const baseKey = fallbackBaseUrl.split("/")[1];
          const savedUrl = sessionStorage.getItem(`back_url_${baseKey}`);

          if (savedUrl) {
            router.push(savedUrl);
            return;
          }
        }

        router.push(fallbackBaseUrl);
      });
    },
    [router]
  );

  return { navigateTo, navigateBack, isPending };
}
