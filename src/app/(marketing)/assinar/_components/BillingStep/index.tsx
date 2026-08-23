"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Title } from "@/components/Title";
import { useRef } from "react";
import { BillingData } from "../../interface";
import { BILLING_STEPS, toBillingData } from "./utils";

/**
 * Segundo passo: quem recebe a nota. Três campos e nada mais — o cadastro
 * completo da empresa é feito depois, no `/signup`, e repetir aqui o que o
 * sistema já vai perguntar dobra o trabalho de quem está contratando.
 *
 * `initialData` reidrata o que já foi digitado: voltar do cartão para corrigir
 * um dado não pode custar o preenchimento inteiro.
 */
export function BillingStep({
  data,
  onBack,
  onContinue,
}: {
  data: BillingData;
  onBack: () => void;
  onContinue: (data: BillingData) => void;
}) {
  const formRef = useRef<FormBuilderRef>(null);

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8">
        <Title variant="heading-md">Dados de cobrança</Title>

        <Title variant="body-sm" color="muted">
          É o que vai sair na nota fiscal da assinatura.
        </Title>
      </div>

      <FormBuilder
        ref={formRef}
        steps={BILLING_STEPS}
        initialData={{ ...data }}
        onSubmit={(formData) => onContinue(toBillingData(formData))}
        unstyled
      />

      <div className="flex flex-wrap gap-12">
        <Button.Root
          type="button"
          color="amber"
          onClick={() => formRef.current?.submitForm()}
        >
          <Button.Title>Ir para o pagamento</Button.Title>
        </Button.Root>

        <Button.Root type="button" appearance="ghost" onClick={onBack}>
          <Button.Title>Voltar</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
