import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, File, Trash } from "lucide-react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputHint } from "./Hint";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

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

    const formatBytes = (bytes: number, decimals = 2) => {
      if (!+bytes) return "0 Bytes";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

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
      <InputRoot>
        {label && <InputLabel>{label}</InputLabel>}

        <div
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-(--r-md) border-2 border-dashed bg-(--bg) p-6 transition-colors",
            isDragging
              ? "border-(--amber) bg-(--amber-bg)" // Active drag state mapped to amber (system primary conceptual action)
              : "border-(--border) hover:border-(--muted)",
            error && "border-(--red) bg-(--red-bg)",
            disabled && "cursor-not-allowed opacity-50",
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
                  ? "bg-(--amber) text-white"
                  : "bg-(--bg2) text-(--muted2)"
              )}
            >
              <UploadCloud size={24} />
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
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between rounded-(--r-md) border border-(--border) bg-(--bg2) px-12 py-10"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <File size={14} className="shrink-0 text-(--text2)" />
                  <div className="flex flex-col overflow-hidden">
                    <Title variant="body" weight="medium" className="truncate">
                      {file.name}
                    </Title>
                    <Title variant="body-xs" color="muted">
                      {formatBytes(file.size)}
                    </Title>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemoveFile(idx, e)}
                  disabled={disabled}
                  className="ml-2 shrink-0 cursor-pointer rounded-full p-2 text-(--muted2) transition-colors hover:bg-(--red-bg) hover:text-(--red) disabled:opacity-50"
                  title="Remover arquivo"
                >
                  <Trash size={14} />
                </button>
              </div>
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
