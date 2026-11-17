"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowUpRight, CreditCard } from "lucide-react";

import { CANCEL_SUBSCRIPTION_MUTATION, MY_SUBSCRIPTION_QUERY } from "./gql";
import { CancelSubscriptionData, MySubscriptionQueryData } from "./interface";
import {
  CANCEL_FALLBACK_MESSAGE,
  describeSubscription,
  subscribeHref,
} from "./utils";

interface SubscriptionSectionProps {
  /** Plano atual da empresa: o botão Assinar já abre o checkout com ele. */
  planCode: string;
}

/**
 * A assinatura paga: se está em dia, o que falta pagar e como cancelar.
 *
 * Busca a própria query, e não junto com o plano, para que o sistema de
 * pagamento fora do ar não derrube a tela inteira: em erro a seção some e o
 * resto (limites, recursos) continua aparecendo.
 */
export function SubscriptionSection({ planCode }: SubscriptionSectionProps) {
  const { data, loading, refetch } = useQuery<MySubscriptionQueryData>(
    MY_SUBSCRIPTION_QUERY,
    // Volta da página de pagamento numa aba nova: buscar de novo mostra o
    // status que o aviso do pagamento acabou de gravar.
    { fetchPolicy: "cache-and-network" }
  );
  const [cancel] = useMutation<CancelSubscriptionData>(
    CANCEL_SUBSCRIPTION_MUTATION
  );

  const subscription = data?.mySubscription?.data ?? null;

  if (loading && !subscription) {
    return <Loading.Skeleton className="h-[96px]" />;
  }
  if (!subscription) return null;

  const copy = describeSubscription(subscription);

  const handleCancel = async () => {
    const result = await cancel();
    const response = result.data?.cancelSubscription;
    if (!response?.status) {
      // O ConfirmModal mostra a mensagem do erro lançado.
      throw new Error(response?.message || CANCEL_FALLBACK_MESSAGE);
    }
    await refetch();
  };

  const hasActions = copy.canPay || copy.canSubscribe || copy.canCancel;

  return (
    <section className="flex flex-col gap-12">
      <Title variant="heading-sm">Assinatura</Title>

      <Alert.Root variant={copy.variant}>
        <Alert.Icon icon={CreditCard} />
        <Alert.Content>
          <Alert.Title>{copy.title}</Alert.Title>
          <Alert.Description>{copy.description}</Alert.Description>

          {hasActions && (
            <div className="flex flex-wrap gap-8 pt-8">
              {copy.canPay && subscription.invoiceUrl && (
                <Button.Link
                  href={subscription.invoiceUrl}
                  external
                  appearance="solid"
                  color="amber"
                  size="sm"
                >
                  <Button.Title>Pagar</Button.Title>
                  <Button.Icon icon={ArrowUpRight} />
                </Button.Link>
              )}
              {copy.canSubscribe && (
                <Button.Link
                  href={subscribeHref(planCode)}
                  appearance="solid"
                  color="amber"
                  size="sm"
                >
                  <Button.Title>Assinar</Button.Title>
                </Button.Link>
              )}
              {copy.canCancel && (
                <ConfirmModal
                  trigger={
                    <Button.Root appearance="ghost" color="red" size="sm">
                      <Button.Title>Cancelar assinatura</Button.Title>
                    </Button.Root>
                  }
                  title="Cancelar a assinatura?"
                  description="Não haverá novas cobranças. O período que já foi pago continua valendo até o fim. Você pode assinar de novo quando quiser."
                  confirmLabel="Cancelar assinatura"
                  cancelLabel="Voltar"
                  onConfirm={handleCancel}
                  successMessage="Assinatura cancelada."
                />
              )}
            </div>
          )}
        </Alert.Content>
      </Alert.Root>
    </section>
  );
}
