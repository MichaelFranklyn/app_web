"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { mediaUrl } from "@/utils/media";
import { ImagePlus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoUploadProps } from "./interface";
import { svgToPng } from "./svgToPng";

// SVG entra na lista: é o formato em que a maioria das logos existe. Ele é
// convertido em PNG aqui no navegador (ver svgToPng) — o backend só aceita
// imagem raster.
const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";
const MAX_SIZE_MB = 2;

/**
 * Envio da logo com preview: mostra a logo salva, deixa trocar por uma nova
 * (preview local antes de salvar) ou remover. O arquivo só vira base64 na hora
 * de salvar — ver {@link useLogoUpload}.
 */
export function LogoUpload({
  currentUrl,
  value,
  onChange,
  label = "Logo",
  hint = "PNG, JPG, WEBP ou SVG de até 2 MB.",
  initials,
  disabled,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview do arquivo escolhido agora; o object URL é revogado ao trocar/sair.
  useEffect(() => {
    if (!value.file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value.file]);

  const savedUrl = value.cleared ? undefined : mediaUrl(currentUrl);
  const shown = preview ?? savedUrl;

  const handleSelect = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`A logo deve ter no máximo ${MAX_SIZE_MB} MB.`);
      return;
    }
    const prepared = await svgToPng(file);
    if (!prepared) {
      setError("Não foi possível ler este SVG. Envie um PNG, JPG ou WEBP.");
      return;
    }
    setError(null);
    onChange({ file: prepared, cleared: false });
  };

  const handleRemove = () => {
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    // Só marca remoção se havia algo salvo; senão basta descartar a escolha.
    onChange({ file: null, cleared: Boolean(currentUrl) });
  };

  return (
    <div className="flex flex-col gap-8">
      <Title variant="label" color="muted">
        {label}
      </Title>

      <div className="flex items-center gap-16">
        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-(--border) bg-(--bg2)">
          {shown ? (
            // URL de upload (blob local ou origem da API): next/image exigiria
            // remotePatterns e dimensões fixas — <img> é intencional aqui.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={label}
              className="h-full w-full object-contain"
            />
          ) : initials ? (
            <Title variant="body-md" weight="bold" color="muted">
              {initials}
            </Title>
          ) : (
            <ImagePlus size={24} className="text-(--muted)" />
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-8">
            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              noUppercase
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <Button.Icon icon={ImagePlus} />
              <Button.Title>{shown ? "Trocar" : "Enviar imagem"}</Button.Title>
            </Button.Root>

            {shown && (
              <Button.Root
                type="button"
                appearance="ghost"
                color="red"
                size="sm"
                noUppercase
                disabled={disabled}
                onClick={handleRemove}
              >
                <Button.Icon icon={Trash} />
                <Button.Title>Remover</Button.Title>
              </Button.Root>
            )}
          </div>

          <Title variant="body-xs" color={error ? "red" : "muted"}>
            {error ?? hint}
          </Title>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => handleSelect(event.target.files?.[0])}
      />
    </div>
  );
}

export { useLogoUpload } from "./useLogoUpload";
export type { LogoInput, LogoValue } from "./interface";
