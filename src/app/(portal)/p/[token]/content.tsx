import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";
import { PortalPageHeader } from "./_components/PortalPageHeader";
import { PortalSummary } from "./_components/PortalSummary";
import { PortalProfile, PortalPurchaseSummary } from "./interface";
import { PORTAL_HOME_TITLE, portalGreeting } from "./utils";

interface PortalContentProps {
  profile: PortalProfile | null;
  summary: PortalPurchaseSummary | null;
  token: string;
}

/**
 * "Resumo": quanto o cliente comprou nos últimos 12 meses, mês a mês e por
 * fábrica. Os pedidos, um a um, ficam em "Pedidos" — o botão do cabeçalho leva
 * para lá.
 */
export function PortalContent({ profile, summary, token }: PortalContentProps) {
  const hasPurchases = summary !== null && summary.orderCount > 0;

  return (
    <>
      <PortalPageHeader
        heading="orders"
        title={PORTAL_HOME_TITLE}
        description={profile ? portalGreeting(profile) : undefined}
        actions={
          <Button.Link
            href={`/p/${token}/enviados`}
            appearance="outline"
            color="neutral"
          >
            <Button.Title>Ver meus pedidos</Button.Title>
          </Button.Link>
        }
      />

      {hasPurchases ? (
        <PortalSummary summary={summary} />
      ) : (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Package size={36} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma compra por aqui ainda</EmptyState.Title>
          <EmptyState.Description>
            Assim que o seu primeiro pedido for fechado, o resumo das suas
            compras aparece nesta página.
          </EmptyState.Description>
        </EmptyState.Root>
      )}
    </>
  );
}
