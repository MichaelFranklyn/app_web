"use client";

import { Tabs } from "@/components/Tabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="tablet:px-32 px-16 pt-20">
        <Tabs.NavList className="mb-0">
          <Tabs.NavItem href="/dashboard" exact>
            Visão Geral
          </Tabs.NavItem>
          <Tabs.NavItem href="/dashboard/analytics">Análises</Tabs.NavItem>
        </Tabs.NavList>
      </div>
      {children}
    </div>
  );
}
