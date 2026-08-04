import { SelectOption } from "@/components/Input";

import { GoalRow } from "../../interface";

export interface SetGoalModalProps {
  /** Mês da meta em ISO ("2026-08-01"). */
  periodMonthIso: string;
  /** Linha em edição; ausente = definir uma meta nova. */
  row?: GoalRow;
  /** Vendedor já escolhido na tela (some o campo quando definido). */
  fixedSellerId?: string | null;
  sellerOptions: SelectOption[];
  factoryOptions: SelectOption[];
  onSaved: () => void;
  /** Gatilho próprio (o padrão é um botão "Definir meta"). */
  trigger?: React.ReactNode;
}

export interface SetGoalResponse {
  setSellerGoal: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

export interface DeleteGoalResponse {
  deleteSellerGoal: { status: boolean; message: string };
}
