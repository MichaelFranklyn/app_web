"use client";

import { Button } from "@/components/Button";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import { logout } from "@/utils/auth/logout";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
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
    <div className="flex h-screen overflow-hidden">
      {drawerOpen && (
        <div
          data-testid="platform-drawer-backdrop"
          className="desktop:hidden fixed inset-0 z-[80] bg-black/40"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar.Root
        className={cn(
          "z-[90] w-[232px] shrink-0",
          "fixed inset-y-0 left-0 transition-transform duration-200 ease-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
          "desktop:static desktop:z-auto desktop:translate-x-0"
        )}
      >
        <Sidebar.Brand>
          <div className="flex items-center gap-[8px]">
            <ShieldCheck size={20} className="text-(--purple)" />
            <span className="text-[15px] font-(--weight-semibold) text-(--text)">
              Plataforma
            </span>
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
      </Sidebar.Root>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar.Root>
          <Topbar.Breadcrumb>
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setDrawerOpen(true)}
              className="desktop:hidden mr-4 -ml-4 inline-flex cursor-pointer items-center justify-center rounded p-4 text-(--text) transition-colors hover:bg-(--bg3)"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <span className="text-[13px] tracking-[0.12em] text-(--muted2) uppercase">
              Console da plataforma
            </span>
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

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
