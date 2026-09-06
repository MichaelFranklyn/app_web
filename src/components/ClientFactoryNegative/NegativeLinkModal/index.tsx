"use client";

import { ClearNegativeModal } from "../ClearNegativeModal";
import { MarkNegativeModal } from "../MarkNegativeModal";
import { NegativeLinkModalProps } from "../interface";

/**
 * O modal da negativação, já escolhido pelo estado do vínculo: marcar quando
 * está livre, retirar quando está negativado.
 *
 * Existe para que as telas tenham UMA ação ("negativação deste vínculo") em vez
 * de decidirem entre dois componentes toda vez — as duas o abrem do mesmo jeito,
 * de um item de menu que já muda de rótulo pelo mesmo booleano.
 */
export function NegativeLinkModal({
  isNegative,
  negativeSince = null,
  ...props
}: NegativeLinkModalProps) {
  if (isNegative) {
    return <ClearNegativeModal {...props} negativeSince={negativeSince} />;
  }
  return <MarkNegativeModal {...props} />;
}
