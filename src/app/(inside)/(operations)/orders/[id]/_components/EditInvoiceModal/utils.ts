import { OrderInstallment } from "../../interface";

/**
 * Parcela com alguma baixa — apagá-la exige confirmação e motivo.
 *
 * Não recalcula nada: lê `hasSettlement`, decidido no servidor. A régua que
 * vivia aqui ignorava a conferência e o repasse ao vendedor, e a tela liberava
 * o que o servidor recusava (ou o servidor deixava passar, no caso do repasse).
 */
export const isSettled = (installment: OrderInstallment) =>
  installment.hasSettlement;

/** Espelha `MIN_REASON_LENGTH` de `order_invoice_reversals/recorder.py`. */
export const MIN_REVERSAL_REASON_LENGTH = 5;

/** O motivo diz alguma coisa? ("ok" e espaços não explicam o que foi apagado.) */
export const isValidReversalReason = (reason: string): boolean =>
  reason.trim().replace(/\s+/g, " ").length >= MIN_REVERSAL_REASON_LENGTH;
