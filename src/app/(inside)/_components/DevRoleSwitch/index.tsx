"use client";

import { UserData } from "@/app/(auth)/login/interface";
import {
  getCookie,
  removeCookie,
  setCookie,
} from "@/utils/cookies/clientCookie";
import { FlaskConical, X } from "lucide-react";
import { useEffect, useState } from "react";

// Backup do userData original (uma vez) para restaurar o papel de verdade.
const BACKUP_KEY = "devUserDataBackup";

// Só em desenvolvimento: em produção o componente nunca renderiza.
const IS_DEV = process.env.NODE_ENV !== "production";

type Role = UserData["role"];

/**
 * Switch APENAS DE DEV para pré-visualizar a plataforma como admin/owner ou como
 * vendedor sem trocar de conta. Reescreve o papel no cookie `userData` e recarrega
 * — assim TODO o gating client-side (nav, comissões, dashboards) reflete o modo.
 *
 * Escopo: é só UI client-side. O backend e páginas com gate no servidor continuam
 * usando o token real, então os DADOS não mudam de escopo com o switch.
 */
export function DevRoleSwitch() {
  const [role, setRole] = useState<Role | null>(null);
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    if (!IS_DEV) return;
    setRole(getCookie<UserData>("userData")?.role ?? null);
    setOverriding(!!getCookie<UserData>(BACKUP_KEY));
  }, []);

  if (!IS_DEV || !role) return null;

  const applyRole = (target: Role) => {
    const current = getCookie<UserData>("userData");
    if (!current || current.role === target) return;
    // Backup do original só na primeira sobrescrita, para o reset ser fiel.
    if (!getCookie<UserData>(BACKUP_KEY)) setCookie(BACKUP_KEY, current);
    setCookie("userData", { ...current, role: target });
    window.location.reload();
  };

  const reset = () => {
    const backup = getCookie<UserData>(BACKUP_KEY);
    if (backup) setCookie("userData", backup);
    removeCookie(BACKUP_KEY);
    window.location.reload();
  };

  const isSeller = role === "SELLER";

  const segment = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-(--radius-sm) px-8 py-2 text-[11px] font-(--weight-semibold) transition-colors ${
        active
          ? "bg-(--amber) text-black"
          : "text-(--muted) hover:text-(--text)"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      title="Somente em dev: pré-visualiza a UI como admin/owner ou vendedor (não muda os dados do backend)."
      className="flex items-center gap-4 rounded-(--radius-md) border border-dashed border-(--amber)/50 bg-(--bg3) px-6 py-2"
    >
      <FlaskConical size={13} className="text-(--amber)" />
      <span className="text-[10px] font-(--weight-bold) tracking-wide text-(--amber)">
        DEV
      </span>
      <div className="flex items-center">
        {segment("Owner", !isSeller, () => applyRole("OWNER" as Role))}
        {segment("Vendedor", isSeller, () => applyRole("SELLER" as Role))}
      </div>
      {overriding && (
        <button
          type="button"
          onClick={reset}
          title="Voltar ao papel real da conta"
          aria-label="Voltar ao papel real da conta"
          className="ml-2 cursor-pointer text-(--muted) transition-colors hover:text-(--red)"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
