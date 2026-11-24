"use client";
import { Emphasis } from "@/components/Emphasis";
import { Card } from "@/components/Card";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowRight } from "lucide-react";

import { useFactoryDetail } from "../../context";
import { formatCommissionRate } from "../../../utils";
import {
  APPLY_COMMISSION_RATE_MUTATION,
  APPLY_COMMISSION_RATE_PREVIEW_QUERY,
} from "./gql";
import { ICON_SIZE } from "@/components/Icon";

interface RateChange {
  /** Decimal do GraphQL: chega como string. */
  rate: string;
  orders: number;
  installments: number;
  currentTotal: string;
  newTotal: string;
  skipped: number;
}

interface PreviewResponse {
  applyCommissionRatePreview: RateChange;
}

interface ApplyResponse {
  applyCommissionRate: { status: boolean; message: string };
}

/**
 * Aplica a taxa de comissão atual aos pedidos JÁ faturados desta fábrica.
 *
 * A comissão é congelada no faturamento — é o que preserva o histórico e a
 * conferência contra a planilha da fábrica. O efeito colateral é que corrigir a
 * taxa no vínculo não muda nada do que já foi lançado, e quem corrige espera
 * exatamente o contrário. Este modal é a ponte, e ele mostra o tamanho da
 * mudança ANTES de gravar: a correção vale para a carteira inteira da fábrica.
 *
 * Fica montado no cabeçalho da página (e não no cartão de condições comerciais)
 * porque é aberto de dois lugares: pelo botão que vive ao lado da comissão e
 * automaticamente depois de salvar uma taxa diferente, de qualquer aba.
 */
export function ApplyCommissionRateModal() {
  const { companyFactory, applyRatePrompt, setApplyRatePrompt, refetch } =
    useFactoryDetail();
  const factoryId = companyFactory.factory.id;

  const {
    data,
    loading,
    refetch: refetchPreview,
  } = useQuery<PreviewResponse>(APPLY_COMMISSION_RATE_PREVIEW_QUERY, {
    variables: { factoryId },
    // Só custa quando o modal abre — é uma varredura da carteira da fábrica.
    skip: !applyRatePrompt,
    fetchPolicy: "network-only",
  });
  const [applyRate] = useMutation<ApplyResponse>(
    APPLY_COMMISSION_RATE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const change = data?.applyCommissionRatePreview;
  const nothingToDo = !!change && change.installments === 0;
  const difference = change
    ? Number(change.newTotal) - Number(change.currentTotal)
    : 0;

  const handleApply = () =>
    execute(
      async () => {
        const res = await applyRate({ variables: { factoryId } });
        if (!res.data?.applyCommissionRate?.status) {
          throw new Error(
            res.data?.applyCommissionRate?.message ??
              "Não foi possível aplicar a taxa."
          );
        }
        return res.data.applyCommissionRate;
      },
      {
        successMessage: "Comissões recalculadas pela taxa atual.",
        onSuccess: () => {
          setApplyRatePrompt(false);
          void refetchPreview();
          refetch();
        },
      }
    );

  return (
    <Modal.Root open={applyRatePrompt} onOpenChange={setApplyRatePrompt}>
      <Modal.Content size="lg">
        <Modal.Header
          title="Aplicar a comissão aos pedidos já faturados"
          description="A comissão de um pedido é calculada no dia do faturamento e fica gravada nele. Mudar a taxa aqui não corrige sozinha o que já foi lançado."
        />

        <Modal.Body className="flex flex-col gap-16 py-24">
          {loading || !change ? (
            <div className="flex flex-col gap-8">
              <Loading.Skeleton text="heading-sm" className="w-48" />
              <Loading.Skeleton className="h-[40px] w-full" />
              <Loading.Skeleton text="body-sm" className="w-40" />
            </div>
          ) : nothingToDo ? (
            <Title variant="body-sm">
              Nada a corrigir: os pedidos faturados desta fábrica já estão na
              taxa de{" "}
              <Emphasis>{formatCommissionRate(Number(change.rate))}</Emphasis>.
            </Title>
          ) : (
            <>
              <Title variant="body-sm">
                Recalcular pela taxa de{" "}
                <Emphasis>{formatCommissionRate(Number(change.rate))}</Emphasis>
                ?
              </Title>

              <Card.Root inset tone="muted">
                <Card.Body padding="sm">
                  <Title variant="label">
                    {plural(change.installments, "parcela", "parcelas")} em{" "}
                    {plural(change.orders, "pedido", "pedidos")}
                  </Title>

                  <div className="flex flex-wrap items-center gap-12">
                    <Title variant="heading-sm" color="muted">
                      {formatMoney(change.currentTotal)}
                    </Title>
                    <ArrowRight
                      size={ICON_SIZE.md}
                      className="text-(--fg-muted)"
                    />
                    <Title variant="heading-sm" weight="bold">
                      {formatMoney(change.newTotal)}
                    </Title>
                    {/* O sinal é o que se olha primeiro: a correção pode DIMINUIR
                      a comissão, e isso não pode passar despercebido. */}
                    <Title
                      variant="body-sm"
                      weight="semibold"
                      color={difference >= 0 ? "green" : "red"}
                    >
                      {difference >= 0 ? "+" : "−"}
                      {formatMoney(Math.abs(difference))}
                    </Title>
                  </div>
                </Card.Body>
              </Card.Root>

              {change.skipped > 0 && (
                <Title variant="body-sm" color="muted">
                  {plural(
                    change.skipped,
                    "parcela fica como está: a comissão dela",
                    "parcelas ficam como estão: a comissão delas"
                  )}{" "}
                  já foi acertada — recebida da fábrica, conferida contra a
                  planilha, repassada ao vendedor ou descontada num estorno.
                  Mudar o valor agora faria a conferência de ontem não bater.
                </Title>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
            >
              <Button.Title>
                {nothingToDo ? "Fechar" : "Manter como está"}
              </Button.Title>
            </Button.Root>
          </Modal.Close>
          {!nothingToDo && (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              loading={isLoading}
              disabled={loading || !change}
              onClick={handleApply}
            >
              <Button.Title>
                {change
                  ? `Aplicar a ${plural(change.orders, "pedido", "pedidos")}`
                  : "Aplicar"}
              </Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
