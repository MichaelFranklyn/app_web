import { SelectOption } from "@/components/Input";

import { PaymentTermMinimum } from "../orderDraftItems";

export interface PaymentTermChoices {
  options: SelectOption[];
  /**
   * Piso da condição escolhida — null quando a condição não tem piso ou quando
   * nenhuma foi escolhida ainda. Alimenta o aviso do passo de itens.
   */
  minimumOf: (termId: string | null | undefined) => PaymentTermMinimum | null;
  /**
   * Id da condição a partir do NOME dela — é assim que a ficha de pedido
   * offline a guarda, já que ela é preenchida sem internet.
   */
  idByName: (name: string) => string | null;
  /**
   * Condições ainda a caminho. Sem isto, "lista vazia" é ambíguo: pode ser
   * fábrica sem condição cadastrada ou a query em voo — e quem preenche por
   * código (a ficha de pedido) esperaria para sempre.
   */
  loading: boolean;
}
