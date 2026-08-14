"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { Lock } from "lucide-react";
import { CardData } from "../../interface";

/**
 * Terceiro passo: o cartão. Simulado de ponta a ponta — o que é digitado aqui
 * fica no estado do componente e morre com a aba.
 *
 * `autoComplete="off"` nos campos: sem gateway do outro lado, deixar o
 * navegador oferecer para salvar um cartão numa tela de mentira seria
 * desagradável de um jeito difícil de desfazer.
 */
export function PaymentStep({
  data,
  errors,
  isProcessing,
  onChange,
  onBack,
  onSubmit,
}: {
  data: CardData;
  errors: Record<string, string>;
  isProcessing: boolean;
  onChange: (data: CardData) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-24"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-8">
        <Title variant="heading-md">Cartão de crédito</Title>

        <Title variant="body-sm" color="muted">
          Use um dos cartões de teste indicados no aviso acima.
        </Title>
      </div>

      <Input.Mask
        label="Número do cartão"
        mask="0000 0000 0000 0000"
        value={data.number}
        error={errors.number}
        autoComplete="off"
        onAccept={(value) => onChange({ ...data, number: value })}
      />

      <Input.Text
        label="Nome impresso no cartão"
        value={data.holder}
        error={errors.holder}
        autoComplete="off"
        onChange={(event) => onChange({ ...data, holder: event.target.value })}
      />

      <div className="tablet:grid-cols-2 grid gap-16">
        <Input.Mask
          label="Validade"
          mask="00/00"
          placeholder="MM/AA"
          value={data.expiry}
          error={errors.expiry}
          autoComplete="off"
          onAccept={(value) => onChange({ ...data, expiry: value })}
        />

        <Input.Mask
          label="Código de segurança"
          mask="000"
          value={data.cvv}
          error={errors.cvv}
          autoComplete="off"
          onAccept={(value) => onChange({ ...data, cvv: value })}
        />
      </div>

      <div className="flex items-center gap-8">
        <Lock size={14} className="shrink-0 text-(--muted)" />

        <Title variant="body-xs" color="muted">
          Simulação: os dados não são enviados a lugar nenhum.
        </Title>
      </div>

      <div className="flex flex-wrap gap-12">
        <Button.Root type="submit" color="amber" loading={isProcessing}>
          <Button.Title>Confirmar assinatura</Button.Title>
        </Button.Root>

        <Button.Root
          type="button"
          appearance="ghost"
          disabled={isProcessing}
          onClick={onBack}
        >
          <Button.Title>Voltar</Button.Title>
        </Button.Root>
      </div>
    </form>
  );
}
