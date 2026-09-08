"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { useLazyQuery } from "@apollo/client/react";
import { Building2, ChevronDown, FileText, UserRound } from "lucide-react";
import { useState } from "react";

import { COMMISSIONS_PDF_QUERY } from "../../gql";
import { CommissionRow } from "../../interface";
import { exportCommissionsPdf } from "../../pdf";
import {
  CommissionAudience,
  lensFor,
  monthLabel,
  monthReport,
  YearMonth,
} from "../../utils";

interface CommissionsPdfResponse {
  commissions_pdf: { rows: CommissionRow[] };
}

interface Props {
  /** Vendedor de quem é o papel; `null` quando é o próprio (vendedor logado). */
  sellerId: string | null;
  month: YearMonth;
  sellerName: string | null;
  /**
   * Gestor: recebe os dois níveis na mesma linha e escolhe qual imprimir. O
   * vendedor tem um nível só — o dele — e nem menu precisa.
   */
  canManage: boolean;
  /** Enquanto as comissões carregam, não há o que exportar. */
  disabled?: boolean;
}

/**
 * Baixa o fechamento de comissões do mês exibido: o que há a receber, o que já
 * entrou, o previsto e — em seções próprias — os boletos que o cliente pagou no
 * mês e os que viraram calote.
 *
 * **São dois papéis, e o gestor escolhe qual.** A mesma parcela vale dois
 * números: o que a fábrica paga ao escritório e o que o escritório repassa ao
 * vendedor — em meses que nem sempre coincidem, porque o vendedor é pago no
 * ciclo dele. O *fechamento do escritório* é o que se põe ao lado da planilha
 * da fábrica (é dela que vêm os blocos por fábrica e a coluna da nota); o
 * *extrato do vendedor* é o que se entrega a ele. Emitir só um dos dois deixava
 * metade do trabalho sem papel — e, quando era o do vendedor, os subtotais por
 * fábrica não batiam com nada que a fábrica tivesse mandado.
 *
 * As linhas são buscadas no clique, e são TODAS as do vendedor, não as da tela.
 * A tela mostra um mês; as duas seções de boleto seguem a data do boleto, que
 * quase nunca coincide com o mês em que a comissão cai (ver
 * `COMMISSIONS_PDF_QUERY`). Por isso o papel também ignora o painel de filtros:
 * ele é o fechamento do mês inteiro, não um retrato do que está na tela.
 */
export function CommissionsPdfButton({
  sellerId,
  month,
  sellerName,
  canManage,
  disabled = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  // Logo e nome da representação no cabeçalho do documento.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();
  const [fetchRows] = useLazyQuery<CommissionsPdfResponse>(
    COMMISSIONS_PDF_QUERY,
    { fetchPolicy: "network-only" }
  );

  const generate = async (audience: CommissionAudience) => {
    setBusy(true);
    try {
      const { data } = await fetchRows({ variables: { sellerId } });
      // A ótica do papel decide o valor, a data e a situação de cada linha —
      // e os rótulos do fechamento. Antes o relatório de um vendedor somava a
      // comissão do escritório: o nome da pessoa no cabeçalho e o dinheiro da
      // empresa nas colunas.
      const lens = lensFor(audience, canManage);
      const report = monthReport(data?.commissions_pdf.rows ?? [], month, lens);

      // Um PDF só com o cabeçalho não serve a ninguém — e some com o mês em que
      // havia movimento, que é onde o gestor queria estar.
      if (
        report.count === 0 &&
        report.defaulted.length === 0 &&
        report.settled.length === 0
      ) {
        toast({
          variant: "warning",
          title: "Nada a listar neste mês",
          description: `Não há comissões nem boletos em ${monthLabel(month)}. Use as setas para escolher outro mês.`,
        });
        return;
      }

      await exportCommissionsPdf(
        report,
        { month, sellerName, companyName, companyLogoUrl },
        lens
      );
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível gerar o PDF",
        description: "Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  // O vendedor tem um papel só: o dele. Um menu de uma opção seria um clique a
  // mais para chegar ao mesmo lugar.
  if (!canManage) {
    return (
      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        noUppercase
        loading={busy}
        disabled={disabled}
        onClick={() => generate("seller")}
      >
        <Button.Icon icon={FileText} />
        <Button.Title>Baixar PDF do mês</Button.Title>
      </Button.Root>
    );
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild disabled={disabled || busy}>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          loading={busy}
          disabled={disabled}
        >
          <Button.Icon icon={FileText} />
          <Button.Title>Baixar PDF do mês</Button.Title>
          <Button.Icon icon={ChevronDown} />
        </Button.Root>
      </Dropdown.Trigger>

      <Dropdown.Content align="start">
        {/* O rótulo diz para que serve cada papel: o nome sozinho ("vendedor",
            "escritório") não distingue dois documentos que têm o mesmo desenho
            e mudam só no dinheiro. */}
        <Dropdown.Label>De quem é o dinheiro</Dropdown.Label>
        <Dropdown.Item icon={Building2} onSelect={() => generate("office")}>
          Fechamento do escritório — conferir com a fábrica
        </Dropdown.Item>
        <Dropdown.Item icon={UserRound} onSelect={() => generate("seller")}>
          Extrato do vendedor — a fatia dele, no ciclo dele
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
