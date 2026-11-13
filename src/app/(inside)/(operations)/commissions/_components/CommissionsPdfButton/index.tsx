"use client";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import {
  Building2,
  ChevronDown,
  FileText,
  Mail,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { exportCommissionsPdf } from "../../pdf";
import { CommissionAudience, YearMonth } from "../../utils";
import { useMonthReport } from "./useMonthReport";
import { useSendStatement } from "./useSendStatement";

interface Props {
  /**
   * Vendedor de quem é o papel. `null` em dois casos: o vendedor logado (o
   * papel é o dele, e o backend já recorta) e o gestor na ótica do escritório,
   * em que a tela soma a empresa inteira — ali o fechamento é da casa, e o
   * extrato individual não tem a quem ser entregue.
   */
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
 * O papel ignora o painel de filtros: é o fechamento do mês inteiro, não um
 * retrato do que está na tela (ver `useMonthReport`). O extrato também pode ir
 * direto ao email do vendedor (`useSendStatement`), anexado.
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
  const buildReport = useMonthReport(sellerId, month, canManage);
  const { sendStatement, isSending } = useSendStatement(
    sellerId,
    month,
    sellerName
  );
  const working = busy || isSending;

  const generate = async (audience: CommissionAudience) => {
    setBusy(true);
    try {
      const built = await buildReport(audience);
      if (!built) return;
      await exportCommissionsPdf(
        built.report,
        { month, sellerName, companyName, companyLogoUrl },
        built.lens
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
      <Dropdown.Trigger asChild disabled={disabled || working}>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          loading={working}
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
        {/* Sem vendedor escolhido não há extrato: o papel leva o nome de uma
            pessoa no cabeçalho e é entregue a ela. Somar a fatia de todos sob
            o título "extrato do vendedor" seria um documento que não é de
            ninguém — por isso a opção fica travada, dizendo o que fazer. */}
        <Dropdown.Item
          icon={UserRound}
          disabled={!sellerId}
          onSelect={() => generate("seller")}
        >
          {sellerId
            ? "Extrato do vendedor — a fatia dele, no ciclo dele"
            : "Extrato do vendedor — troque “Valores de” para Vendedor e escolha um"}
        </Dropdown.Item>
        {/* O mesmo extrato, anexado ao email de login do vendedor. A resposta
            dele volta para quem enviou. */}
        {sellerId && (
          <Dropdown.Item icon={Mail} onSelect={() => void sendStatement()}>
            Enviar o extrato ao vendedor por email
          </Dropdown.Item>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
