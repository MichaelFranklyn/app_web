"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Title } from "@/components/Title";
import { useToast } from "@/components/Toast";
import { CheckCircle2, Copy, KeyRound, Plus } from "lucide-react";
import { ProvisionCompanyPayload } from "../../interface";

interface Props {
  data: ProvisionCompanyPayload;
  onProvisionAnother: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <Title variant="caption" weight="semibold">
        {value}
      </Title>
    </div>
  );
}

/**
 * Tela de confirmação pós-provisionamento: mostra a empresa e o responsável
 * criados e, quando nenhuma senha foi definida, o link de primeiro acesso para
 * ser copiado e enviado ao responsável.
 */
export function FirstAccessResult({ data, onProvisionAnother }: Props) {
  const { toast } = useToast();
  const { company, owner, firstAccessLink } = data;

  const copyLink = async () => {
    if (!firstAccessLink) return;
    try {
      await navigator.clipboard.writeText(firstAccessLink);
      toast({
        variant: "success",
        title: "Copiado",
        description:
          "Link de primeiro acesso copiado para a área de transferência.",
      });
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível copiar",
        description: "Selecione o link e copie manualmente.",
      });
    }
  };

  return (
    <Card.Root className="max-w-[720px]">
      <Card.Body className="flex flex-col gap-20">
        <div className="flex items-center gap-8">
          <CheckCircle2 size={20} className="text-(--green)" />
          <Title variant="body" weight="semibold" color="green">
            Empresa provisionada
          </Title>
        </div>

        <div className="flex flex-col gap-12">
          <Field
            label="Empresa"
            value={company.nomeFantasia || company.razaoSocial}
          />
          <Field label="CNPJ" value={company.cnpj} />
          <Field label="Responsável" value={owner.name} />
          <Field label="E-mail de acesso" value={owner.email} />
        </div>

        <Divider.Root />

        {firstAccessLink ? (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-8">
              <KeyRound size={16} className="text-(--muted)" />
              <Title variant="caption" weight="semibold">
                Link de primeiro acesso
              </Title>
            </div>
            <Title variant="micro" color="muted">
              Envie este link ao responsável para que ele crie a própria senha.
              Ele é exibido apenas agora e tem validade limitada.
            </Title>
            <div className="tablet:flex-row tablet:items-center flex flex-col gap-8">
              <div className="flex-1 overflow-x-auto rounded-(--r-md) border border-(--border) bg-(--bg2) px-12 py-8">
                <Title variant="micro" className="whitespace-nowrap">
                  {firstAccessLink}
                </Title>
              </div>
              <Button.Root
                type="button"
                appearance="outline"
                color="neutral"
                size="sm"
                noUppercase
                onClick={copyLink}
              >
                <Button.Icon icon={Copy} />
                <Button.Title>Copiar link</Button.Title>
              </Button.Root>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-8">
              <KeyRound size={16} className="text-(--muted)" />
              <Title variant="caption" weight="semibold">
                Senha inicial definida
              </Title>
            </div>
            <Title variant="micro" color="muted">
              O responsável já pode entrar com o e-mail acima e a senha que você
              definiu. Oriente-o a trocá-la no primeiro acesso.
            </Title>
          </div>
        )}

        <div className="flex justify-end">
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            onClick={onProvisionAnother}
          >
            <Button.Icon icon={Plus} />
            <Button.Title>Provisionar outra</Button.Title>
          </Button.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
