"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { factoryName } from "@/utils/company";

import { SellersTab } from "../_components/SellersTab";
import { useFactoryDetail } from "../context";

export default function FactorySellersPage() {
  const { companyFactory } = useFactoryDetail();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [autoOpenLink, setAutoOpenLink] = useState(false);

  // Fluxo pós-criação: ?link=1 abre o modal uma vez e o parâmetro é removido
  // da URL para não reabrir em refresh/voltar.
  useEffect(() => {
    if (searchParams.get("link") === "1") {
      setAutoOpenLink(true);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  return (
    <SellersTab
      factoryId={companyFactory.factory.id}
      factoryName={factoryName(companyFactory.factory) ?? ""}
      autoOpenLink={autoOpenLink}
    />
  );
}
