/**
 * Estado de edição de uma logo. Três situações possíveis:
 * - `file` preenchido → logo nova escolhida agora (o preview vem dela);
 * - `cleared` true → a logo salva foi marcada para remoção;
 * - ambos vazios → nada mudou (mantém a que está salva).
 */
export interface LogoValue {
  file: File | null;
  cleared: boolean;
}

/** Campo de imagem que a mutation espera — decide o prefixo dos dois inputs. */
export type LogoField = "logo" | "avatar" | "image";

/**
 * Campos de imagem aceitos pelas mutations. `avatar*` só existe na empresa, que
 * tem duas imagens (a logo completa dos documentos e o símbolo do sistema);
 * `image*` é a foto do produto, que usa o mesmo caminho de upload.
 */
export interface LogoInput {
  logoBase64?: string;
  logoFileName?: string | null;
  avatarBase64?: string;
  avatarFileName?: string | null;
  imageBase64?: string;
  imageFileName?: string | null;
}

export interface LogoUploadProps {
  /** URL da logo já salva (caminho relativo devolvido pela API). */
  currentUrl?: string | null;
  value: LogoValue;
  onChange: (value: LogoValue) => void;
  label?: string;
  hint?: string;
  /** Iniciais exibidas quando não há logo (ex.: as do nome da empresa). */
  initials?: string;
  disabled?: boolean;
}
