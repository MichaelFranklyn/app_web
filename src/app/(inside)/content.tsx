"use client";
import { AppFrame } from "@/components/AppFrame";

import { UserData } from "@/app/(auth)/login/interface";
import { Sidebar } from "@/components/Sidebar";
import { FeatureGate } from "@/components/FeatureGate";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import { FlowTourProvider } from "@/services/flowTour";
import Image from "next/image";
import { CompanyBadge } from "./_components/CompanyBadge";
import { DevRoleSwitch } from "./_components/DevRoleSwitch";
import { ImpersonationBanner } from "./_components/ImpersonationBanner";
import { NotificationCenter } from "./_components/NotificationCenter";
import { OfflineBanner } from "./_components/OfflineBanner";
import { UserMenu } from "./_components/UserMenu";
import { useInsideLayout } from "./useInsideLayout";

/**
 * A casca autenticada: sidebar, topbar e o que mais é comum a toda tela de
 * dentro. Cliente, porque é tudo interação — quem busca dados de servidor é o
 * `layout.tsx` que a envolve.
 */
export default function InsideShell({
  children,
  userData,
  initialCollapsed,
}: {
  children: React.ReactNode;
  /** Quem está logado e a preferência da sidebar, resolvidos no `layout.tsx`
   *  a partir dos cookies — para o primeiro render já sair no formato final. */
  userData: UserData | null;
  initialCollapsed: boolean;
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
  } = useInsideLayout({ userData, initialCollapsed });

  return (
    <FlowTourProvider>
      {/* A casca respira: um padding na página deixa as bordas da sidebar e do
          painel de conteúdo aparecerem, em vez de as duas colarem na janela.
          Só no desktop — no mobile a sidebar é drawer e o conteúdo usa a tela
          inteira. */}
      <AppFrame.Root>
        <AppFrame.Backdrop
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          data-testid="drawer-backdrop"
        />

        <AppFrame.Sidebar drawerOpen={drawerOpen} collapsed={isCollapsed}>
          <AppFrame.CollapseToggle
            collapsed={isCollapsed}
            onToggle={toggleCollapsed}
          />

          {/* As duas marcas ficam no DOM porque quem escolhe entre elas é o
              breakpoint (no mobile a sidebar é drawer e mostra sempre a
              completa), mas só a que o desktop vai mostrar é pré-carregada:
              `priority` mandava as DUAS na frente do conteúdo real, em toda
              tela de dentro. */}
          <Sidebar.Brand collapsed={isCollapsed}>
            {/* Logo completa (expandida e sempre no drawer mobile). */}
            <Image
              src="/horizontal_logo.png"
              alt="Girus"
              width={1059}
              height={247}
              priority={!isCollapsed}
              sizes="232px"
              className={cn("h-auto w-full", isCollapsed && "desktop:hidden")}
            />
            {/* Só o SÍMBOLO quando recolhida no desktop.
              Era `/logo.png`, que apesar do nome é a marca INTEIRA (símbolo +
              "GIRUS SALES CRM SOFTWARE") numa proporção mais quadrada — dentro
              dos 72px da barra recolhida ela virava um borrão ilegível de 51px
              de largura. `/icon-192.png` é o símbolo puro, quadrado, e já vem
              no precache do service worker.
              (Antes do `/logo.png` era um .svg de 148 KB com um PNG embutido em
              base64, servido `unoptimized` porque o otimizador recusa SVG sem
              `dangerouslyAllowSVG`. Como PNG de verdade ele passa pelo
              otimizador e chega no tamanho em que é exibido.) */}
            <Image
              src="/icon-192.png"
              alt="Girus"
              width={192}
              height={192}
              priority={isCollapsed}
              sizes="32px"
              className={cn(
                "hidden h-[28px] w-[28px]",
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
        </AppFrame.Sidebar>

        <AppFrame.Panel>
          {/* Acima da topbar de propósito: numa sessão emprestada, o aviso não
              pode competir por atenção com o resto do cabeçalho. Em sessão
              comum não renderiza nada. */}
          <OfflineBanner />
          <ImpersonationBanner />

          <Topbar.Root>
            <Topbar.Breadcrumb>
              <AppFrame.MenuButton onClick={() => setDrawerOpen(true)} />
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
          <AppFrame.Main className="desktop:pb-[72px]">
            {children}
          </AppFrame.Main>
        </AppFrame.Panel>
      </AppFrame.Root>
    </FlowTourProvider>
  );
}
