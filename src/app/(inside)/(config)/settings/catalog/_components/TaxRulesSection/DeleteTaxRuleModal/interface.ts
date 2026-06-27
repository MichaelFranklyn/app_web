export interface DeleteTaxRuleResponse {
  deleteTaxRule: {
    status: boolean;
    message: string;
  };
}

export interface DeleteTaxRuleModalProps {
  ruleId: string;
  ruleName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
