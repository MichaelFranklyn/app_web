"use client";

import { Sidebar } from "@/components/Sidebar";
import { FeatureGate } from "@/components/FeatureGate";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import { FlowTourProvider } from "@/services/flowTour";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Image from "next/image";
import { CompanyBadge } from "./_components/CompanyBadge";
import { DevRoleSwitch } from "./_components/DevRoleSwitch";
import { ImpersonationBanner } from "./_components/ImpersonationBanner";
import { NotificationCenter } from "./_components/NotificationCenter";
import { UserMenu } from "./_components/UserMenu";
import { useInsideLayout } from "./useInsideLayout";

/**
 * A casca autenticada: sidebar, topbar e o que mais é comum a toda tela de
 * dentro. Cliente, porque é tudo interação — quem busca dados de servidor é o
 * `layout.tsx` que a envolve.
 */
export default function InsideShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    pathname,
    isDayRoute,
    todayIso,
    drawerOpen,
    setDrawerOpen,
    isCollapsed,
    toggleCollapsed,
    navItems,
    userName,
    userRole,
    userInitials,
    canManageCompany,
  } = useInsideLayout();

  return (
    <FlowTourProvider>
      {/* A casca respira: um padding na página deixa as bordas da sidebar e do
          painel de conteúdo aparecerem, em vez de as duas colarem na janela.
          Só no desktop — no mobile a sidebar é drawer e o conteúdo usa a tela
          inteira. */}
      <div className="desktop:gap-16 desktop:p-12 flex h-screen overflow-hidden bg-(--bg3)">
        {/* Backdrop do drawer (só mobile/tablet, quando aberto) */}
        {drawerOpen && (
          <div
            data-testid="drawer-backdrop"
            className="desktop:hidden fixed inset-0 z-[80] bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        )}

        <Sidebar.Root
          className={cn(
            "z-[90] w-[232px] shrink-0",
            // Mobile/tablet: drawer fixo que desliza da esquerda — colado na
            // janela, então sem cantos arredondados.
            "fixed inset-y-0 left-0 rounded-none transition-[transform,width] duration-200 ease-out",
            "desktop:rounded-(--radius-lg)",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop: volta a ser fixa em fluxo; largura varia se recolhida.
            "desktop:static desktop:z-auto desktop:translate-x-0",
            isCollapsed ? "desktop:w-[72px]" : "desktop:w-[232px]",
            // Âncora para o botão flutuante de recolher (borda direita).
            "desktop:relative"
          )}
        >
          {/* Recolher/expandir — botão flutuante na borda direita (só desktop;
            no mobile a sidebar é drawer). */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "absolute top-[74px] right-0 z-[95] hidden h-[24px] w-[24px] translate-x-1/2 items-center justify-center",
              "rounded-full border border-(--border) bg-(--bg2) text-(--muted) shadow-(--shadow-sm)",
              "desktop:flex cursor-pointer transition-colors hover:border-(--border2) hover:text-(--text)"
            )}
          >
            {isCollapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} />
            )}
          </button>

          <Sidebar.Brand collapsed={isCollapsed}>
            {/* Logo completa (expandida e sempre no drawer mobile). */}
            <Image
              src="/horizontal_logo.png"
              alt="Girus"
              width={1059}
              height={247}
              priority
              className={cn("h-auto w-full", isCollapsed && "desktop:hidden")}
            />
            {/* Só o ícone quando recolhida no desktop. `unoptimized` evita o
              otimizador do next/image, que recusa SVG sem dangerouslyAllowSVG. */}
            <Image
              src="/logo.svg"
              alt="Girus"
              width={1500}
              height={907}
              priority
              unoptimized
              className={cn(
                "hidden h-[28px] w-auto",
                isCollapsed && "desktop:block"
              )}
            />
          </Sidebar.Brand>

          <Sidebar.Content>
            {navItems.map((item, i) => {
              if ("divider" in item) return <Sidebar.Divider key={i} />;
              if ("section" in item)
                return (
                  <Sidebar.Section key={i} collapsed={isCollapsed}>
                    {item.section}
                  </Sidebar.Section>
                );

              if ("todayRoute" in item) {
                const { label, icon } = item as {
                  label: string;
                  icon: React.ElementType;
                };
                // Antes de resolver a data no cliente, aponta para a grade semanal
                // (evita divergência de hidratação com o horário do servidor).
                const href = todayIso ? `/routines/${todayIso}` : "/routines";
                return (
                  <Sidebar.Item
                    key="rota-do-dia"
                    href={href}
                    icon={icon}
                    active={isDayRoute}
                    collapsed={isCollapsed}
                    data-tour-route="/routines/today"
                  >
                    {label}
                  </Sidebar.Item>
                );
              }

              const { href, label, icon, matchPrefix, tourRoute } = item as {
                href: string;
                label: string;
                icon: React.ElementType;
                matchPrefix?: string;
                tourRoute?: string;
              };

              // matchPrefix: item cujo href aponta para uma sub-rota (ex.: uma
              // aba padrão), mas que deve ficar ativo em todo o prefixo.
              const activeBase = matchPrefix ?? href;
              const isActive =
                href === "/routines"
                  ? pathname === "/routines"
                  : pathname === activeBase ||
                    pathname.startsWith(`${activeBase}/`);

              return (
                <Sidebar.Item
                  key={href}
                  href={href}
                  icon={icon}
                  active={isActive}
                  collapsed={isCollapsed}
                  data-tour-route={tourRoute ?? href}
                >
                  {label}
                </Sidebar.Item>
              );
            })}
          </Sidebar.Content>

          <Sidebar.Bottom
            name={userName}
            role={userRole}
            initials={userInitials}
            collapsed={isCollapsed}
          />
        </Sidebar.Root>

        {/* O conteúdo também é um painel cercado: mesma borda e mesmo raio da
            sidebar. `overflow-hidden` para a topbar e o `main` não vazarem por
            cima dos cantos arredondados. */}
        <div className="desktop:rounded-(--radius-lg) desktop:border desktop:border-(--border) flex flex-1 flex-col overflow-hidden bg-(--bg)">
          {/* Acima da topbar de propósito: numa sessão emprestada, o aviso não
              pode competir por atenção com o resto do cabeçalho. Em sessão
              comum não renderiza nada. */}
          <ImpersonationBanner />

          <Topbar.Root>
            <Topbar.Breadcrumb>
              {/* Hambúrguer: abre o drawer no mobile/tablet; some no desktop. */}
              <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setDrawerOpen(true)}
                className="desktop:hidden mr-4 -ml-4 inline-flex cursor-pointer items-center justify-center rounded p-4 text-(--text) transition-colors hover:bg-(--bg3)"
              >
                <Menu size={20} strokeWidth={2} />
              </button>
              {/* Quem está logado, não onde está: o título da página já aparece
                  logo abaixo, no header, e repetir o rótulo aqui era ler a mesma
                  palavra duas vezes. */}
              <CompanyBadge />
            </Topbar.Breadcrumb>

            <Topbar.Actions>
              <DevRoleSwitch />
              {/* Notificação automática é recurso de plano: sem ele o sino
                  ficaria sempre vazio (o backend recusa a consulta). */}
              <FeatureGate feature="NOTIFICATIONS">
                <NotificationCenter />
              </FeatureGate>
              <UserMenu
                name={userName}
                role={userRole}
                initials={userInitials}
                canManageCompany={canManageCompany}
              />
            </Topbar.Actions>
          </Topbar.Root>

          {/* `pb`: o lançador de tutoriais flutua no canto inferior direito
              (fixo na janela). Sem esse respiro no fim da área rolável, a
              última linha de uma lista longa termina embaixo dele — visível,
              mas fora de alcance do clique. Em página curta não muda nada: o
              conteúdo não chega ao fim do scroll. */}
          <main className="desktop:pb-[72px] flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </FlowTourProvider>
  );
}
