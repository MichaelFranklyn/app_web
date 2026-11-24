import { KpiDelta } from "./Delta";
import { KpiGroup } from "./Group";
import { KpiLabel } from "./Label";
import { KpiRoot } from "./Root";
import { KpiSkeleton } from "./Skeleton";
import { KpiValue } from "./Value";

export type { KpiStatus } from "./Value/style";

export const Kpi = Object.assign(KpiRoot, {
  Label: KpiLabel,
  Value: KpiValue,
  Delta: KpiDelta,
  Group: KpiGroup,
  Skeleton: KpiSkeleton,
});
