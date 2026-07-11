import { useState } from "react";

import { ColumnChoice } from "@/utils/import/columns";

import { MappingState } from "../../../_shared/productImportMapping";
import { TaxColumn, TierColumn } from "./interface";
import { EMPTY_ST_MVA, StMvaChoices } from "./StMvaFields";
import { PriceListTemplateConfig } from "./templateConfig";
import { GuessedColumns, looksLikeFraction } from "./wizardGuess";

const INITIAL_TIER: TierColumn = { id: "t1", columnIndex: null, tierName: "" };

/**
 * Domínio de mapeamento do wizard de importação: como cada coluna da planilha
 * vira campo do produto (base), nível de preço, IPI, NCM e demais impostos, além
 * das duas convenções (preço por peça e alíquota em fração).
 *
 * Concentra o estado + os dois handlers "inteligentes" (que inferem a convenção
 * de fração a partir das linhas) e os aplicadores de palpite/modelo. Recebe
 * `rows` porque a inferência de fração depende dos valores reais da grade.
 */
export function useMappingState(rows: string[][]) {
  const [mapping, setMapping] = useState<MappingState>({});
  const [tierColumns, setTierColumns] = useState<TierColumn[]>([]);
  const [ipiChoice, setIpiChoice] = useState<ColumnChoice>({ kind: "none" });
  // O sistema guarda alíquota percentual (3,25); planilhas costumam trazer
  // fração decimal (0,0325). Conversão ×100 feita no backend.
  const [ipiAsFraction, setIpiAsFraction] = useState(false);
  const [ncmChoice, setNcmChoice] = useState<ColumnChoice>({ kind: "none" });
  const [taxColumns, setTaxColumns] = useState<TaxColumn[]>([]);
  const [stMva, setStMva] = useState<StMvaChoices>(EMPTY_ST_MVA);
  // Mesma semântica do IPI, para os demais impostos (rate/MVA/crédito/interna).
  const [taxesAsFraction, setTaxesAsFraction] = useState(false);
  // Planilhas de fábrica costumam trazer preço por peça; o sistema armazena
  // sempre o preço da embalagem fechada (conversão feita no backend).
  const [pricesPerUnit, setPricesPerUnit] = useState(false);

  const handleIpiChoice = (choice: ColumnChoice) => {
    setIpiChoice(choice);
    if (choice.kind !== "none")
      setIpiAsFraction(looksLikeFraction(choice, rows));
  };

  // Sugere a semântica dos demais impostos pela alíquota interna do ST (no
  // padrão das planilhas, todas as colunas fiscais seguem a mesma convenção).
  const handleStMvaChange = (next: StMvaChoices) => {
    setStMva(next);
    if (next.internalRate.kind !== "none") {
      setTaxesAsFraction(looksLikeFraction(next.internalRate, rows));
    }
  };

  // Aplica os palpites da grade (colunas fiscais + convenções), reiniciando os
  // níveis para um degrau em branco. O cabeçalho/base fica com o orquestrador.
  const applyGuess = (guessed: GuessedColumns) => {
    setIpiChoice(guessed.ipiChoice);
    setIpiAsFraction(guessed.ipiAsFraction);
    setNcmChoice(guessed.ncmChoice);
    setStMva(guessed.stMva);
    setTaxesAsFraction(guessed.taxesAsFraction);
    setTierColumns([{ ...INITIAL_TIER }]);
  };

  // Aplica o mapeamento salvo no modelo da fábrica (parte de mapeamento; o
  // `headerIndex` continua no orquestrador, que também é dono da grade).
  const applyConfig = (cfg: PriceListTemplateConfig) => {
    setMapping(cfg.mapping ?? {});
    setTierColumns(
      cfg.tierColumns?.length ? cfg.tierColumns : [{ ...INITIAL_TIER }]
    );
    setIpiChoice(cfg.ipiChoice ?? { kind: "none" });
    setIpiAsFraction(!!cfg.ipiAsFraction);
    setNcmChoice(cfg.ncmChoice ?? { kind: "none" });
    setTaxColumns(cfg.taxColumns ?? []);
    setStMva(cfg.stMva ?? EMPTY_ST_MVA);
    setPricesPerUnit(!!cfg.pricesPerUnit);
    setTaxesAsFraction(!!cfg.taxesAsFraction);
  };

  const reset = () => {
    setMapping({});
    setTierColumns([]);
    setIpiChoice({ kind: "none" });
    setIpiAsFraction(false);
    setNcmChoice({ kind: "none" });
    setTaxColumns([]);
    setStMva(EMPTY_ST_MVA);
    setTaxesAsFraction(false);
    setPricesPerUnit(false);
  };

  return {
    mapping,
    setMapping,
    tierColumns,
    setTierColumns,
    ipiChoice,
    handleIpiChoice,
    ipiAsFraction,
    setIpiAsFraction,
    ncmChoice,
    setNcmChoice,
    taxColumns,
    setTaxColumns,
    stMva,
    handleStMvaChange,
    taxesAsFraction,
    setTaxesAsFraction,
    pricesPerUnit,
    setPricesPerUnit,
    applyGuess,
    applyConfig,
    reset,
  };
}
