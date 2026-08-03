import { SelectOption } from "@/components/Input";

import { PaymentTermMinimum } from "../orderDraftItems";

export interface PaymentTermChoices {
  options: SelectOption[];
  /**
   * Piso da condição escolhida — null quando a condição não tem piso ou quando
   * nenhuma foi escolhida ainda. Alimenta o aviso do passo de itens.
   */
  minimumOf: (termId: string | null | undefined) => PaymentTermMinimum | null;
}
