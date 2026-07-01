"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Check, ChevronRight, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
      <Badge.Root color="amber" appearance="tinted" size="xs">
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

// Botão flutuante (canto inferior direito) que abre a biblioteca de tutoriais da
// rota atual, agrupada por categoria e com o status de cada fluxo.
export const FlowTourLauncher = () => {
  const pathname = usePathname();
  const role = useUserRole();
  const { startFlow, getFlowProgress, activeFlowKey } = useFlowTourLauncher();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

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

  const totalFlows = useMemo(
    () => groups.reduce((acc, [, flows]) => acc + flows.length, 0),
    [groups]
  );

  const handleStart = (flow: FlowDefinition) => {
    const { status, lastStep } = getFlowProgress(flow);
    setOpen(false);
    startFlow(flow.key, status === "pending" ? lastStep : 0);
  };

  return (
    <div ref={containerRef} className="fixed right-24 bottom-24 z-[920]">
      {open && (
        <div className="absolute right-0 bottom-[68px] flex max-h-[70vh] w-[340px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-lg border border-(--border) bg-(--bg) shadow-xl">
          {/* Cabeçalho */}
          <div className="flex flex-col gap-4 border-b border-(--border) px-16 py-12">
            <Title variant="body-md" weight="semibold">
              Tutoriais guiados
            </Title>
            <Title variant="body-xs" color="muted">
              {totalFlows > 0
                ? "Aprenda a usar os recursos desta página passo a passo."
                : "Nenhum tutorial disponível nesta página."}
            </Title>
          </div>

          {/* Corpo: grupos e cards */}
          {totalFlows > 0 && (
            <div className="flex flex-col gap-16 overflow-y-auto p-12">
              {groups.map(([group, flows]) => (
                <div key={group} className="flex flex-col gap-4">
                  <Title
                    variant="eyebrow"
                    weight="semibold"
                    color="muted"
                    className="px-4 tracking-wide uppercase"
                  >
                    {group}
                  </Title>

                  {flows.map((flow) => {
                    const { status } = getFlowProgress(flow);
                    const isActive = activeFlowKey === flow.key;

                    return (
                      <button
                        key={flow.key}
                        type="button"
                        onClick={() => handleStart(flow)}
                        className="group flex w-full cursor-pointer items-start gap-8 rounded-md border border-transparent p-8 text-left transition-colors hover:border-(--border) hover:bg-(--bg3)"
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
                          className="mt-2 shrink-0 text-(--muted) transition-transform group-hover:translate-x-1"
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        aria-label="Ajuda e tutoriais"
        data-tour="flowtour-launcher"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--bg) text-(--amber) shadow-xl transition-transform hover:scale-105"
      >
        <GraduationCap size={26} strokeWidth={2} />
      </button>
    </div>
  );
};
