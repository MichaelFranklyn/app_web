"use client";

import { Tabs } from "@/components/Tabs";
import { useSearchParams } from "next/navigation";

import { REPORT_TABS, REPORTS_BASE_PATH } from "../../utils";

/**
 * As abas dos relatórios, como navegação de rota (cada aba é uma página).
 *
 * O querystring atual viaja no href de propósito: o período e o vendedor
 * escolhidos são o recorte do TRABALHO, não de uma tela — quem filtrou julho de
 * um vendedor e clicou em "Comissões" espera continuar em julho daquele
 * vendedor, e não recomeçar do mês corrente.
 */
export function ReportTabsNav() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <Tabs.NavList>
      {REPORT_TABS.map((tab) => (
        <Tabs.NavItem
          key={tab.slug}
          href={`${REPORTS_BASE_PATH}/${tab.slug}${suffix}`}
          exact
        >
          {tab.label}
        </Tabs.NavItem>
      ))}
    </Tabs.NavList>
  );
}
