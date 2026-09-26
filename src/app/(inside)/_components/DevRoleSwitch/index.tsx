"use client";
import { ToggleGroup } from "@/components/ToggleGroup";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

import { Title } from "@/components/Title";
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

  return (
    <Card.Root
      inset
      tone="muted"
      dashed
      title="Somente em dev: pré-visualiza a UI como admin/owner ou vendedor (não muda os dados do backend)."
      className="w-auto border-(--amber)/50"
    >
      <Card.Body
        padding="none"
        className="flex-row items-center gap-4 px-6 py-2"
      >
        <FlaskConical size={13} className="text-(--amber)" />
        <Title variant="label" weight="bold" color="amber">
          DEV
        </Title>
        <ToggleGroup
          size="xs"
          aria-label="Papel da pré-visualização"
          options={[
            { value: "OWNER", label: "Owner" },
            { value: "SELLER", label: "Vendedor" },
          ]}
          value={isSeller ? "SELLER" : "OWNER"}
          onChange={(target) => applyRole(target as Role)}
        />
        {overriding && (
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="xs"
            isIconOnly
            label="Voltar ao papel real da conta"
            onClick={reset}
          >
            <Button.Icon icon={X} />
          </Button.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
