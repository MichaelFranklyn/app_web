import * as yup from "yup";
import { FormFieldSchema, FormStepSchema } from "../interface";

const createFieldValidator = (field: FormFieldSchema) => {
  let validator: yup.AnySchema = yup.string();

  switch (field.type) {
    case "text":
    case "textarea":
    case "password":
      validator = yup.string();
      if ("minLength" in field && field.minLength != null) {
        validator = (validator as yup.StringSchema).min(
          field.minLength as number,
          `Mínimo ${field.minLength} caracteres`
        );
      }
      if ("maxLength" in field && field.maxLength != null) {
        validator = (validator as yup.StringSchema).max(
          field.maxLength as number,
          `Máximo ${field.maxLength} caracteres`
        );
      }
      break;

    case "email":
      validator = yup.string().email("Email inválido");
      break;

    case "number":
      validator = yup
        .number()
        .typeError("Deve ser um número")
        .transform((value) =>
          Number.isNaN(value) || value === null ? undefined : value
        )
        .nullable();
      break;

    case "date":
      validator = yup
        .date()
        .typeError(
          `${
            field.labelText ??
            (typeof field.label === "string" && field.label
              ? field.label
              : "Data")
          } é obrigatória`
        )
        .nullable();
      break;

    case "date-range":
      validator = yup
        .object({
          from: yup.date().nullable().required("Data inicial é obrigatória"),
          to: yup.date().nullable().required("Data final é obrigatória"),
        })
        .test(
          "range-order",
          "Data final deve ser depois da inicial",
          function (value) {
            if (!value?.from || !value?.to) return false;
            return value.from <= value.to;
          }
        )
        .nullable();
      break;

    case "checkbox":
    case "switch":
    case "select-multi":
      validator = yup.array().of(yup.mixed()).nullable();
      if (field.required) {
        validator = (
          validator as yup.ArraySchema<
            yup.AnySchema[] | undefined,
            yup.AnyObject
          >
        ).min(1, "Selecione ao menos uma opção");
      }
      break;

    case "archive-single":
    case "archive-multi":
      validator = yup.array().of(yup.mixed()).nullable();
      if (field.required) {
        validator = (
          validator as yup.ArraySchema<
            yup.AnySchema[] | undefined,
            yup.AnyObject
          >
        ).min(1, "Selecione ao menos um arquivo");
      }
      break;

    case "radio":
    case "select-single":
      validator = yup.mixed().nullable();
      break;

    default:
      validator = yup.string();
  }

  if (field.required) {
    // Label pode ser JSX (ex: texto + HelpTooltip); só dá pra concatenar string.
    const labelText =
      field.labelText ??
      (typeof field.label === "string" ? field.label : undefined);
    const msg = labelText
      ? `${labelText} é obrigatório`
      : "Este campo é obrigatório";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validator = (validator as any).required(msg);
  }

  return validator;
};

// Schema é montado dinamicamente a partir dos steps, então o shape não é
// conhecido estaticamente — `any` é necessário para o resolver genérico do RHF.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BuiltSchema = yup.ObjectSchema<any>;

export const buildYupSchema = (steps: FormStepSchema[]): BuiltSchema => {
  const schemaFields: Record<string, yup.AnySchema> = {};

  steps.forEach((step) => {
    step.sections?.forEach((section) => {
      if (section.isRepeatable && section.name) {
        const sectionShape: Record<string, yup.AnySchema> = {};
        section.fields?.forEach((field) => {
          sectionShape[field.name] = createFieldValidator(field);
        });

        schemaFields[section.name] = yup
          .array()
          .of(yup.object().shape(sectionShape))
          .min(1, "Adicione pelo menos um item nesta seção")
          .nullable();
      } else {
        section.fields?.forEach((field) => {
          schemaFields[field.name] = createFieldValidator(field);
        });
      }
    });
  });

  return yup.object().shape(schemaFields);
};
