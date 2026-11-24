import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, File, Trash } from "lucide-react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputHint } from "./Hint";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ICON_SIZE } from "@/components/Icon";
import { formatFileSize } from "@/utils/format/fileSize";

export interface InputArchiveProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  variant?: "single" | "multi";
  value?: File[]; // Always handle as an array internally to simplify tracking
  onChange?: (files: File[]) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  maxFiles?: number;
  maxSizeMb?: number;
}

export const InputArchive = React.forwardRef<
  HTMLInputElement,
  InputArchiveProps
>(
  (
    {
      variant = "single",
      value = [],
      onChange,
      label,
      hint,
      error,
      className,
      disabled,
      maxFiles,
      maxSizeMb = 10, // Default 10mb limit per file
      accept,
      required,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Sync external refs
    const setRefs = useCallback(
      (node: HTMLInputElement) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref]
    );

    const processFiles = (incomingFiles: FileList | File[]) => {
      setLocalError(null);
      const newFiles = Array.from(incomingFiles);

      // Validate max length for single
      if (variant === "single" && newFiles.length > 1) {
        setLocalError("Selecione apenas 1 arquivo.");
        return;
      }

      // Validate total length for multi + maxFiles
      if (
        variant === "multi" &&
        maxFiles &&
        value.length + newFiles.length > maxFiles
      ) {
        setLocalError(`Máximo de ${maxFiles} arquivos permitidos.`);
        return;
      }

      // Check max size
      const maxBytes = maxSizeMb * 1024 * 1024;
      const overSized = newFiles.filter((f) => f.size > maxBytes);
      if (overSized.length > 0) {
        setLocalError(`Arquivos devem ter tamanho máximo de ${maxSizeMb}MB.`);
        return;
      }

      let payload = newFiles;
      if (variant === "multi") {
        payload = [...value, ...newFiles];
      } else {
        payload = [newFiles[0]]; // Guarantee just one
      }

      onChange?.(payload);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input value to allow uploading the same file again if removed
      e.target.value = "";
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    };

    const handleRemoveFile = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange?.(newValues);
    };

    return (
      <InputRoot required={required} id={props.id}>
        {label && <InputLabel>{label}</InputLabel>}

        <div
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-(--r-md) border-2 border-dashed bg-(--bg) p-6 transition-colors",
            isDragging
              ? "border-(--amber) bg-(--amber-bg)" // Active drag state mapped to amber (system primary conceptual action)
              : "border-(--border) hover:border-(--color-text-muted)",
            error &&
              "border-(--color-status-danger) bg-(--color-status-danger-bg)",
            disabled &&
              "cursor-not-allowed border-(--border) bg-(--bg3) hover:border-(--border) [&_*]:text-(--color-text-disabled)",
            className
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) inputRef.current?.click();
          }}
        >
          <input
            {...props}
            type="file"
            ref={setRefs}
            onChange={handleFileChange}
            accept={accept}
            multiple={variant === "multi"}
            disabled={disabled}
            className="hidden" // Invisible input
          />

          <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "rounded-full p-3",
                isDragging
                  ? "bg-(--amber) text-(--color-on-action)"
                  : "bg-(--bg2) text-(--color-text-disabled)"
              )}
            >
              <UploadCloud size={ICON_SIZE.xl} />
            </div>
            <div>
              <Title variant="body-md" weight="semibold" className="mt-2">
                Clique para selecionar ou arraste até aqui
              </Title>
              <Title variant="body-sm" color="muted" className="mt-1">
                {accept ? `Arquivos suportados: ${accept}` : "Qualquer arquivo"}
              </Title>
              <Title variant="body-xs" color="muted2" className="mt-1">
                {variant === "single"
                  ? "Anexar apenas 1 arquivo"
                  : maxFiles
                    ? `Até ${maxFiles} arquivos`
                    : "Anexar arquivos múltiplos"}{" "}
                (Max. {maxSizeMb}MB)
              </Title>
            </div>
          </div>
        </div>

        {/* Selected Files Visualization List */}
        {value.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {value.map((file, idx) => (
              <Card.Root key={`${file.name}-${idx}`} inset>
                <Card.Body
                  padding="sm"
                  className="flex-row items-center justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <File
                      size={ICON_SIZE.sm}
                      className="shrink-0 text-(--color-text-secondary)"
                    />
                    <div className="flex min-w-0 flex-col">
                      <Title
                        variant="body"
                        weight="medium"
                        className="[overflow-wrap:anywhere]"
                      >
                        {file.name}
                      </Title>
                      <Title variant="body-xs" color="muted">
                        {formatFileSize(file.size)}
                      </Title>
                    </div>
                  </div>

                  <Button.Root
                    type="button"
                    appearance="ghost"
                    color="neutral"
                    size="sm"
                    isIconOnly
                    label={`Remover ${file.name}`}
                    onClick={(e) => handleRemoveFile(idx, e)}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    <Button.Icon icon={Trash} />
                  </Button.Root>
                </Card.Body>
              </Card.Root>
            ))}
          </div>
        )}

        {(error || localError) && (
          <Title variant="micro" color="red" weight="medium" className="mt-1">
            {error || localError}
          </Title>
        )}

        {hint && !error && !localError && <InputHint>{hint}</InputHint>}
      </InputRoot>
    );
  }
);

InputArchive.displayName = "InputArchive";
