"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toIsoDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { useCompleteList } from "@/hooks/useCompleteList";
import { factoryName } from "@/utils/company";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { CheckCheck, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  COMMISSIONS_FACTORIES_QUERY,
  SETTLE_INSTALLMENTS_IN_PERIOD_MUTATION,
  SETTLE_PREVIEW_QUERY,
} from "../../gql";
import {
  CommissionsFactoriesResponse,
  SettlePeriodModalProps,
  SettlePreviewResponse,
  SettleResponse,
} from "./interface";

// Catálogo pequeno (dezenas por empresa): `useCompleteList` rebusca pelo total
// se um dia passar da primeira página, em vez de truncar calado.
const EMPTY_INPUT = {};
const getFactories = (d: CommissionsFactoriesResponse) =>
  d.commissions_factories;

/**
 * Baixa em lote dos boletos que vencem num período.
 *
 * Existe para o começo de uso: quem sobe o histórico de pedidos para conhecer o
 * sistema termina com centenas de boletos "em aberto" que na vida real já foram
 * pagos. Marcar um a um ninguém faz — e, sem marcar, todo boleto antigo aparece
 * como vencido e o alerta de atraso vira ruído.
 *
 * A data padrão é o VENCIMENTO de cada boleto, não hoje: é o que preserva a
 * cronologia e mantém coerente o mês em que cada comissão caiu.
 */
export function SettlePeriodModal({
  sellerId,
  sellerName,
  onSettled,
}: SettlePeriodModalProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [factory, setFactory] = useState<SelectOption | null>(null);
  const [useDueDate, setUseDueDate] = useState(true);
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  // A tela mostra um vendedor por vez, mas quem está colocando o histórico em
  // dia quer a empresa inteira. Sem escolher, a baixa seguiria o recorte da
  // tela em silêncio e deixaria os outros vendedores para trás.
  const [allSellers, setAllSellers] = useState(false);

  // As fábricas vêm do VÍNCULO da empresa, e só quando o modal abre: tirá-las
  // das linhas da tela faria a lista depender do mês aberto, que nada tem a ver
  // com o período de vencimento que esta baixa alcança.
  const factoriesQuery = useCompleteList<CommissionsFactoriesResponse>(
    COMMISSIONS_FACTORIES_QUERY,
    EMPTY_INPUT,
    getFactories,
    { skip: !open }
  );

  const factoryOptions = useMemo(
    () =>
      (factoriesQuery.data?.commissions_factories.edges ?? [])
        // Vínculo sem fábrica carregada não vira opção: o filtro casa com o id
        // da FÁBRICA, não com o do vínculo.
        .filter(({ node }) => node.factory)
        .map(({ node }) => ({
          value: node.factory!.id,
          label: factoryName(node.factory),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [factoriesQuery.data]
  );

  const [loadPreview, preview] = useLazyQuery<SettlePreviewResponse>(
    SETTLE_PREVIEW_QUERY,
    { fetchPolicy: "network-only" }
  );
  const [settle] = useMutation<SettleResponse>(
    SETTLE_INSTALLMENTS_IN_PERIOD_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const dueFrom = toIsoDate(from);
  const dueTo = toIsoDate(to);
  const factoryId = factory?.value ?? null;
  const scopedSellerId = allSellers ? null : sellerId;

  // Prévia a cada mudança de recorte: é o número que autoriza a decisão.
  useEffect(() => {
    if (!open || !dueFrom || !dueTo) return;
    loadPreview({
      variables: { dueFrom, dueTo, factoryId, sellerId: scopedSellerId },
    });
  }, [open, dueFrom, dueTo, factoryId, scopedSellerId, loadPreview]);

  const result = preview.data?.settleInstallmentsPreview;
  const count = result?.count ?? 0;
  const canSubmit = !!dueFrom && !!dueTo && count > 0 && !isLoading;

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setFrom(null);
      setTo(null);
      setFactory(null);
      setUseDueDate(true);
      setPaidAt(null);
      setAllSellers(false);
    }
  };

  const handleConfirm = () =>
    execute(
      async () => {
        const res = await settle({
          variables: {
            dueFrom,
            dueTo,
            factoryId,
            sellerId: scopedSellerId,
            paidAt: useDueDate ? null : toIsoDate(paidAt),
          },
        });
        if (!res.data?.settleInstallmentsInPeriod?.status) {
          throw new Error(
            res.data?.settleInstallmentsInPeriod?.message ??
              "Erro ao dar baixa nos boletos"
          );
        }
        return res.data.settleInstallmentsInPeriod;
      },
      {
        successMessage: "Boletos baixados",
        onSuccess: () => {
          handleClose(false);
          onSettled();
        },
      }
    );

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={CheckCheck} />
          <Button.Title>Dar baixa em período</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Dar baixa nos boletos de um período"
          description="Marca como pagos todos os boletos em aberto que vencem no período escolhido. Serve para colocar o histórico em dia de uma vez."
        />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            <div className="tablet:grid-cols-2 grid grid-cols-1 gap-12">
              <Input.Date
                label="Vencimento de"
                value={from}
                disabled={isLoading}
                onChange={(d: unknown) => setFrom(d instanceof Date ? d : null)}
              />
              <Input.Date
                label="Vencimento até"
                value={to}
                disabled={isLoading}
                onChange={(d: unknown) => setTo(d instanceof Date ? d : null)}
              />
            </div>

            {factoryOptions.length > 1 && (
              <Input.Select
                label="Fábrica"
                variant="single"
                options={factoryOptions}
                value={factory}
                placeholder="Todas as fábricas"
                onChange={(val: SelectOption | SelectOption[] | null) =>
                  setFactory(Array.isArray(val) ? (val[0] ?? null) : val)
                }
              />
            )}

            {sellerName && (
              <Input.Checkbox
                label={`Aplicar a todos os vendedores (não só ${sellerName})`}
                checked={allSellers}
                disabled={isLoading}
                onChange={() => setAllSellers((v) => !v)}
              />
            )}

            <Input.Checkbox
              label="Considerar cada boleto pago no próprio vencimento"
              checked={useDueDate}
              disabled={isLoading}
              onChange={() => setUseDueDate((v) => !v)}
            />

            {!useDueDate && (
              <Input.Date
                label="Data do pagamento (a mesma para todos)"
                value={paidAt}
                disabled={isLoading}
                onChange={(d: unknown) =>
                  setPaidAt(d instanceof Date ? d : null)
                }
              />
            )}

            {dueFrom && dueTo && (
              <Alert.Root variant={count > 0 ? "info" : "warning"}>
                <Alert.Icon icon={Info} />
                <Alert.Content>
                  <Alert.Description>
                    {preview.loading
                      ? "Contando os boletos do período…"
                      : count > 0
                        ? `${count} boleto(s) em aberto vencem neste período, somando ${formatMoney(result?.amount ?? 0)}.`
                        : "Nenhum boleto em aberto vence neste período."}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            <Title variant="body-sm" color="muted">
              Boleto já pago, cancelado, marcado como inadimplente ou com
              comissão já recebida da fábrica não é tocado. Para desfazer, é
              preciso reverter parcela a parcela — confira o período antes.
            </Title>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            <Button.Title>
              {count > 0 ? `Dar baixa em ${count} boleto(s)` : "Dar baixa"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
