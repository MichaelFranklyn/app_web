"use client";

import { Grid } from "@/components/Grid";
import { Tabs } from "@/components/Tabs";
import { SellerDetail } from "../../interface";
import { SellerInfoCard } from "./SellerInfoCard";
import { SellerKpis } from "./SellerKpis";

interface Props {
  seller: SellerDetail;
}

export function OverviewTab({ seller }: Props) {
  return (
    <Tabs.Content value="visao-geral">
      <Grid cols={{ mobile: 12 }} gap={8} className="mt-16">
        <Grid.Item span={{ mobile: 8 }}>
          <SellerKpis seller={seller} />
        </Grid.Item>
        <Grid.Item span={{ mobile: 4 }}>
          <SellerInfoCard seller={seller} />
        </Grid.Item>
      </Grid>
    </Tabs.Content>
  );
}
