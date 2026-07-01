import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { FormFieldSchema } from "../interface";
import { renderInput } from "./utils";

interface FormBuilderFieldProps {
  field: FormFieldSchema;
  namePrefix?: string;
}

export const Field = ({ field, namePrefix }: FormBuilderFieldProps) => {
  const { control, setValue } = useFormContext();

  const fieldName = namePrefix ? `${namePrefix}.${field.name}` : field.name;

  // Resolve responsive grid mapping
  const mobileCol = field.grid?.mobile
    ? `col-span-${field.grid.mobile}`
    : "col-span-12";
  const mdCol = field.grid?.tablet
    ? `tablet:col-span-${field.grid.tablet}`
    : "";
  const lgCol = field.grid?.desktop
    ? `desktop:col-span-${field.grid.desktop}`
    : "";

  return (
    <div className={cn(mobileCol, mdCol, lgCol, "w-full")}>
      <Controller
        name={fieldName}
        control={control}
        render={({ field: controllerField, fieldState }) => {
          return renderInput({
            field,
            controllerField,
            error: fieldState.error?.message,
            setValue,
          });
        }}
      />
    </div>
  );
};
