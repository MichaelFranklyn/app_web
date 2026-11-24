"use client";

import { AppFrame } from "@/components/AppFrame";
import { Avatar } from "@/components/Avatar";
import { BrandLogo } from "@/components/BrandLogo";
import { PageContent } from "@/components/PageContent";
import { Sidebar } from "@/components/Sidebar";
import { Title } from "@/components/Title";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import { companyInitials } from "@/utils/company";
import { mediaUrl } from "@/utils/media";
import { PortalProfile } from "../../interface";
import { usePortalShell } from "./usePortalShell";

interface PortalShellProps {
  token: string;
  profile: PortalProfile;
  children: React.ReactNode;
}

/**
 * Casca do portal do cliente — a MESMA moldura do sistema (marca na sidebar,
 * menu recolhível, empresa na topbar e as páginas dentro de `PageContent`),
 * para o cliente e o representante falarem da "mesma tela".
 *
 * O escritório fica na topbar, como no sistema: o cliente recebeu o endereço
 * num aplicativo de mensagem, e é reconhecendo quem o atende que ele sabe que
 * aquilo não é golpe. O nome dele fica no pé do menu.
 */
export function PortalShell({ token, profile, children }: PortalShellProps) {
  const {
    navItems,
    active,
    drawerOpen,
    setDrawerOpen,
    collapsed,
    toggleCollapsed,
  } = usePortalShell(token, profile.canRequestReplenishment);

  const city = [profile.clientCity, profile.clientState]
    .filter(Boolean)
    .join(" - ");

  return (
    <AppFrame.Root>
      <AppFrame.Backdrop
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data-testid="portal-drawer-backdrop"
      />

      <AppFrame.Sidebar drawerOpen={drawerOpen} collapsed={collapsed}>
        <AppFrame.CollapseToggle
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />

        <Sidebar.Brand collapsed={collapsed}>
          <BrandLogo
            priority={!collapsed}
            sizes="160px"
            className={cn("w-[148px]", collapsed && "desktop:hidden")}
          />
          <BrandLogo
            variant="mark"
            priority={collapsed}
            sizes="32px"
            className={cn(
              "hidden h-[28px] w-[28px]",
              collapsed && "desktop:block"
            )}
          />
        </Sidebar.Brand>

        <Sidebar.Content>
          <nav aria-label="Seções do portal" className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Sidebar.Item
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={active?.href === item.href}
                collapsed={collapsed}
                aria-current={active?.href === item.href ? "page" : undefined}
              >
                {item.label}
              </Sidebar.Item>
            ))}
          </nav>
        </Sidebar.Content>

        <Sidebar.Bottom
          name={profile.clientName}
          role={city || undefined}
          initials={companyInitials(profile.clientName)}
          collapsed={collapsed}
        />
      </AppFrame.Sidebar>

      <AppFrame.Panel>
        <Topbar.Root>
          <Topbar.Breadcrumb>
            <AppFrame.MenuButton onClick={() => setDrawerOpen(true)} />
            {/* Igual ao selo da empresa do sistema; aqui por props, porque o
                portal não tem sessão (o perfil chega pronto do servidor). */}
            <div
              className="flex min-w-0 items-center gap-8"
              title={profile.companyName}
            >
              <Avatar
                size="sm"
                color="amber"
                src={mediaUrl(profile.companyLogoUrl)}
                alt={profile.companyName}
                initials={companyInitials(profile.companyName)}
                className="shrink-0"
              />
              <Title variant="body-sm" weight="semibold" className="truncate">
                {profile.companyName}
              </Title>
            </div>
          </Topbar.Breadcrumb>
        </Topbar.Root>

        <AppFrame.Main>
          <PageContent>{children}</PageContent>
        </AppFrame.Main>
      </AppFrame.Panel>
    </AppFrame.Root>
  );
}
