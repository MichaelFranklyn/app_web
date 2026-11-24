"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";

/** As mesmas medidas do `PriorityClientRow`: a troca não desloca nada. */
const UNDER_CHECKBOX = "max-desktop:-ml-[36px]";
const FULL_BADGE = "max-desktop:w-[calc(100%+36px)]";

/** Selo `sm` (32.8px), como os do card. */
const BADGE = "h-[33px]";

/** Nome (largura) e quantas "outras fábricas": as linhas não saem iguais. */
const ROWS = [
  { name: "w-[240px]", others: 2 },
  { name: "w-[190px]", others: 0 },
  { name: "w-[270px]", others: 1 },
];

function RowSkeleton({ name, others }: (typeof ROWS)[number]) {
  return (
    <div className="flex flex-col gap-8 px-16 py-12">
      <div className="flex items-start gap-12">
        {/* A caixinha (16px) no meio da faixa de 24px e da linha do nome. */}
        <Loading.Skeleton
          shape="xs"
          className="desktop:mt-[8.5px] mx-4 mt-[2.5px] h-[16px] w-[16px] shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-start gap-6">
            <Loading.Skeleton
              className={cn("desktop:mt-10 mt-4 h-[13px] max-w-full", name)}
            />
            <Loading.Skeleton
              shape="pill"
              className={cn(
                "desktop:w-[132px] max-desktop:order-last",
                BADGE,
                FULL_BADGE,
                UNDER_CHECKBOX
              )}
            />
            <Loading.Skeleton
              shape="pill"
              className={cn(
                "desktop:ml-auto desktop:w-[84px]",
                BADGE,
                FULL_BADGE,
                UNDER_CHECKBOX
              )}
            />
          </div>
          <div className={cn("flex flex-col gap-4", UNDER_CHECKBOX)}>
            {/* Os rótulos são fixos: vão como texto, só o dado fica cinza. */}
            <div className="flex flex-wrap items-center gap-x-6">
              <Title variant="body-xs" color="muted" as="span">
                Localização:
              </Title>
              <Loading.Skeleton text="body-sm" className="w-[150px]" />
            </div>
            {others > 0 && (
              <div className="flex flex-wrap items-center gap-6">
                <Title variant="body-xs" color="muted" as="span">
                  Outras fábricas:
                </Title>
                {Array.from({ length: others }, (_, index) => (
                  <Loading.Skeleton
                    key={index}
                    shape="pill"
                    className={cn(
                      "desktop:w-[210px] max-desktop:w-full",
                      BADGE
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Enquanto a lista carrega: o card de uma cidade com três clientes, na forma
 * do que vai chegar (caixinha, nome, prioridade, score, localização, outras
 * fábricas) — não um bloco cinza. No celular os selos já ocupam a largura
 * toda, como no card de verdade.
 */
export function PriorityListSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-busy="true">
      {[0, 1].map((card) => (
        <Card.Root key={card}>
          <Card.Header>
            <Loading.Skeleton text="heading-sm" className="w-[160px]" />
            <Loading.Skeleton
              text="body-sm"
              className="mt-4 w-[220px] max-w-full"
            />
            <Card.Header.Actions>
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="sm"
                disabled
              >
                <Button.Title>Escolher todos</Button.Title>
              </Button.Root>
            </Card.Header.Actions>
          </Card.Header>
          <div className="flex flex-col divide-y divide-(--border)">
            {(card === 0 ? ROWS : ROWS.slice(0, 2)).map((row) => (
              <RowSkeleton key={row.name} {...row} />
            ))}
          </div>
        </Card.Root>
      ))}
    </div>
  );
}
