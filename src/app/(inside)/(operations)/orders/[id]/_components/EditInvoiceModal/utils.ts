import { OrderInstallment } from "../../interface";

/** Parcela com alguma baixa: boleto pago ou comissão já recebida. */
export const isSettled = (installment: OrderInstallment) =>
  Boolean(
    installment.paidAt ||
    installment.status === "PAID" ||
    installment.isCommissionReceived
  );

/**
 * Frase do aviso: o que exatamente se perde ao refazer as parcelas. Espelha a
 * contagem do backend para o usuário ver o mesmo número antes e depois.
 */
export function describeSettlements(installments: OrderInstallment[]) {
  const paid = installments.filter(
    (i) => i.paidAt || i.status === "PAID"
  ).length;
  const received = installments.filter((i) => i.isCommissionReceived).length;

  const parts: string[] = [];
  if (paid)
    parts.push(paid === 1 ? "1 parcela paga" : `${paid} parcelas pagas`);
  if (received) {
    parts.push(
      received === 1 ? "1 comissão recebida" : `${received} comissões recebidas`
    );
  }
  if (parts.length === 0) return "";
  return parts.join(" e ");
}
