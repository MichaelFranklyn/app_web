"use client";

import { ColumnChoice } from "@/utils/import/columns";
import { FieldMapper } from "@/components/Import";

export interface StMvaChoices {
  mva: ColumnChoice;
  icmsCredit: ColumnChoice;
  internalRate: ColumnChoice;
}

export const EMPTY_ST_MVA: StMvaChoices = {
  mva: { kind: "none" },
  icmsCredit: { kind: "none" },
  internalRate: { kind: "none" },
};

/** ST está configurado quando os três componentes têm origem definida. */
export const isStMvaComplete = (st: StMvaChoices): boolean =>
  st.mva.kind !== "none" &&
  st.icmsCredit.kind !== "none" &&
  st.internalRate.kind !== "none";

export const isStMvaPartial = (st: StMvaChoices): boolean =>
  !isStMvaComplete(st) &&
  (st.mva.kind !== "none" ||
    st.icmsCredit.kind !== "none" ||
    st.internalRate.kind !== "none");

interface Props {
  headers: string[];
  value: StMvaChoices;
  onChange: (value: StMvaChoices) => void;
}

/** Os três componentes do ST por MVA — o container (card/título) é de quem usa. */
export function StMvaFields({ headers, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-12">
      <FieldMapper
        label="MVA"
        help="Margem de valor agregado do produto (ex.: 0,45 ou 45). MVA zero = produto fora do regime de ST."
        headers={headers}
        choice={value.mva}
        onChange={(mva) => onChange({ ...value, mva })}
      />
      <FieldMapper
        label="Crédito de ICMS"
        help="ICMS destacado na origem, abatido do ST (ex.: 0,205 ou 20,5)."
        headers={headers}
        choice={value.icmsCredit}
        onChange={(icmsCredit) => onChange({ ...value, icmsCredit })}
      />
      <FieldMapper
        label="Alíquota interna"
        help="Alíquota interna do estado de destino (ex.: 0,205 ou 20,5)."
        headers={headers}
        choice={value.internalRate}
        onChange={(internalRate) => onChange({ ...value, internalRate })}
      />
    </div>
  );
}
