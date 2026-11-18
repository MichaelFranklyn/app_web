"use client";

import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/Badges";
import { RowList } from "@/components/RowList";
import { Title } from "@/components/Title";

import { SetupFactory } from "../../interface";
import { factoryPendingItem } from "../../utils";

/**
 * Cada fábrica vinculada com o que falta nela. A linha leva direto à aba que
 * resolve a pendência — prazo, depois vendedores, depois tabela.
 */
export function SetupFactoryList({ factories }: { factories: SetupFactory[] }) {
  if (factories.length === 0) return null;

  return (
    <RowList.Root>
      {factories.map((factory) => {
        const pending = factoryPendingItem(factory);
        return (
          <RowList.Item
            key={factory.companyFactoryId}
            href={pending?.href ?? `/factories/${factory.companyFactoryId}`}
          >
            <div className="flex items-center gap-12 py-6">
              <Title
                variant="body-sm"
                weight="semibold"
                className="min-w-0 flex-1"
              >
                {factory.name}
              </Title>
              <Badge.Root
                color={pending ? "warning" : "green"}
                appearance="tinted"
                size="sm"
              >
                <Badge.Text>{pending ? pending.label : "Pronta"}</Badge.Text>
              </Badge.Root>
              <ChevronRight
                aria-hidden
                size={16}
                className="shrink-0 text-(--color-text-muted)"
              />
            </div>
          </RowList.Item>
        );
      })}
    </RowList.Root>
  );
}
