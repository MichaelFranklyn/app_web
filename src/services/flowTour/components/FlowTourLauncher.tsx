"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { Check, ChevronRight, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useFlowTourLauncher } from "../FlowTourProvider";
import { getFlowsForRoute } from "../flows";
import { FlowDefinition, FlowProgressStatus } from "../interface";
import { useUserRole } from "../useUserRole";

const DEFAULT_GROUP = "Outros";

// Badge de status do fluxo (canto direito do card).
const StatusBadge = ({ status }: { status: FlowProgressStatus }) => {
  if (status === "completed") {
    return (
      <Badge.Root color="green" appearance="tinted" size="xs">
        <Check size={12} strokeWidth={2.5} />
        <Badge.Text>Concluído</Badge.Text>
      </Badge.Root>
    );
  }

  if (status === "pending") {
    return (
      <Badge.Root color="warning" appearance="tinted" size="xs">
        <Badge.Text>Em andamento</Badge.Text>
      </Badge.Root>
    );
  }

  return (
    <Badge.Root color="blue" appearance="tinted" size="xs">
      <Badge.Text>Novo</Badge.Text>
    </Badge.Root>
  );
};

/**
 * Biblioteca de tutoriais da rota atual, na topbar, ao lado do sino.
 *
 * Já foi um botão flutuante no canto inferior direito: cobria o CTA "Criar
 * pedido", a coluna de comissão e a última linha das listas longas. Na topbar
 * ele nunca fica por cima do conteúdo, e abre como o sino (mesmo painel).
 */
export const FlowTourLauncher = () => {
  const pathname = usePathname();
  const role = useUserRole();
  const { startFlow, getFlowProgress, activeFlowKey } = useFlowTourLauncher();
  const [open, setOpen] = useState(false);

  // Agrupa por `group` preservando a ordem do catálogo (filtrado por rota e role).
  const groups = useMemo(() => {
    const map = new Map<string, FlowDefinition[]>();
    for (const flow of getFlowsForRoute(pathname, role)) {
      const group = flow.group ?? DEFAULT_GROUP;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(flow);
    }
    return Array.from(map.entries());
  }, [pathname, role]);

  const handleStart = (flow: FlowDefinition) => {
    const { status, lastStep } = getFlowProgress(flow);
    setOpen(false);
    startFlow(flow.key, status === "pending" ? lastStep : 0);
  };

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="md"
          isIconOnly
          label="Ajuda e tutoriais"
          data-tour="flowtour-launcher"
        >
          <Button.Icon icon={GraduationCap} />
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content
        panel
        align="end"
        sideOffset={8}
        className="tablet:w-[360px] w-[calc(100vw-24px)]"
      >
        <Dropdown.PanelHeader>
          <GraduationCap
            size={14}
            className="text-(--color-text-muted)"
            aria-hidden
          />
          <Title variant="body-sm" weight="semibold">
            Tutoriais guiados
          </Title>
        </Dropdown.PanelHeader>

        {groups.length === 0 ? (
          <EmptyState.Root flat className="gap-6 px-16 py-24">
            <EmptyState.Icon>
              <GraduationCap size={20} />
            </EmptyState.Icon>
            <EmptyState.Description>
              Nenhum tutorial disponível nesta página.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <div className="flex max-h-[60vh] flex-col overflow-y-auto">
            {groups.map(([group, flows]) => (
              <div key={group} className="flex flex-col">
                <Title
                  variant="eyebrow"
                  weight="semibold"
                  color="muted"
                  className="px-12 pt-12 pb-6"
                >
                  {group}
                </Title>

                {flows.map((flow) => {
                  const { status } = getFlowProgress(flow);
                  const isActive = activeFlowKey === flow.key;

                  return (
                    <Dropdown.PanelRow
                      key={flow.key}
                      onClick={() => handleStart(flow)}
                      className="group"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex min-w-0 items-center gap-8">
                          <Title
                            variant="body-sm"
                            weight="semibold"
                            className="truncate"
                          >
                            {flow.label}
                          </Title>
                          <span className="shrink-0">
                            <StatusBadge
                              status={isActive ? "pending" : status}
                            />
                          </span>
                        </div>

                        {flow.description && (
                          <Title variant="body-xs" color="muted">
                            {flow.description}
                          </Title>
                        )}
                      </div>

                      <ChevronRight
                        size={16}
                        aria-hidden
                        className="mt-2 shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-1"
                      />
                    </Dropdown.PanelRow>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
