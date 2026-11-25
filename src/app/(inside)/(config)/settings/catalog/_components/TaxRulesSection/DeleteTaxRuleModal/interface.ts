export interface DeleteTaxRuleResponse {
  deleteTaxRule: {
    status: boolean;
    message: string;
  };
}

export interface DeleteTaxRuleModalProps {
  ruleId: string;
  ruleName: string;
  /** Produtos com alíquota desta regra — perdem a alíquota na exclusão. */
  productCount: number;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
