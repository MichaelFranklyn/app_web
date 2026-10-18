"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import type { VisitContactType } from "@/utils/visit";
import { Users } from "lucide-react";

import { PriorityClient, RegionGroup, WeekSelection } from "../../interface";
import { RegionGroupCard } from "../RegionGroupCard";

interface Props {
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
  groups: RegionGroup[];
  search: string;
  selection: WeekSelection;
  onToggle: (client: PriorityClient) => void;
  onToggleMany: (clients: PriorityClient[], on: boolean) => void;
  onContactTypeChange: (
    clientId: string,
    contactType: VisitContactType
  ) => void;
  onWeekdayChange: (clientId: string, weekday: number | null) => void;
}

/** Os prioritários, uma cidade embaixo da outra, todas abertas. */
export function PriorityList({
  loading,
  hasError,
  onRetry,
  groups,
  search,
  ...handlers
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-12" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <Loading.Skeleton key={index} className="h-[96px] w-full" />
        ))}
      </div>
    );
  }
  if (hasError) return <QueryError onRetry={onRetry} />;
  if (groups.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Users />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhum cliente para mostrar</EmptyState.Title>
        <EmptyState.Description>
          {search
            ? "Nenhum cliente com esse nome, bairro ou cidade."
            : "Não há clientes disponíveis agora. Veja em Toda a carteira ou na lista de quem está fora."}
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) => (
        <RegionGroupCard key={group.key} group={group} {...handlers} />
      ))}
    </div>
  );
}
