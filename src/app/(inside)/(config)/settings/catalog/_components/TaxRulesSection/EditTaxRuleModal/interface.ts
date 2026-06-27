export interface UpdateTaxRuleResponse {
  updateTaxRule: {
    status: boolean;
    message: string;
  };
}

export interface EditTaxRuleModalProps {
  rule: { id: string; name: string };
  onUpdateOptimistic: (id: string, updates: { name: string }) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
