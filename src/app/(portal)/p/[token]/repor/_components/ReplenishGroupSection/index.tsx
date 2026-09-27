import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";

import { PortalReplenishmentItem } from "../../../interface";
import { ReplenishGroup, groupSummary } from "../../utils";
import { PortalReplenishRow } from "../PortalReplenishRow";

interface Props {
  group: ReplenishGroup<PortalReplenishmentItem>;
  /** Mostrar só o que já deve ter acabado. */
  onlyRunOut: boolean;
}

/**
 * Os produtos de UMA fábrica. O que o filtro tira da vista fica escondido, e
 * não desmontado: a marca e a quantidade que o cliente já mexeu continuam lá
 * quando ele volta a ver tudo — e vão no envio se estiverem marcadas.
 */
export function ReplenishGroupSection({ group, onlyRunOut }: Props) {
  const hiddenGroup = onlyRunOut && group.runOut === 0;

  return (
    <section className={hiddenGroup ? "hidden" : "flex flex-col gap-[8px]"}>
      <div className="flex flex-col gap-[2px]">
        <Title variant="heading-sm">{group.factoryName}</Title>
        <Title variant="body-xs" color="muted">
          {groupSummary(group)}
        </Title>
      </div>
      <Grid.Root cols={{ base: 1, tablet: 2, desktop: 4 }} gap={12}>
        {group.items.map((item) => (
          <div
            key={item.productId}
            className={
              onlyRunOut && item.daysRemaining > 0 ? "hidden" : undefined
            }
          >
            <PortalReplenishRow item={item} />
          </div>
        ))}
      </Grid.Root>
    </section>
  );
}
