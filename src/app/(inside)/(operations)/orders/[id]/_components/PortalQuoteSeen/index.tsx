"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Eye, EyeOff } from "lucide-react";

import { MARK_PORTAL_QUOTE_SEEN_MUTATION } from "../../gql";
import { OrderDetail } from "../../interface";
import { canMarkPortalSeen } from "../../utils";

interface MarkPortalQuoteSeenResponse {
  markPortalQuoteSeen: {
    status: boolean;
    message: string;
    data: { id: string; seenBySellerAt: string | null } | null;
  };
}

interface Props {
  order: OrderDetail;
}

/**
 * O cliente que pediu pelo portal acompanha o pedido lá e fica sem saber se
 * alguém leu. Um toque aqui mostra para ele "visto pelo representante em
 * dd/mm" — sem precisar de um telefonema só para confirmar recebimento.
 *
 * A mutation devolve `id` + `seenBySellerAt`: o Apollo normaliza o pedido e a
 * tela troca sozinha para "Cliente avisado", sem refetch.
 */
export function PortalQuoteSeen({ order }: Props) {
  const [markSeen] = useMutation<MarkPortalQuoteSeenResponse>(
    MARK_PORTAL_QUOTE_SEEN_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  if (!canMarkPortalSeen(order)) return null;

  if (order.seenBySellerAt) {
    return (
      <Alert.Root variant="success">
        <Alert.Icon icon={Eye} />
        <Alert.Content>
          <Alert.Description>
            Cliente avisado em {formatDate(order.seenBySellerAt)}: no portal,
            ele já vê que você recebeu o pedido.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  const handleMark = () =>
    execute(
      async () => {
        const res = await markSeen({ variables: { id: order.id } });
        if (!res.data?.markPortalQuoteSeen?.status) {
          throw new Error(
            res.data?.markPortalQuoteSeen?.message ??
              "Não foi possível avisar o cliente."
          );
        }
        return res.data.markPortalQuoteSeen;
      },
      {
        successMessage: (result) =>
          result?.message ?? "Pronto: o cliente já vê que você viu o pedido.",
      }
    );

  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={EyeOff} />
      <Alert.Content>
        <Alert.Description>
          O cliente ainda não sabe que você viu este pedido. Avise por aqui —
          ele acompanha a resposta no portal.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          onClick={handleMark}
          loading={isLoading}
        >
          <Button.Icon icon={Eye} />
          <Button.Title>Avisar o cliente que vi</Button.Title>
        </Button.Root>
      </Alert.Actions>
    </Alert.Root>
  );
}
