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

/**
 * Campos de imagem aceitos pelas mutations (updateCompany /
 * updateCompanyFactory). `avatar*` só existe na empresa, que tem duas imagens:
 * a logo completa (documentos) e o símbolo (avatar do sistema).
 */
export interface LogoInput {
  logoBase64?: string;
  logoFileName?: string | null;
  avatarBase64?: string;
  avatarFileName?: string | null;
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
