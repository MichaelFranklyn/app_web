"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { operationLabel } from "../../../utils";
import { OperationRegression } from "../../interface";
import {
  REGRESSION_COLOR,
  REGRESSION_LABEL,
  formatDelta,
  formatMs,
} from "../../utils";

/**
 * Uma linha de piora, com o ANTES ao lado do depois.
 *
 * O número sozinho ("p95 de 1,2s") não diz se é problema novo; o par
 * ("300ms → 1,2s") diz, e é o par que decide se alguém precisa olhar hoje.
 */
export function RegressionRow({
  regression,
}: {
  regression: OperationRegression;
}) {
  const failing = regression.kind !== "SLOWER";

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-8 border-b border-(--border) pb-8 last:border-0">
      <div className="flex min-w-0 flex-col gap-[2px]">
        <div className="flex flex-wrap items-center gap-8">
          <Title variant="body-sm" weight="semibold">
            {operationLabel(regression.operation)}
          </Title>
          <Badge.Root
            color={REGRESSION_COLOR[regression.kind]}
            appearance="tinted"
            size="xs"
          >
            <Badge.Text>{REGRESSION_LABEL[regression.kind]}</Badge.Text>
          </Badge.Root>
        </div>

        {regression.lastErrorMessage && (
          <Title variant="micro" color="red" className="truncate">
            {regression.lastErrorMessage}
          </Title>
        )}

        <Title variant="micro" color="muted">
          {regression.callsPrevious} → {regression.callsCurrent} chamadas
        </Title>
      </div>

      <div className="flex items-baseline gap-16">
        {failing && (
          <div className="flex flex-col items-end gap-[2px]">
            <Title variant="micro" color="muted">
              falhas
            </Title>
            <Title variant="body-sm" color="red">
              {regression.errorsPrevious} → {regression.errorsCurrent}
            </Title>
          </div>
        )}

        <div className="flex flex-col items-end gap-[2px]">
          <Title variant="micro" color="muted">
            p95
          </Title>
          <div className="flex items-baseline gap-[4px]">
            <Title variant="body-sm">
              {formatMs(regression.p95Previous)} →{" "}
              {formatMs(regression.p95Current)}
            </Title>
            <Title variant="micro" color="amber">
              {formatDelta(regression.p95Change)}
            </Title>
          </div>
        </div>
      </div>
    </li>
  );
}
