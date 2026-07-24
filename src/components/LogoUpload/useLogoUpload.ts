"use client";

import { fileToBase64 } from "@/utils/file";
import { useCallback, useState } from "react";
import { LogoInput, LogoValue } from "./interface";

export const EMPTY_LOGO: LogoValue = { file: null, cleared: false };

/**
 * Estado de edição de uma imagem + tradução para os campos da mutation.
 *
 * O envio é base64 (mesmo caminho dos outros uploads do sistema, que passam
 * pelo BFF); `<field>Base64: ""` é o sinal combinado com o backend para REMOVER
 * a imagem atual — por isso remover e "não mexer" são estados distintos.
 *
 * `field` existe porque a empresa tem DUAS imagens no mesmo formulário: a logo
 * completa (`logoBase64`) e o símbolo do avatar (`avatarBase64`).
 */
export function useLogoUpload(field: "logo" | "avatar" = "logo") {
  const [value, setValue] = useState<LogoValue>(EMPTY_LOGO);

  const reset = useCallback(() => setValue(EMPTY_LOGO), []);

  /** Campos da imagem para o input da mutation ({} quando nada mudou). */
  const toLogoInput = useCallback(async (): Promise<LogoInput> => {
    const base64Key = `${field}Base64` as const;
    const nameKey = `${field}FileName` as const;
    if (value.file) {
      return {
        [base64Key]: await fileToBase64(value.file),
        [nameKey]: value.file.name,
      };
    }
    if (value.cleared) return { [base64Key]: "", [nameKey]: null };
    return {};
  }, [value, field]);

  return { value, onChange: setValue, reset, toLogoInput };
}
