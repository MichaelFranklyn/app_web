"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Landmark } from "lucide-react";
import { RECEITA_HELP } from "../../help";
import { CHECK_WALLET_RECEITA_MUTATION } from "../../gql";
import { CheckWalletReceitaResponse } from "../../interface";

interface Props {
  pending: number;
  onChecked: () => void;
}

/** Lote por clique: as fontes públicas aceitam poucas consultas por minuto. */
const BATCH = 10;

/**
 * Conferir a carteira na Receita, um lote por vez.
 *
 * É daqui que sai o sinal mais forte da lista ("CNPJ fora de operação"). O
 * número de pendentes fica à vista para o usuário saber quanto falta, e a
 * mensagem de volta diz quantos conferiu e se parou no limite — sem isso, um
 * clique que conferiu 3 de 10 pareceria defeito.
 */
export function ReceitaCheckCard({ pending, onChecked }: Props) {
  const { execute, isLoading } = useAsyncAction();
  const [check] = useMutation<CheckWalletReceitaResponse>(
    CHECK_WALLET_RECEITA_MUTATION
  );

  const handleCheck = () =>
    execute(
      async () => {
        const res = await check({ variables: { limit: BATCH } });
        const payload = res.data?.checkWalletReceita;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao consultar a Receita");
        }
        return payload;
      },
      { successMessage: (payload) => payload.message, onSuccess: onChecked }
    );

  return (
    <Card.Root>
      <Card.Body>
        <div className="flex flex-wrap items-center justify-between gap-12">
          <div className="flex items-start gap-10">
            <Landmark size={20} className="mt-2 text-(--muted)" />
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-6">
                <Title variant="body-md" weight="bold">
                  {pending === 0
                    ? "Carteira conferida na Receita"
                    : `${pending} cliente(s) ainda não conferido(s) na Receita`}
                </Title>
                <HelpTooltip
                  label="Sobre a conferência na Receita"
                  content={<Title variant="body-sm">{RECEITA_HELP}</Title>}
                />
              </span>
              <Title variant="body-sm" color="muted">
                {pending === 0
                  ? "Todos os clientes ativos foram conferidos nos últimos 30 dias."
                  : `Cada clique confere até ${BATCH}. Quem estiver com o CNPJ baixado ou inapto aparece na lista abaixo.`}
              </Title>
            </div>
          </div>
          {pending > 0 && (
            <Button.Root
              appearance="solid"
              color="amber"
              size="sm"
              noUppercase
              loading={isLoading}
              onClick={handleCheck}
            >
              <Button.Title>Conferir na Receita</Button.Title>
            </Button.Root>
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
