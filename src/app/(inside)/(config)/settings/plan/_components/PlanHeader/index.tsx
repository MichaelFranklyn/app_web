import { Badge } from "@/components/Badges";
import { PanelHeader } from "@/components/PanelHeader";
import { MyPlan } from "@/services/plan";

export function PlanHeader({ plan }: { plan: MyPlan }) {
  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Title>Plano da empresa</PanelHeader.Title>
          <PanelHeader.Description>
            O que está incluído no seu plano e quanto de cada limite já foi
            usado. Para mudar de plano, fale com o suporte.
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            <Badge.Root color="amber" appearance="tinted">
              <Badge.Text>{plan.label}</Badge.Text>
            </Badge.Root>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
