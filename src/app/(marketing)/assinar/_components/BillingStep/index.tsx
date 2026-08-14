"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Title } from "@/components/Title";
import { BillingData } from "../../interface";

/**
 * Segundo passo: quem recebe a nota. Três campos e nada mais — o cadastro
 * completo da empresa é feito depois, no `/signup`, e repetir aqui o que o
 * sistema já vai perguntar dobra o trabalho de quem está contratando.
 */
export function BillingStep({
  data,
  errors,
  onChange,
  onBack,
  onContinue,
}: {
  data: BillingData;
  errors: Record<string, string>;
  onChange: (data: BillingData) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-24"
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
    >
      <div className="flex flex-col gap-8">
        <Title variant="heading-md">Dados de cobrança</Title>

        <Title variant="body-sm" color="muted">
          É o que vai sair na nota fiscal da assinatura.
        </Title>
      </div>

      <Input.Text
        label="Razão social"
        value={data.companyName}
        error={errors.companyName}
        onChange={(event) =>
          onChange({ ...data, companyName: event.target.value })
        }
      />

      <Input.Mask
        label="CNPJ"
        mask="00.000.000/0000-00"
        value={data.document}
        error={errors.document}
        onAccept={(value) => onChange({ ...data, document: value })}
      />

      <Input.Email
        label="E-mail para a nota"
        value={data.email}
        error={errors.email}
        onChange={(event) => onChange({ ...data, email: event.target.value })}
      />

      <div className="flex flex-wrap gap-12">
        <Button.Root type="submit" color="amber">
          <Button.Title>Ir para o pagamento</Button.Title>
        </Button.Root>

        <Button.Root type="button" appearance="ghost" onClick={onBack}>
          <Button.Title>Voltar</Button.Title>
        </Button.Root>
      </div>
    </form>
  );
}
