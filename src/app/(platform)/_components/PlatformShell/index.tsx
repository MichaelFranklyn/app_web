"use client";
import { AppFrame } from "@/components/AppFrame";

import { Title } from "@/components/Title";
import { Button } from "@/components/Button";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { logout } from "@/utils/auth/logout";
import { LogOut, ShieldCheck } from "lucide-react";
import { usePlatformShell } from "./usePlatformShell";

/**
 * Casca do console da plataforma.
 *
 * Deliberadamente diferente da casca do sistema: marca "Plataforma" no lugar da
 * logo do tenant e nenhuma barra de empresa. O SU trabalha nas duas — a
 * diferença visual é o que evita ele achar que está olhando os números de uma
 * empresa quando está olhando os de todas.
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const {
    navItems,
    drawerOpen,
    setDrawerOpen,
    isActive,
    isSu,
    userName,
    userInitials,
  } = usePlatformShell();

  return (
    <AppFrame.Root>
      <AppFrame.Backdrop
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data-testid="platform-drawer-backdrop"
      />

      <AppFrame.Sidebar drawerOpen={drawerOpen}>
        <Sidebar.Brand>
          <div className="flex items-center gap-[8px]">
            <ShieldCheck size={20} className="text-(--purple)" />
            <Title variant="body-md" weight="semibold">
              Plataforma
            </Title>
          </div>
        </Sidebar.Brand>

        <Sidebar.Content>
          {navItems.map((item, i) => {
            if ("divider" in item) return <Sidebar.Divider key={i} />;
            if ("section" in item)
              return <Sidebar.Section key={i}>{item.section}</Sidebar.Section>;

            const { href, label, icon, matchPrefix } = item as {
              href: string;
              label: string;
              icon: React.ElementType;
              matchPrefix?: string;
            };

            return (
              <Sidebar.Item
                key={href}
                href={href}
                icon={icon}
                active={isActive(href, matchPrefix)}
              >
                {label}
              </Sidebar.Item>
            );
          })}
        </Sidebar.Content>

        <Sidebar.Bottom
          name={userName}
          // O papel é escrito, não presumido: o console agora tem dois, e
          // chamar o suporte de "Super Admin" no rodapé mentiria sobre o
          // que aquela sessão pode fazer.
          role={isSu ? "Super Admin" : "Suporte"}
          initials={userInitials}
        />
      </AppFrame.Sidebar>

      <AppFrame.Panel>
        <Topbar.Root>
          <Topbar.Breadcrumb>
            <AppFrame.MenuButton onClick={() => setDrawerOpen(true)} />
            <Title variant="label" color="muted2">
              Console da plataforma
            </Title>
          </Topbar.Breadcrumb>

          <Topbar.Actions>
            {/* Sair é sair da sessão, não "voltar ao sistema": o console é o
                único lugar do SU (o middleware o devolve para cá se ele tentar
                abrir uma rota do tenant). O caminho para dentro de uma empresa
                é a impersonação, a partir do detalhe dela. */}
            <Button.Root appearance="ghost" size="sm" onClick={logout}>
              <Button.Icon icon={LogOut} />
              <Button.Title>Sair</Button.Title>
            </Button.Root>
          </Topbar.Actions>
        </Topbar.Root>

        <AppFrame.Main>{children}</AppFrame.Main>
      </AppFrame.Panel>
    </AppFrame.Root>
  );
}
