"use client";

import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { BellRing } from "lucide-react";

interface Props {
  onEnable: () => void;
  isLoading: boolean;
}

/**
 * O convite para receber os avisos no aparelho, no rodapé do sino.
 *
 * Aqui, e não numa faixa no topo do sistema, porque este é o único lugar em que
 * a pessoa JÁ está pensando em notificação — o convite responde a uma pergunta
 * que ela acabou de fazer, em vez de interromper o que estava fazendo.
 *
 * Quem decide se ele aparece é o `status` do push: some assim que o aparelho
 * está inscrito, e nunca chega a existir para quem bloqueou, para quem está num
 * navegador sem suporte (o iPhone fora da tela de início) ou num ambiente sem
 * chave VAPID. O perfil continua sendo o lugar de desligar — aqui só se liga.
 */
export function PushInviteRow({ onEnable, isLoading }: Props) {
  return (
    <button
      type="button"
      onClick={onEnable}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-8 border-t border-(--border) px-12 py-10 text-left",
        "bg-(--amber-bg)/40 transition-colors hover:bg-(--amber-bg)",
        "disabled:cursor-default disabled:opacity-60"
      )}
    >
      {isLoading ? (
        <Loading.Spinner size="sm" colorClass="amber" />
      ) : (
        <BellRing size={14} className="shrink-0 text-(--amber)" />
      )}
      <div className="flex min-w-0 flex-col gap-2">
        <Title variant="micro" weight="semibold" color="amber">
          Receber estes avisos no aparelho
        </Title>
        {/* O que vai acontecer ao tocar, escrito antes de acontecer: o pop-up do
            navegador aparece por cima de tudo e assusta quem não o esperava —
            e quem responde "Bloquear" não é perguntado outra vez. */}
        <Title variant="micro" color="muted">
          Toque e responda “Permitir” quando o navegador perguntar.
        </Title>
      </div>
    </button>
  );
}
