"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Lock } from "lucide-react";
import { ICON_SIZE } from "@/components/Icon";

/**
 * Segundo passo: confirmar e seguir para a página de pagamento.
 *
 * Não há formulário de cartão aqui de propósito. O cliente paga numa página
 * segura do sistema de pagamento (cartão, Pix ou boleto), e o número do cartão
 * nunca passa pelo nosso servidor.
 */
export function PaymentStep({
  total,
  isAnnual,
  error,
  isSubmitting,
  onBack,
  onConfirm,
}: {
  total: number;
  isAnnual: boolean;
  error: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8">
        <Title variant="heading-md">Pagamento</Title>

        <Title variant="body-sm" color="muted" className="max-w-[56ch]">
          Ao confirmar, abrimos a página de pagamento. Lá você escolhe cartão de
          crédito, Pix ou boleto e paga {formatMoney(total)}
          {isAnnual ? " pelo ano" : " pelo mês"}.
        </Title>

        <Title variant="body-sm" color="muted" className="max-w-[56ch]">
          O plano passa a valer assim que o pagamento for confirmado. No boleto,
          isso pode levar até 3 dias úteis.
        </Title>
      </div>

      {error ? (
        <Alert.Root variant="error">
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      ) : null}

      <div className="flex items-center gap-8">
        <Lock
          size={ICON_SIZE.sm}
          className="shrink-0 text-(--color-text-muted)"
        />

        <Title variant="body-xs" color="muted">
          Pagamento em página segura. Os dados do cartão não passam pelo Itinus.
        </Title>
      </div>

      <div className="flex flex-wrap gap-12">
        <Button.Root color="amber" loading={isSubmitting} onClick={onConfirm}>
          <Button.Title>Ir para o pagamento</Button.Title>
        </Button.Root>

        <Button.Root
          type="button"
          appearance="ghost"
          disabled={isSubmitting}
          onClick={onBack}
        >
          <Button.Title>Voltar</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
