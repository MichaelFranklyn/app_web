export interface CreateTaxRuleResponse {
  createTaxRule: {
    status: boolean;
    message: string;
  };
}

export interface AddTaxRuleModalProps {
  onAddOptimistic: (rule: { id: string; name: string }) => void;
  onDone: () => void;
}
