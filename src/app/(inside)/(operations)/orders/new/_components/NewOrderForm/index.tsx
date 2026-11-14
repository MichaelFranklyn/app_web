"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { useState } from "react";

import { NewOrderDetails } from "../../interface";
import { NewOrderCore } from "../../useNewOrderCore";
import { BackLink } from "../../utils";
import { DraftBackupNotice } from "../DraftBackupNotice";
import { LeaveOrderModal } from "../LeaveOrderModal";
import { NewOrderFooter } from "../NewOrderFooter";
import { OrderDetailsCard } from "../OrderDetailsCard";
import { OrderItemsCard } from "../OrderItemsCard";

interface Props {
  core: NewOrderCore;
  details: NewOrderDetails;
  back: BackLink;
  description: string;
  /** O que falta escolher para os itens aparecerem. */
  itemsPendingHint: string;
}

/** A página de novo pedido, igual para todas as origens. */
export function NewOrderForm({
  core,
  details,
  back,
  description,
  itemsPendingHint,
}: Props) {
  const itemCount = core.draft.items.length;
  const [isDetailsDirty, setDetailsDirty] = useState(false);
  // Qualquer coisa que o vendedor já fez e ainda não foi gravada — itens na
  // lista, um item começado, dados do pedido mexidos: sair (link, Voltar,
  // Cancelar, recarregar) pergunta antes. Nada disso existe no servidor até
  // "Criar pedido".
  const leave = useLeaveGuard(
    itemCount > 0 || core.draft.hasPendingItem || isDetailsDirty
  );

  // Formulário válido → a origem monta o input; sem input, não grava.
  const handleValid = (data: Record<string, unknown>) => {
    const input = details.toInput(data);
    if (input) core.create(input);
  };

  return (
    <PageContent>
      {/* Caminho e título juntos (gap-8): soltos no PageContent herdavam o
          gap-20 entre blocos e o título ficava longe do breadcrumb
          (14/11/2026). O loading.tsx espelha o mesmo agrupamento. */}
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href={back.href}>{back.label}</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>Novo pedido</Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Heading {...PAGE_HEADING.newOrder}>
                Novo pedido{details.subject ? ` · ${details.subject}` : ""}
              </PanelHeader.Heading>
              <PanelHeader.Description>
                {details.description ?? description}
              </PanelHeader.Description>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <OrderDetailsCard
        formRef={core.formRef}
        formSteps={details.formSteps}
        onValid={handleValid}
        initialData={details.initialData}
        onDirtyChange={setDetailsDirty}
      />

      <DraftBackupNotice backup={core.backup} />

      <OrderItemsCard
        draft={core.draft}
        hasFactory={Boolean(core.factoryId)}
        pendingHint={itemsPendingHint}
        minimum={core.paymentMinimum}
        freeFreight={core.freeFreight}
      />

      <NewOrderFooter
        itemCount={itemCount}
        isLoading={core.isLoading}
        onSubmit={core.submit}
        onCancel={() => leave.navigate(back.href)}
      />

      <LeaveOrderModal
        open={leave.isAsking}
        itemCount={itemCount}
        onLeave={leave.confirmLeave}
        onStay={leave.stay}
      />
    </PageContent>
  );
}
