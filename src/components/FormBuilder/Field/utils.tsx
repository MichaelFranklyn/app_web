import { Input, InputLabel, RequiredMark } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
import {
  maskCEP,
  maskCNPJ,
  maskCPF,
  maskCurrency,
  maskPhoneBR,
} from "@/utils/format/masks";
import React from "react";
import {
  FieldConfigArchive,
  FieldConfigCheckbox,
  FieldConfigRadio,
  FieldConfigSelect,
  FieldConfigSwitch,
  FieldConfigTextarea,
  FieldType,
  RenderInputProps,
} from "../interface";
import { parseLocalDate } from "@/utils/format/date";

const getCommonProps = ({
  field,
  controllerField,
  error,
}: RenderInputProps) => ({
  ...controllerField,
  id: field.id || field.name,
  name: field.name,
  disabled: typeof field.disabled === "boolean" ? field.disabled : false,
  error,
  label: field.label,
  // Mesmo `required` que o buildYupSchema usa para exigir preenchimento: a
  // marca visual sai da regra de validação, nunca de uma segunda lista que
  // pudesse divergir dela.
  required: field.required,
  hint: field.hint,
  placeholder: field.placeholder,
  addon: field.addon,
});

type CommonProps = ReturnType<typeof getCommonProps>;

/** Renderer de um `field.type`, já com os props comuns calculados. */
type FieldRenderer = (
  props: RenderInputProps,
  common: CommonProps
) => React.ReactElement;

/**
 * Fábrica dos inputs de texto mascarado (CPF, CNPJ, telefone, CEP, moeda), que
 * só diferem na máscara e em alguns limites — antes eram 5 `case` quase idênticos.
 * @param propagate CEP dispara `field.onChange` (auto-preenche endereço).
 */
const maskedText = (
  mask: (value: string) => string,
  opts: {
    maxLength?: number;
    inputMode?: "numeric" | "tel";
    addon?: React.ReactNode;
    propagate?: boolean;
  }
): FieldRenderer =>
  function MaskedText({ field, controllerField, setValue }, common) {
    return (
      <Input.Text
        {...common}
        value={mask(controllerField.value ?? "")}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const masked = mask(e.target.value);
          controllerField.onChange(masked);
          if (opts.propagate) field.onChange?.(masked, setValue);
        }}
        maxLength={opts.maxLength}
        inputMode={opts.inputMode}
        addon={opts.addon ?? common.addon}
      />
    );
  };

const renderText: FieldRenderer = ({ field, controllerField }, common) => {
  const textProps = { ...common, value: controllerField.value ?? "" };
  if (field.type === "password") return <Input.Password {...textProps} />;
  if (field.type === "email") return <Input.Email {...textProps} />;
  return <Input.Text {...textProps} />;
};

const renderTextarea: FieldRenderer = ({ field, controllerField }, common) => {
  const f = field as FieldConfigTextarea;
  return (
    <Input.Textarea
      {...common}
      value={controllerField.value ?? ""}
      rows={f.rows || 3}
      maxLength={f.maxLength}
    />
  );
};

const renderNumber: FieldRenderer = ({ controllerField }, common) => (
  <Input.Number {...common} value={controllerField.value ?? ""} />
);

const renderDate: FieldRenderer = ({ field, controllerField }, common) => (
  <Input.Date
    {...common}
    // `Input.Date` trabalha com Date; o `initialData` costuma vir do backend como
    // ISO ("1958-03-12"). Sem converter, o campo abria VAZIO mesmo havendo data
    // salva — e salvar em seguida apagava o valor. `parseLocalDate` monta o Date
    // pelos componentes locais, senão UTC-3 exibiria o dia anterior.
    value={
      field.type === "date-range"
        ? controllerField.value
        : parseLocalDate(controllerField.value)
    }
    variant={field.type === "date-range" ? "range" : "single"}
  />
);

const renderSelect: FieldRenderer = (
  { field, controllerField, setValue },
  common
) => {
  const f = field as FieldConfigSelect;
  const isMulti = f.type === "select-multi";
  return (
    <Input.Select
      {...common}
      onChange={(val: SelectOption | SelectOption[] | null) => {
        controllerField.onChange(val);
        f.onChange?.(val, setValue);
      }}
      value={controllerField.value ?? (isMulti ? [] : "")}
      variant={isMulti ? "multi" : "single"}
      options={f.options || []}
      onCreateOption={f.onCreateOption}
      onSearch={f.onSearch}
      loading={f.loading}
    />
  );
};

const renderCheckbox: FieldRenderer = ({ field, controllerField, error }) => {
  const f = field as FieldConfigCheckbox;
  return (
    <div className="flex flex-col gap-5">
      {f.label && <InputLabel required={f.required}>{f.label}</InputLabel>}
      <div className="flex flex-wrap gap-16">
        {f.options?.map((opt) => (
          <Input.Checkbox
            key={opt.value}
            label={opt.label}
            name={`${f.name}_${opt.value}`}
            checked={
              Array.isArray(controllerField.value) &&
              controllerField.value.some(
                (val: { value: string; label: string }) =>
                  (val?.value ?? val) === opt.value
              )
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const currentValue = Array.isArray(controllerField.value)
                ? controllerField.value
                : [];
              if (e.target.checked) {
                controllerField.onChange([...currentValue, opt]);
              } else {
                controllerField.onChange(
                  currentValue.filter(
                    (val: { value: string; label: string }) =>
                      (val?.value ?? val) !== opt.value
                  )
                );
              }
            }}
          />
        ))}
      </div>
      {error && (
        <Title variant="micro" color="red">
          {error}
        </Title>
      )}
    </div>
  );
};

const renderRadio: FieldRenderer = ({ field, controllerField, error }) => {
  const f = field as FieldConfigRadio;
  return (
    <div className="flex flex-col gap-5">
      {f.label && <InputLabel required={f.required}>{f.label}</InputLabel>}
      <div className="flex flex-wrap gap-16">
        {f.options?.map((opt) => (
          <Input.Radio
            key={opt.value}
            label={opt.label}
            name={f.name}
            checked={
              (controllerField.value?.value ?? controllerField.value) ===
              opt.value
            }
            onChange={() => controllerField.onChange(opt)}
          />
        ))}
      </div>
      {error && (
        <Title variant="micro" color="red">
          {error}
        </Title>
      )}
    </div>
  );
};

const renderSwitch: FieldRenderer = ({ field, controllerField, error }) => {
  const f = field as FieldConfigSwitch;
  return (
    <div className="flex flex-col gap-2">
      {f.label && (
        <label className="text-[13px] font-medium text-(--text2)">
          {f.label}
          {f.required && <RequiredMark />}
        </label>
      )}
      <div className="flex flex-wrap gap-4">
        {f.options?.map((opt) => (
          <Input.Toggle
            key={opt.value}
            label={opt.label}
            name={`${f.name}_${opt.value}`}
            checked={
              Array.isArray(controllerField.value) &&
              controllerField.value.includes(opt.value)
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const currentValue = Array.isArray(controllerField.value)
                ? controllerField.value
                : [];
              if (e.target.checked) {
                controllerField.onChange([...currentValue, opt.value]);
              } else {
                controllerField.onChange(
                  currentValue.filter((val) => val !== opt.value)
                );
              }
            }}
          />
        ))}
      </div>
      {error && (
        <Title variant="micro" color="red">
          {error}
        </Title>
      )}
    </div>
  );
};

const renderArchive: FieldRenderer = ({ field, controllerField }, common) => {
  const f = field as FieldConfigArchive;
  return (
    <Input.Archive
      {...common}
      value={Array.isArray(controllerField.value) ? controllerField.value : []}
      variant={f.type === "archive-multi" ? "multi" : "single"}
      maxFiles={f.maxFiles}
      maxSizeMb={f.maxSizeMb}
      accept={f.accept}
    />
  );
};

/** Mapa `field.type` → renderer. Substitui o antigo `switch` de ~18 casos. */
const RENDERERS: Record<FieldType, FieldRenderer> = {
  text: renderText,
  email: renderText,
  password: renderText,
  textarea: renderTextarea,
  number: renderNumber,
  date: renderDate,
  "date-range": renderDate,
  "select-single": renderSelect,
  "select-multi": renderSelect,
  checkbox: renderCheckbox,
  radio: renderRadio,
  switch: renderSwitch,
  "archive-single": renderArchive,
  "archive-multi": renderArchive,
  cpf: maskedText(maskCPF, { maxLength: 14, inputMode: "numeric" }),
  cnpj: maskedText(maskCNPJ, { maxLength: 18, inputMode: "numeric" }),
  phone: maskedText(maskPhoneBR, { maxLength: 15, inputMode: "tel" }),
  cep: maskedText(maskCEP, {
    maxLength: 9,
    inputMode: "numeric",
    propagate: true,
  }),
  currency: maskedText(maskCurrency, { inputMode: "numeric", addon: "R$" }),
};

export const renderInput = (props: RenderInputProps) => {
  const renderer = RENDERERS[props.field.type];
  if (!renderer) {
    return <div className="text-[13px] text-(--red)">Tipo não suportado</div>;
  }
  return renderer(props, getCommonProps(props));
};
