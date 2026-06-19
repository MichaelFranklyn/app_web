import { Input, InputLabel } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Title } from "@/components/Title";
import { maskCEP, maskCNPJ, maskCPF, maskCurrency, maskPhoneBR } from "@/utils/format/masks";
import React from "react";
import { RenderInputProps } from "../interface";

export const renderInput = ({
  field,
  controllerField,
  error,
  setValue,
}: RenderInputProps) => {
  const commonProps = {
    ...controllerField,
    id: field.id || field.name,
    name: field.name,
    disabled: typeof field.disabled === "boolean" ? field.disabled : false,
    error: error,
    label: field.label,
    hint: field.hint,
    placeholder: field.placeholder,
    addon: field.addon,
  };

  switch (field.type) {
    case "text":
    case "email":
    case "password":
      const textProps = { ...commonProps, value: controllerField.value ?? "" };
      if (field.type === "password") {
        return <Input.Password {...textProps} />;
      }
      if (field.type === "email") {
        return <Input.Email {...textProps} />;
      }
      return <Input.Text {...textProps} />;

    case "textarea":
      return (
        <Input.Textarea
          {...commonProps}
          value={controllerField.value ?? ""}
          rows={field.rows || 3}
          maxLength={field.maxLength}
        />
      );

    case "number":
      return (
        <Input.Number {...commonProps} value={controllerField.value ?? ""} />
      );

    case "date":
    case "date-range":
      return (
        <Input.Date
          {...commonProps}
          variant={field.type === "date-range" ? "range" : "single"}
        />
      );

    case "select-single":
    case "select-multi":
      const isMulti = field.type === "select-multi";
      return (
        <Input.Select
          {...commonProps}
          onChange={(val: SelectOption | SelectOption[] | null) => {
            controllerField.onChange(val);
            field.onChange?.(val, setValue);
          }}
          value={controllerField.value ?? (isMulti ? [] : "")}
          variant={isMulti ? "multi" : "single"}
          options={field.options || []}
          onCreateOption={field.onCreateOption}
        />
      );

    case "checkbox":
      return (
        <div className="flex flex-col gap-5">
          {field.label && <InputLabel>{field.label}</InputLabel>}
          <div className="flex flex-wrap gap-16">
            {field.options?.map((opt) => (
              <Input.Checkbox
                key={opt.value}
                label={opt.label}
                name={`${field.name}_${opt.value}`}
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

    case "radio":
      return (
        <div className="flex flex-col gap-5">
          {field.label && <InputLabel>{field.label}</InputLabel>}
          <div className="flex flex-wrap gap-16">
            {field.options?.map((opt) => (
              <Input.Radio
                key={opt.value}
                label={opt.label}
                name={field.name}
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

    case "switch":
      return (
        <div className="flex flex-col gap-2">
          {field.label && (
            <label className="text-[13px] font-medium text-(--text2)">
              {field.label}
            </label>
          )}
          <div className="flex flex-wrap gap-4">
            {field.options?.map((opt) => (
              <Input.Toggle
                key={opt.value}
                label={opt.label}
                name={`${field.name}_${opt.value}`}
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

    case "cpf":
      return (
        <Input.Text
          {...commonProps}
          value={maskCPF(controllerField.value ?? "")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            controllerField.onChange(maskCPF(e.target.value))
          }
          maxLength={14}
          inputMode="numeric"
        />
      );

    case "cnpj":
      return (
        <Input.Text
          {...commonProps}
          value={maskCNPJ(controllerField.value ?? "")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            controllerField.onChange(maskCNPJ(e.target.value))
          }
          maxLength={18}
          inputMode="numeric"
        />
      );

    case "phone":
      return (
        <Input.Text
          {...commonProps}
          value={maskPhoneBR(controllerField.value ?? "")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            controllerField.onChange(maskPhoneBR(e.target.value))
          }
          maxLength={15}
          inputMode="tel"
        />
      );

    case "cep":
      return (
        <Input.Text
          {...commonProps}
          value={maskCEP(controllerField.value ?? "")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const masked = maskCEP(e.target.value);
            controllerField.onChange(masked);
            field.onChange?.(masked, setValue);
          }}
          maxLength={9}
          inputMode="numeric"
        />
      );

    case "currency":
      return (
        <Input.Text
          {...commonProps}
          value={maskCurrency(controllerField.value ?? "")}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            controllerField.onChange(maskCurrency(e.target.value))
          }
          inputMode="numeric"
          addon="R$"
        />
      );

    case "archive-single":
    case "archive-multi":
      const isMultiArchive = field.type === "archive-multi";
      return (
        <Input.Archive
          {...commonProps}
          value={
            Array.isArray(controllerField.value) ? controllerField.value : []
          }
          variant={isMultiArchive ? "multi" : "single"}
          maxFiles={field.maxFiles}
          maxSizeMb={field.maxSizeMb}
          accept={field.accept}
        />
      );

    default:
      return <div className="text-[12px] text-(--red)">Tipo não suportado</div>;
  }
};
